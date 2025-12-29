import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Address Entity
 */
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========================================
  // USER RELATIONSHIP
  // ========================================

  @ManyToOne(() => User, (user) => user.addresses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // ========================================
  // ADDRESS INFORMATION
  // ========================================

  /**
   * Label untuk address (e.g., "Rumah", "Kantor", "Gudang")
   */
  @Column({ length: 50, nullable: true })
  label: string;

  /**
   * Nama penerima
   */
  @Column({ name: 'receiver_name', length: 255 })
  namaPenerima: string;

  /**
   * Nomor telepon penerima
   * Format: 08xx atau +62xx
   */
  @Column({ name: 'receiver_phone', length: 20 })
  teleponPenerima: string;

  /**
   * Alamat baris 1 (jalan, nomor rumah, dll)
   */
  @Column({ name: 'address_line1', type: 'text' })
  alamatBaris1: string;

  /**
   * Alamat baris 2 (optional - kompleks, blok, dll)
   */
  @Column({ name: 'address_line2', type: 'text', nullable: true })
  alamatBaris2: string;

  /**
   * Kota/Kabupaten
   */
  @Column({ length: 100 })
  kota: string;

  /**
   * Provinsi
   */
  @Column({ length: 100 })
  provinsi: string;

  /**
   * Kode pos
   */
  @Column({ name: 'postal_code', length: 10 })
  kodePos: string;

  /**
   * Koordinat GPS (optional)
   */
  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  latitude: number;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
  })
  longitude: number;

  // ========================================
  // FLAGS
  // ========================================

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ default: true })
  aktif: boolean;

  // ========================================
  // TIMESTAMPS
  // ========================================

  @CreateDateColumn({ name: 'created_at' })
  dibuatPada: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  diupdatePada: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  dihapusPada: Date;

  // ========================================
  // METHODS
  // ========================================

  setAsDefault(): void {
    this.isDefault = true;
  }

  getAlamatLengkap(): string {
    const parts = [this.alamatBaris1];

    if (this.alamatBaris2) {
      parts.push(this.alamatBaris2);
    }

    parts.push(this.kota, this.provinsi, this.kodePos);

    return parts.filter((part) => part && part.trim()).join(', ');
  }
}
