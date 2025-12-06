import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderType } from '../../../common/enums/order-type.enum';

/**
 * Order Entity
 *
 * OOP Concepts:
 * - Encapsulation: Order data and behavior in one class
 * - Abstraction: Hides database implementation details
 * - Data Modeling: Represents Order table in database
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: ClassDiagram-MyMedina-v4-SIMPLIFIED.puml
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (Order)
 * - Properties: Bahasa Indonesia (nomorOrder, userId, etc.)
 * - Database columns: English snake_case (order_number, user_id, etc.)
 */
@Entity('orders')
export class Order {
  // ========================================
  // PRIMARY KEY
  // ========================================

  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // BASIC FIELDS
  // ========================================

  @Column({ name: 'order_number', unique: true, length: 50 })
  nomorOrder: string;

  // Note: userId is managed by the @ManyToOne relation below
  // Do not add a separate @Column for user_id as it conflicts with @JoinColumn

  @Column({
    type: 'enum',
    enum: OrderType,
  })
  tipe: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  // ========================================
  // PRICING FIELDS
  // ========================================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal: number;

  @Column({
    name: 'shipping_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  ongkosKirim: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  total: number;

  // ========================================
  // ADDITIONAL FIELDS
  // ========================================

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ name: 'estimated_delivery', type: 'timestamp', nullable: true })
  estimasiPengiriman: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  dibayarPada: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  diselesaikanPada: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  dibatalkanPada: Date;

  // ========================================
  // ADDRESS SNAPSHOT (Denormalized)
  // ========================================

  @Column({ name: 'receiver_name', length: 255 })
  namaPenerima: string;

  @Column({ name: 'receiver_phone', length: 20 })
  teleponPenerima: string;

  @Column({ name: 'address_line1', type: 'text' })
  alamatBaris1: string;

  @Column({ name: 'address_line2', type: 'text', nullable: true })
  alamatBaris2: string;

  @Column({ length: 100 })
  kota: string;

  @Column({ length: 100 })
  provinsi: string;

  @Column({ name: 'postal_code', length: 10 })
  kodePos: string;

  // ========================================
  // TIMESTAMPS
  // ========================================

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * User Relationship
   * Setiap order belongs to satu user
   */
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * OrderItems Relationship
   * Setiap order memiliki banyak order items
   */
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];
}

