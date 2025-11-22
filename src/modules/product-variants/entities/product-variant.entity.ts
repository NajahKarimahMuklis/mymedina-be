import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

/**
 * ProductVariant Entity
 *
 * OOP Concepts:
 * - Encapsulation: Product variant data and relationships in one class
 * - Abstraction: Hides database implementation details
 * - Relationships: ManyToOne with Product
 *
 * Design Pattern:
 * - Active Record Pattern (via TypeORM)
 *
 * Based on: Database/schema-simplified.sql (product_variants table)
 *
 * Naming Convention: Hybrid Approach
 * - Class name: English (ProductVariant)
 * - Properties: Bahasa Indonesia (ukuran, warna, stok, etc.)
 * - Database columns: English snake_case (size, color, stock, etc.)
 */
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ unique: true, length: 100 })
  sku: string;

  @Column({ length: 50 })
  ukuran: string;

  @Column({ length: 50 })
  warna: string;

  @Column({ default: 0 })
  stok: number;

  @Column({
    name: 'price_override',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  hargaOverride: number;

  @Column({ default: true })
  aktif: boolean;

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  // ========================================
  // RELATIONSHIPS
  // ========================================

  /**
   * Product Relationship
   * Setiap variant belongs to satu produk
   */
  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'CASCADE', // Delete variants when product is deleted
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

