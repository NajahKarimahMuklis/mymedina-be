import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { Order } from '../orders/entities/order.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { Shipment } from './entities/shipment.entity';

/**
 * Shipments Service
 *
 * OOP Concepts:
 * - Encapsulation: Business logic encapsulated in service
 * - Single Responsibility: Handles only shipment-related operations
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access through TypeORM repositories
 * - Dependency Injection: Dependencies injected via constructor
 */
@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Create Shipment
   * Creates shipment for a paid order
   */
  async buatPengiriman(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const { orderId, kurir, layanan, nomorResi, biaya } = createShipmentDto;

    // Get order
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    // Validate order status (must be PAID or PROCESSING)
    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Order dengan status ${order.status} tidak dapat dikirim`,
      );
    }

    // Check if shipment already exists
    const existingShipment = await this.shipmentRepository.findOne({
      where: { orderId },
    });

    if (existingShipment) {
      throw new BadRequestException('Order ini sudah memiliki pengiriman');
    }

    // Create shipment
    const shipment = this.shipmentRepository.create({
      orderId,
      kurir,
      layanan,
      nomorResi,
      biaya,
      status: ShipmentStatus.PENDING,
    });

    // Update order status to PROCESSING
    if (order.status === OrderStatus.PAID) {
      order.status = OrderStatus.PROCESSING;
      await this.orderRepository.save(order);
    }

    return await this.shipmentRepository.save(shipment);
  }

  /**
   * Get Shipment by Order ID
   */
  async ambilPengirimanByOrderId(orderId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { orderId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman untuk order ${orderId} tidak ditemukan`,
      );
    }

    return shipment;
  }

  /**
   * Get Shipment by ID
   */
  async ambilPengirimanById(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman dengan ID ${shipmentId} tidak ditemukan`,
      );
    }

    return shipment;
  }

  /**
   * Update Shipment Status
   * Updates shipment status and order status accordingly
   */
  async updateStatusPengiriman(
    shipmentId: string,
    updateShipmentStatusDto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['order'],
    });

    if (!shipment) {
      throw new NotFoundException(
        `Pengiriman dengan ID ${shipmentId} tidak ditemukan`,
      );
    }

    const { status, nomorResi } = updateShipmentStatusDto;

    // Update shipment status
    shipment.status = status;

    if (nomorResi) {
      shipment.nomorResi = nomorResi;
    }

    // Update timestamps based on status
    if (status === ShipmentStatus.SHIPPED) {
      shipment.dikirimPada = new Date();

      // Update order status to SHIPPED
      const order = shipment.order;
      order.status = OrderStatus.SHIPPED;
      await this.orderRepository.save(order);
    } else if (status === ShipmentStatus.DELIVERED) {
      shipment.diterimaPada = new Date();

      // Update order status to COMPLETED
      const order = shipment.order;
      order.status = OrderStatus.COMPLETED;
      order.diselesaikanPada = new Date();
      await this.orderRepository.save(order);
    }

    return await this.shipmentRepository.save(shipment);
  }
}

