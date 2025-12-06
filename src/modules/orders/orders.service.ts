import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { User } from '../auth/entities/user.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

/**
 * Orders Service
 *
 * OOP Concepts:
 * - Encapsulation: Business logic encapsulated in service
 * - Single Responsibility: Handles only order-related operations
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access through TypeORM repositories
 * - Dependency Injection: Dependencies injected via constructor
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXXX
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get count of orders today
    const count = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.nomorOrder LIKE :pattern', { pattern: `ORD-${dateStr}-%` })
      .getCount();

    const sequence = String(count + 1).padStart(5, '0');
    return `ORD-${dateStr}-${sequence}`;
  }

  /**
   * Create Order (Checkout)
   * Stateless cart: receives cart data from frontend
   */
  async buatOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, alamatPengiriman, tipe, ongkosKirim, catatan } = createOrderDto;

    // Validate items not empty
    if (!items || items.length === 0) {
      throw new BadRequestException('Order harus memiliki minimal 1 item');
    }

    // Get user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    // Prepare order items with product snapshot
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      // Get variant with product relation
      const variant = await this.productVariantRepository.findOne({
        where: { id: item.productVariantId },
        relations: ['product'],
      });

      if (!variant) {
        throw new NotFoundException(
          `Product variant dengan ID ${item.productVariantId} tidak ditemukan`,
        );
      }

      if (!variant.aktif) {
        throw new BadRequestException(
          `Product variant ${variant.sku} tidak aktif`,
        );
      }

      // Check stock
      if (variant.stok < item.kuantitas) {
        throw new BadRequestException(
          `Stok tidak cukup untuk ${variant.product.nama} (${variant.ukuran}, ${variant.warna}). Stok tersedia: ${variant.stok}`,
        );
      }

      // Calculate price (use override if exists, otherwise use product base price)
      const price = variant.hargaOverride || variant.product.hargaDasar;
      const itemSubtotal = price * item.kuantitas;
      subtotal += itemSubtotal;

      // Create order item with snapshot
      const orderItem = this.orderItemRepository.create({
        productId: variant.product.id,
        variantId: variant.id,
        namaProduk: variant.product.nama,
        skuVariant: variant.sku,
        ukuranVariant: variant.ukuran,
        warnaVariant: variant.warna,
        kuantitas: item.kuantitas,
        hargaSnapshot: price,
        subtotal: itemSubtotal,
      });

      orderItems.push(orderItem);

      // Reduce stock
      variant.stok -= item.kuantitas;
      await this.productVariantRepository.save(variant);
    }

    // Calculate total
    const total = subtotal + ongkosKirim;

    // Generate order number
    const nomorOrder = await this.generateOrderNumber();

    // Create order
    const order = this.orderRepository.create({
      nomorOrder,
      user, // Use User entity instead of userId
      tipe,
      status: OrderStatus.PENDING_PAYMENT,
      subtotal,
      ongkosKirim,
      total,
      catatan,
      namaPenerima: alamatPengiriman.namaPenerima,
      teleponPenerima: alamatPengiriman.teleponPenerima,
      alamatBaris1: alamatPengiriman.alamatBaris1,
      alamatBaris2: alamatPengiriman.alamatBaris2,
      kota: alamatPengiriman.kota,
      provinsi: alamatPengiriman.provinsi,
      kodePos: alamatPengiriman.kodePos,
      items: orderItems,
    });

    return await this.orderRepository.save(order);
  }

  /**
   * Get My Orders (Customer)
   */
  async ambilOrderSaya(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.variant', 'user'],
      order: { dibuatPada: 'DESC' },
    });
  }

  /**
   * Get Order by ID
   */
  async ambilOrderById(orderId: string, userId: string, isAdmin: boolean): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'items.variant', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    // Check authorization: only owner or admin can view
    if (!isAdmin && order.user.id !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke order ini');
    }

    return order;
  }

  /**
   * Get All Orders (Admin)
   */
  async ambilSemuaOrder(
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.dibuatPada', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Update Order Status (Admin)
   */
  async updateStatusOrder(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.variant'],
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    const { status } = updateOrderStatusDto;

    // Validate status transition
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order yang sudah dibatalkan tidak dapat diubah');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order yang sudah selesai tidak dapat diubah');
    }

    // Update status
    order.status = status;

    // Update timestamps based on status
    if (status === OrderStatus.PAID) {
      order.dibayarPada = new Date();
    } else if (status === OrderStatus.COMPLETED) {
      order.diselesaikanPada = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      order.dibatalkanPada = new Date();

      // Restore stock when order is cancelled
      for (const item of order.items) {
        const variant = item.variant;
        variant.stok += item.kuantitas;
        await this.productVariantRepository.save(variant);
      }
    }

    return await this.orderRepository.save(order);
  }
}
