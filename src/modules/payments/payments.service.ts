import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as midtransClient from 'midtrans-client';
import { Repository } from 'typeorm';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { Order } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Payment } from './entities/payment.entity';

/**
 * Payments Service
 *
 * OOP Concepts:
 * - Encapsulation: Business logic encapsulated in service
 * - Single Responsibility: Handles only payment-related operations
 *
 * Design Patterns:
 * - Service Pattern: Business logic layer
 * - Repository Pattern: Data access through TypeORM repositories
 * - Dependency Injection: Dependencies injected via constructor
 *
 * Midtrans Integration:
 * - Uses Midtrans Snap API for payment gateway
 * - Supports multiple payment methods (Bank Transfer, QRIS, E-Wallet, Credit Card)
 */
@Injectable()
export class PaymentsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private snap: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    // Initialize Midtrans Snap Client
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }

  /**
   * Generate unique transaction ID
   * Format: TRX-YYYYMMDD-XXXXX
   */
  private async generateTransactionId(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get count of payments today
    const count = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.transactionId LIKE :pattern', {
        pattern: `TRX-${dateStr}-%`,
      })
      .getCount();

    const sequence = String(count + 1).padStart(5, '0');
    return `TRX-${dateStr}-${sequence}`;
  }

  /**
   * Create Payment
   * Initiates payment for an order
   */
  async buatPembayaran(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { orderId, metode } = createPaymentDto;

    // Get order with relations
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }

    // Validate order status
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Order dengan status ${order.status} tidak dapat dibayar`,
      );
    }

    // Check if there's already a pending payment
    const existingPayment = await this.paymentRepository.findOne({
      where: {
        orderId,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment) {
      throw new BadRequestException(
        'Order ini sudah memiliki pembayaran yang sedang pending',
      );
    }

    // Generate transaction ID
    const transactionId = await this.generateTransactionId();

    // Calculate expiry (24 hours from now)
    const kadaluarsaPada = new Date();
    kadaluarsaPada.setHours(kadaluarsaPada.getHours() + 24);

    // Format start_time for Midtrans expiry (yyyy-MM-dd hh:mm:ss Z)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const startTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} +0700`;

    // Prepare item_details array (must include ALL items + shipping)
    const itemDetails = [
      // Product items
      ...order.items.map((item) => ({
        id: item.variantId,
        price: Math.round(Number(item.hargaSnapshot)),
        quantity: item.kuantitas,
        name: `${item.namaProduk} - ${item.ukuranVariant} ${item.warnaVariant}`,
      })),
      // Shipping cost as separate item
      {
        id: 'SHIPPING',
        price: Math.round(Number(order.ongkosKirim)),
        quantity: 1,
        name: 'Ongkos Kirim',
      },
    ];

    // Prepare Midtrans transaction parameters
    const parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: Math.round(Number(order.total)),
      },
      customer_details: {
        first_name: order.namaPenerima,
        email: order.user.email,
        phone: order.teleponPenerima,
        billing_address: {
          first_name: order.namaPenerima,
          phone: order.teleponPenerima,
          address: order.alamatBaris1,
          city: order.kota,
          postal_code: order.kodePos,
          country_code: 'IDN',
        },
        shipping_address: {
          first_name: order.namaPenerima,
          phone: order.teleponPenerima,
          address: order.alamatBaris1,
          city: order.kota,
          postal_code: order.kodePos,
          country_code: 'IDN',
        },
      },
      item_details: itemDetails,
      // Don't restrict payment methods in Sandbox - let Midtrans show all available options
      // In production, you can enable specific methods based on `metode` parameter
      expiry: {
        start_time: startTime,
        unit: 'hours',
        duration: 24,
      },
    };

    try {
      // Call Midtrans Snap API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const midtransResponse = await this.snap.createTransaction(parameter);

      // Create payment with Midtrans response
      const payment = this.paymentRepository.create({
        orderId,
        transactionId,
        metode,
        status: PaymentStatus.PENDING,
        jumlah: order.total,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        urlPembayaran: midtransResponse.redirect_url, // Real Midtrans payment URL
        kadaluarsaPada,
        diinisiasiPada: new Date(),
      });

      return await this.paymentRepository.save(payment);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const errorMessage = error?.message || 'Unknown error';
      throw new BadRequestException(
        `Gagal membuat pembayaran: ${errorMessage}`,
      );
    }
  }

  /**
   * Map PaymentMethod enum to Midtrans payment type
   */
  private mapPaymentMethodToMidtrans(metode: PaymentMethod): string {
    const mapping = {
      [PaymentMethod.BANK_TRANSFER]: 'bank_transfer',
      [PaymentMethod.QRIS]: 'qris',
      [PaymentMethod.E_WALLET]: 'gopay',
      [PaymentMethod.CREDIT_CARD]: 'credit_card',
    };

    return mapping[metode] || 'bank_transfer';
  }

  /**
   * Get Payment by Order ID
   */
  async ambilPembayaranByOrderId(orderId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { orderId },
      relations: ['order'],
      order: { dibuatPada: 'DESC' },
    });
  }

  /**
   * Get Payment by ID
   */
  async ambilPembayaranById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan ID ${paymentId} tidak ditemukan`,
      );
    }

    return payment;
  }

  /**
   * Get Payment by Transaction ID
   * Used for webhook processing
   */
  async ambilPembayaranByTransactionId(
    transactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan transaction ID ${transactionId} tidak ditemukan`,
      );
    }

    return payment;
  }

  /**
   * Update Payment Status
   * Updates payment status and order status accordingly
   */
  async updateStatusPembayaran(
    paymentId: string,
    updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment dengan ID ${paymentId} tidak ditemukan`,
      );
    }

    const { status, webhookPayload, signatureKey } = updatePaymentStatusDto;

    // Update payment status
    payment.status = status;

    if (webhookPayload) {
      payment.webhookPayload = webhookPayload;
    }

    if (signatureKey) {
      payment.signatureKey = signatureKey;
    }

    // Update settlement time if payment is successful
    if (status === PaymentStatus.SETTLEMENT) {
      payment.waktuPenyelesaian = new Date();

      // Update order status to PAID
      const order = payment.order;
      order.status = OrderStatus.PAID;
      order.dibayarPada = new Date();
      await this.orderRepository.save(order);
    }

    // If payment expired or cancelled, allow new payment attempt
    if (
      status === PaymentStatus.EXPIRE ||
      status === PaymentStatus.CANCEL ||
      status === PaymentStatus.DENY
    ) {
      // Order remains in PENDING_PAYMENT status
      // Customer can create new payment
    }

    return await this.paymentRepository.save(payment);
  }
}
