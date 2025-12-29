import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

/**
 * Reports Service - Analytics dan Report Generation
 * Hanya untuk Sales Report (Owner)
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Generate Sales Report
   */
  async generateSalesReport(startDate: Date, endDate: Date) {
    // Set endDate to end of day (23:59:59)
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // Revenue statuses (orders that count as revenue)
    const revenueStatuses = [
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.COMPLETED,
    ];

    // Total sales dari orders yang sudah dibayar
    const totalSalesResult = await this.orderRepository
      .createQueryBuilder('ord')
      .select('COUNT(ord.id)', 'totalTransactions')
      .addSelect('SUM(ord.total)', 'totalRevenue')
      .where('ord.status IN (:...statuses)', { statuses: revenueStatuses })
      .andWhere(
        'COALESCE(ord.dibayarPada, ord.dibuatPada) BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate: adjustedEndDate,
        },
      )
      .getRawOne();

    // Sales by payment method
    const salesByMethod = await this.orderRepository
      .createQueryBuilder('ord')
      .select('ord.metodePembayaran', 'method')
      .addSelect('COUNT(ord.id)', 'count')
      .addSelect('SUM(ord.total)', 'total')
      .where('ord.status IN (:...statuses)', { statuses: revenueStatuses })
      .andWhere(
        'COALESCE(ord.dibayarPada, ord.dibuatPada) BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate: adjustedEndDate,
        },
      )
      .groupBy('ord.metodePembayaran')
      .getRawMany();

    // Daily sales
    const dailySales = await this.orderRepository
      .createQueryBuilder('ord')
      .select(
        "TO_CHAR(COALESCE(ord.dibayarPada, ord.dibuatPada), 'YYYY-MM-DD')",
        'date',
      )
      .addSelect('COUNT(ord.id)', 'count')
      .addSelect('SUM(ord.total)', 'total')
      .where('ord.status IN (:...statuses)', { statuses: revenueStatuses })
      .andWhere(
        'COALESCE(ord.dibayarPada, ord.dibuatPada) BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate: adjustedEndDate,
        },
      )
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Product sales - dari order items yang ordernya sudah dibayar
    const productSales = await this.orderRepository
      .createQueryBuilder('ord')
      .leftJoin('ord.items', 'item')
      .select('item.namaProduct', 'productName')
      .addSelect('SUM(item.kuantitas)', 'quantitySold')
      .addSelect('SUM(item.subtotal)', 'totalRevenue')
      .where('ord.status IN (:...statuses)', { statuses: revenueStatuses })
      .andWhere(
        'COALESCE(ord.dibayarPada, ord.dibuatPada) BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate: adjustedEndDate,
        },
      )
      .groupBy('item.namaProduct')
      .orderBy('SUM(item.subtotal)', 'DESC')
      .limit(10) // Top 10 products
      .getRawMany();

    return {
      period: {
        startDate,
        endDate: adjustedEndDate,
      },
      summary: {
        totalTransactions: parseInt(
          totalSalesResult?.totalTransactions || '0',
          10,
        ),
        totalRevenue: parseFloat(totalSalesResult?.totalRevenue || '0'),
      },
      salesByMethod: salesByMethod.map((item) => ({
        method: item.method || 'Unknown',
        count: parseInt(item.count || '0', 10),
        total: parseFloat(item.total || '0'),
      })),
      dailySales: dailySales.map((item) => ({
        date: item.date,
        count: parseInt(item.count || '0', 10),
        total: parseFloat(item.total || '0'),
      })),
      productSales: productSales.map((item) => ({
        productName: item.productName || 'Unknown Product',
        quantitySold: parseInt(item.quantitySold || '0', 10),
        totalRevenue: parseFloat(item.totalRevenue || '0'),
      })),
    };
  }
}
