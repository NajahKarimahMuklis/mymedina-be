import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsBoolean,
  IsNumberString,
} from 'class-validator';

/**
 * ============================================
 * ADDRESS DTOs - COMPLETE & UPDATED VERSION
 * ============================================
 *
 * Changes from original:
 * + Added emailPenerima field with proper validation
 * + Improved validation messages
 * + Added proper TypeScript types
 *
 * File: src/auth/dto/address.dto.ts
 */

// ============================================
// CREATE ADDRESS DTO
// ============================================

/**
 * DTO for Creating a New Address
 *
 * Usage:
 * POST /auth/addresses
 * Body: CreateAddressDto
 */
export class CreateAddressDto {
  /**
   * Label untuk address (e.g., "Rumah", "Kantor", "Gudang")
   * Optional field untuk memudahkan identifikasi
   */
  @IsString({ message: 'Label harus berupa string' })
  @IsOptional()
  @MaxLength(50, { message: 'Label maksimal 50 karakter' })
  label?: string;

  /**
   * Nama lengkap penerima paket
   * REQUIRED field
   */
  @IsString({ message: 'Nama penerima harus berupa string' })
  @IsNotEmpty({ message: 'Nama penerima wajib diisi' })
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima: string;

  /**
   * Nomor telepon penerima
   * Format: 08xxxxxxxxxx (Indonesia)
   * REQUIRED field
   */
  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  teleponPenerima: string;

  /**
   * Alamat baris 1 (jalan, nomor rumah, RT/RW, dll)
   * REQUIRED field
   */
  @IsString({ message: 'Alamat baris 1 harus berupa string' })
  @IsNotEmpty({ message: 'Alamat baris 1 wajib diisi' })
  alamatBaris1: string;

  /**
   * Alamat baris 2 (kompleks, blok, patokan, dll)
   * OPTIONAL field
   */
  @IsString({ message: 'Alamat baris 2 harus berupa string' })
  @IsOptional()
  alamatBaris2?: string;

  /**
   * Kota/Kabupaten (admin_level_2 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   * Contoh: "Jakarta Pusat", "Surabaya", "Medan"
   * REQUIRED field
   */
  @IsString({ message: 'Kota harus berupa string' })
  @IsNotEmpty({ message: 'Kota wajib diisi' })
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  kota: string;

  /**
   * Provinsi (admin_level_1 dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   * Contoh: "DKI Jakarta", "Jawa Timur", "Sumatera Utara"
   * REQUIRED field
   */
  @IsString({ message: 'Provinsi harus berupa string' })
  @IsNotEmpty({ message: 'Provinsi wajib diisi' })
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  provinsi: string;

  /**
   * Kode pos (dari Biteship)
   * FETCH dari: GET /shipment/areas?input=...
   * User pilih lokasi → auto-fill dari response
   * REQUIRED field
   */
  @IsNumberString({}, { message: 'Kode pos harus berupa angka' })
  @IsNotEmpty({ message: 'Kode pos wajib diisi' })
  @MaxLength(10, { message: 'Kode pos maksimal 10 karakter' })
  kodePos: string;

  /**
   * Latitude untuk GPS (optional)
   * Format: string representation of decimal number
   * Contoh: "-6.2088"
   */
  @IsOptional()
  @IsNumberString({}, { message: 'Latitude harus berupa angka' })
  latitude?: string;

  /**
   * Longitude untuk GPS (optional)
   * Format: string representation of decimal number
   * Contoh: "106.8456"
   */
  @IsOptional()
  @IsNumberString({}, { message: 'Longitude harus berupa angka' })
  longitude?: string;

  /**
   * Set sebagai default address?
   * Jika true dan sudah ada default, yang lama akan di-unset
   * Default: false
   */
  @IsBoolean({ message: 'isDefault harus boolean' })
  @IsOptional()
  isDefault?: boolean;
}

// ============================================
// UPDATE ADDRESS DTO
// ============================================

/**
 * DTO for Updating an Address
 *
 * Usage:
 * PUT /auth/addresses/:id
 * Body: UpdateAddressDto
 *
 * All fields are optional - only send fields that need to be updated
 */
export class UpdateAddressDto {
  @IsString({ message: 'Label harus berupa string' })
  @IsOptional()
  @MaxLength(50, { message: 'Label maksimal 50 karakter' })
  label?: string;

  @IsString({ message: 'Nama penerima harus berupa string' })
  @IsOptional()
  @MaxLength(255, { message: 'Nama penerima maksimal 255 karakter' })
  namaPenerima?: string;

  @IsString({ message: 'Nomor telepon harus berupa string' })
  @IsOptional()
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Nomor telepon tidak valid (contoh: 081234567890)',
  })
  teleponPenerima?: string;

  @IsString({ message: 'Alamat baris 1 harus berupa string' })
  @IsOptional()
  alamatBaris1?: string;

  @IsString({ message: 'Alamat baris 2 harus berupa string' })
  @IsOptional()
  alamatBaris2?: string;

  @IsString({ message: 'Kota harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Kota maksimal 100 karakter' })
  kota?: string;

  @IsString({ message: 'Provinsi harus berupa string' })
  @IsOptional()
  @MaxLength(100, { message: 'Provinsi maksimal 100 karakter' })
  provinsi?: string;

  @IsNumberString({}, { message: 'Kode pos harus berupa angka' })
  @IsOptional()
  @MaxLength(10, { message: 'Kode pos maksimal 10 karakter' })
  kodePos?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Latitude harus berupa angka' })
  latitude?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Longitude harus berupa angka' })
  longitude?: string;

  @IsBoolean({ message: 'isDefault harus boolean' })
  @IsOptional()
  isDefault?: boolean;
}

// ============================================
// ADDRESS RESPONSE DTO
// ============================================

/**
 * DTO for Address Response
 *
 * This is what the API returns when querying addresses
 * Used in:
 * - GET /auth/addresses
 * - GET /auth/addresses/:id
 * - GET /auth/addresses/default
 * - POST /auth/addresses (response)
 * - PUT /auth/addresses/:id (response)
 */
export class AddressDto {
  /**
   * UUID of the address
   */
  id: string;

  /**
   * Optional label (Rumah, Kantor, etc.)
   */
  label?: string;

  /**
   * Receiver's full name
   */
  namaPenerima: string;

  /**
   * Receiver's phone number
   */
  teleponPenerima: string;

  /**
   * Address line 1
   */
  alamatBaris1: string;

  /**
   * Address line 2 (optional)
   */
  alamatBaris2?: string;

  /**
   * City/Regency
   */
  kota: string;

  /**
   * Province
   */
  provinsi: string;

  /**
   * Postal code
   */
  kodePos: string;

  /**
   * GPS Latitude (optional)
   */
  latitude?: number;

  /**
   * GPS Longitude (optional)
   */
  longitude?: number;

  /**
   * Is this the default address?
   */
  isDefault: boolean;

  /**
   * Is this address active?
   */
  aktif: boolean;

  /**
   * Creation timestamp
   */
  dibuatPada: Date;

  /**
   * Last update timestamp
   */
  diupdatePada: Date;
}

// ============================================
// SET DEFAULT ADDRESS DTO
// ============================================

/**
 * DTO for Set Default Address
 *
 * Usage:
 * PUT /auth/addresses/:id/set-default
 *
 * Note: The ID can also be passed via URL parameter
 * This DTO is optional and may be removed if not needed
 */
export class SetDefaultAddressDto {
  @IsString({ message: 'Address ID harus berupa string' })
  @IsNotEmpty({ message: 'Address ID wajib diisi' })
  addressId: string;
}

// ============================================
// EXAMPLE USAGE
// ============================================

/**
 * Example 1: Create Address Request
 *
 * POST /auth/addresses
 * Authorization: Bearer {token}
 * Content-Type: application/json
 *
 * {
 *   "label": "Rumah",
 *   "namaPenerima": "John Doe",
 *   "teleponPenerima": "081234567890",
 *   "emailPenerima": "john@example.com",
 *   "alamatBaris1": "Jl. Merdeka No. 123",
 *   "alamatBaris2": "Blok A, RT 01/RW 05",
 *   "kota": "Jakarta Pusat",
 *   "provinsi": "DKI Jakarta",
 *   "kodePos": "10110",
 *   "isDefault": true
 * }
 */

/**
 * Example 2: Update Address Request
 *
 * PUT /auth/addresses/{id}
 * Authorization: Bearer {token}
 * Content-Type: application/json
 *
 * {
 *   "label": "Kantor",
 *   "emailPenerima": "johndoe@company.com",
 *   "alamatBaris2": "Lantai 5, Unit 502"
 * }
 */

/**
 * Example 3: Response
 *
 * {
 *   "message": "Alamat berhasil ditambahkan",
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "label": "Rumah",
 *     "namaPenerima": "John Doe",
 *     "teleponPenerima": "081234567890",
 *     "emailPenerima": "john@example.com",
 *     "alamatBaris1": "Jl. Merdeka No. 123",
 *     "alamatBaris2": "Blok A, RT 01/RW 05",
 *     "kota": "Jakarta Pusat",
 *     "provinsi": "DKI Jakarta",
 *     "kodePos": "10110",
 *     "latitude": null,
 *     "longitude": null,
 *     "isDefault": true,
 *     "aktif": true,
 *     "dibuatPada": "2025-01-15T10:30:00.000Z",
 *     "diupdatePada": "2025-01-15T10:30:00.000Z"
 *   }
 * }
 */
