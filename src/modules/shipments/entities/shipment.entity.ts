import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ShipmentStatus } from '../../../common/enums/shipment-status.enum';

/**
 * Shipment Entity
 *
 * OOP Concepts:
 * - Encapsulation: Shipment data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents Shipment table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Shipment)
 * - Properties: Bahasa Indonesia (orderId, kurir, etc.)
 * - Database columns: English snake_case (order_id, courier, etc.)
 *
 * Note: One order has ONE shipment (OneToOne relationship)
 */
@Entity('shipments')
export class Shipment {
  // ========================================
  // PRIMARY KEY
  // ========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // FOREIGN KEY (UNIQUE - OneToOne)
  // ========================================

  @Column({ name: 'order_id', unique: true })
  orderId: string;

  // ========================================
  // SHIPMENT FIELDS
  // ========================================

  @Column({ length: 100, nullable: true })
  kurir: string;

  @Column({ length: 100, nullable: true })
  layanan: string;

  @Column({ name: 'tracking_number', length: 255, nullable: true })
  nomorResi: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  biaya: number;

  // ========================================
  // TIMESTAMPS
  // ========================================

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  dikirimPada: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  diterimaPada: Date;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Order Relationship
   * Setiap shipment belongs to satu order (OneToOne)
   */
  @OneToOne(() => Order, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}

