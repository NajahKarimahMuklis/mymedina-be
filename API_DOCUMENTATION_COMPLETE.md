# 📚 MyMedina API Documentation

**Version:** 2.0.0  
**Last Updated:** December 19, 2025  
**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Response Format](#api-response-format)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [User Profile & Addresses](#user-profile--addresses)
   - [Products & Categories](#products--categories)
   - [Orders](#orders)
   - [Order Items](#order-items)
   - [Payments](#payments)
   - [Shipments](#shipments)
   - [File Upload](#file-upload)
6. [Status Codes & Enums](#status-codes--enums)
7. [Rate Limiting](#rate-limiting)
8. [Environment Variables](#environment-variables)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 12
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repository-url>
cd MyMedina

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run seed

# Start development server
npm run start:dev
```

### Quick Start Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/daftar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "nama": "John Doe",
    "nomorTelepon": "081234567890"
  }'

# Verify Email (check console for token in dev)
curl -X GET "http://localhost:5000/api/auth/verifikasi-email/{userId}/{token}"

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

## 🔐 Authentication

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### User Roles

| Role | Permissions |
|------|------------|
| **CUSTOMER** | Browse products, create orders, manage own profile |
| **ADMIN** | Manage products, view orders, manage categories |
| **OWNER** | Full system access, manage admins, view analytics |

### Token Expiration
- Access tokens: 24 hours
- Refresh tokens: 7 days

---

## 📊 API Response Format

### Success Response (2xx)

```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Error Response (4xx, 5xx)

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "BadRequest",
  "timestamp": "2025-12-19T10:30:00Z"
}
```

### Paginated Response

```json
{
  "statusCode": 200,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request creating resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email/slug |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

### Common Error Messages

```json
{
  "email": "Email sudah terdaftar",
  "password": "Password minimal 8 karakter",
  "token": "Token verifikasi sudah kadaluarsa",
  "stock": "Stok tidak cukup"
}
```

---

## 🔌 Endpoints

### Authentication Endpoints

#### 1. Register (Daftar)
```
POST /auth/daftar
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nama": "John Doe",
  "nomorTelepon": "081234567890"
}
```

**Response (201):**
```json
{
  "message": "Pendaftaran berhasil! Silakan cek email untuk verifikasi.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "role": "CUSTOMER"
  },
  "tokenVerifikasi": "123456"
}
```

**Validation Rules:**
- Email: valid format, unique
- Password: minimum 8 characters
- Nama: 3-255 characters
- Phone: optional, valid format

---

#### 2. Verify Email (Verifikasi Email)
```
GET /auth/verifikasi-email/{userId}/{token}
```

**Parameters:**
- `userId` - User UUID
- `token` - 6-digit verification token

**Response (200):**
```json
{
  "message": "Email berhasil diverifikasi",
  "user": {
    "id": "uuid",
    "emailTerverifikasi": true
  }
}
```

---

#### 3. Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "role": "CUSTOMER",
    "emailTerverifikasi": true
  }
}
```

---

#### 4. Forgot Password (Lupa Password)
```
POST /auth/lupa-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Link reset password telah dikirim ke email Anda"
}
```

---

#### 5. Reset Password (Reset Password)
```
POST /auth/reset-password/{token}
```

**Parameters:**
- `token` - Reset password token from email

**Request Body:**
```json
{
  "passwordBaru": "newpassword123",
  "konfirmasiPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password berhasil direset"
}
```

---

### User Profile & Addresses

#### 6. Get User Profile (Ambil Profil)
```
GET /auth/profil
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "nama": "John Doe",
  "nomorTelepon": "081234567890",
  "role": "CUSTOMER",
  "fotoProfil": "https://...",
  "emailTerverifikasi": true,
  "aktif": true,
  "dibuatPada": "2025-01-01T10:00:00Z",
  "addresses": [...]
}
```

---

#### 7. Create Address (Buat Alamat)
```
POST /auth/addresses
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "namaPenerima": "John Doe",
  "teleponPenerima": "081234567890",
  "alamatBaris1": "Jl. Merdeka No. 123",
  "alamatBaris2": "Blok A",
  "kota": "Jakarta",
  "provinsi": "DKI Jakarta",
  "kodePos": "12345",
  "label": "Rumah",
  "isDefault": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "namaPenerima": "John Doe",
  "teleponPenerima": "081234567890",
  "alamatBaris1": "Jl. Merdeka No. 123",
  "alamatBaris2": "Blok A",
  "kota": "Jakarta",
  "provinsi": "DKI Jakarta",
  "kodePos": "12345",
  "label": "Rumah",
  "isDefault": true,
  "aktif": true
}
```

---

#### 8. Get All Addresses (Ambil Semua Alamat)
```
GET /auth/addresses
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "namaPenerima": "John Doe",
      "isDefault": true,
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

#### 9. Update Address (Update Alamat)
```
PUT /auth/addresses/{addressId}
Headers: Authorization: Bearer {token}
```

**Request Body:** (same as Create Address, all fields optional)

---

#### 10. Set Default Address (Set Alamat Default)
```
PUT /auth/addresses/{addressId}/set-default
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Alamat berhasil dijadikan default",
  "address": {...}
}
```

---

#### 11. Delete Address (Hapus Alamat)
```
DELETE /auth/addresses/{addressId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Alamat berhasil dihapus"
}
```

---

### Products & Categories

#### 12. Get All Categories (Ambil Semua Kategori)
```
GET /categories
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `parentId` - Filter by parent category (optional)
- `aktif` - Filter active only (default: true)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nama": "Gamis",
      "slug": "gamis",
      "deskripsi": "Koleksi pakaian muslim...",
      "aktif": true,
      "dibuatPada": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### 13. Get Category Detail (Ambil Detail Kategori)
```
GET /categories/{categoryId}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis",
  "slug": "gamis",
  "deskripsi": "Koleksi pakaian muslim...",
  "subKategori": [...],
  "products": [...]
}
```

---

#### 14. Get All Products (Ambil Semua Produk)
```
GET /products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name (optional)
- `categoryId` - Filter by category (optional)
- `status` - Filter by status: READY, PO, DISCONTINUED
- `aktif` - Filter active only (default: true)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nama": "Gamis Premium",
      "slug": "gamis-premium",
      "deskripsi": "Gamis premium terbaik...",
      "hargaDasar": 150000,
      "berat": 0.5,
      "status": "READY",
      "aktif": true,
      "gambarUrl": "https://...",
      "variants": [...]
    }
  ],
  "pagination": {...}
}
```

---

#### 15. Get Product Detail (Ambil Detail Produk)
```
GET /products/{productId}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis Premium",
  "slug": "gamis-premium",
  "deskripsi": "Gamis premium terbaik...",
  "hargaDasar": 150000,
  "berat": 0.5,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://...",
  "stokTersedia": 45,
  "isTersedia": true,
  "variants": [
    {
      "id": "uuid",
      "sku": "GAMIS-PREM-BK-M",
      "ukuran": "M",
      "warna": "Hitam",
      "stok": 15,
      "hargaTambahan": 0,
      "aktif": true
    }
  ]
}
```

---

#### 16. Get Product Variants (Ambil Variant Produk)
```
GET /products/{productId}/variants
```

**Query Parameters:**
- `aktif` - Filter active variants (default: true)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "sku": "GAMIS-PREM-BK-M",
      "ukuran": "M",
      "warna": "Hitam",
      "stok": 15,
      "hargaTambahan": 0,
      "aktif": true
    }
  ]
}
```

---

#### 17. Create Product (Admin Only)
```
POST /products
Headers: Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "categoryId": "uuid",
  "nama": "Gamis Premium",
  "slug": "gamis-premium",
  "deskripsi": "Gamis premium terbaik...",
  "hargaDasar": 150000,
  "berat": 0.5,
  "status": "READY",
  "gambarUrl": "https://..."
}
```

---

#### 18. Create Product Variant (Admin Only)
```
POST /products/{productId}/variants
Headers: Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "sku": "GAMIS-PREM-BK-M",
  "ukuran": "M",
  "warna": "Hitam",
  "stok": 15,
  "hargaTambahan": 0
}
```

---

### Orders

#### 19. Create Order (Buat Order)
```
POST /orders
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "tipe": "READY",
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "kuantitas": 2
    }
  ],
  "addressId": "uuid",
  "ongkosKirim": 50000,
  "catatan": "Tolong dikemas rapi"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nomorOrder": "ORD-20251219-00001",
  "status": "PENDING_PAYMENT",
  "subtotal": 300000,
  "ongkosKirim": 50000,
  "total": 350000,
  "items": [...],
  "namaPenerima": "John Doe",
  "teleponPenerima": "081234567890"
}
```

**Validation:**
- Minimal 1 item
- Address harus milik user
- Stok harus cukup untuk semua items
- Ongkos kirim > 0

---

#### 20. Get All Orders (Ambil Semua Order)
```
GET /orders
Headers: Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status
- `sort` - Sort by: newest (default), oldest, price_asc, price_desc

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nomorOrder": "ORD-20251219-00001",
      "status": "PENDING_PAYMENT",
      "total": 350000,
      "dibuatPada": "2025-12-19T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### 21. Get Order Detail (Ambil Detail Order)
```
GET /orders/{orderId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nomorOrder": "ORD-20251219-00001",
  "status": "PENDING_PAYMENT",
  "tipe": "READY",
  "subtotal": 300000,
  "ongkosKirim": 50000,
  "total": 350000,
  "catatan": "Tolong dikemas rapi",
  "items": [
    {
      "id": "uuid",
      "namaProduct": "Gamis Premium",
      "skuProduct": "GAMIS-PREM-BK-M",
      "ukuranVariant": "M",
      "warnaVariant": "Hitam",
      "kuantitas": 2,
      "hargaSatuan": 150000,
      "subtotal": 300000
    }
  ],
  "payments": [...],
  "shipment": {...}
}
```

---

#### 22. Cancel Order (Batalkan Order)
```
POST /orders/{orderId}/cancel
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Order berhasil dibatalkan",
  "order": {
    "id": "uuid",
    "status": "CANCELLED",
    "dibatalkanPada": "2025-12-19T10:30:00Z"
  }
}
```

**Conditions:**
- Order status harus PENDING_PAYMENT atau IN_PRODUCTION
- Stok akan dikembalikan ke variant

---

### Payments

#### 23. Create Payment (Buat Pembayaran)
```
POST /payments
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "uuid",
  "metode": "QRIS"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "transactionId": "TRX-20251219-00001",
  "orderId": "uuid",
  "status": "PENDING",
  "jumlah": 350000,
  "metode": "QRIS",
  "urlPembayaran": "https://app.midtrans.com/snap/v1/...",
  "kadaluarsaPada": "2025-12-19T14:00:00Z"
}
```

**Payment Methods:**
- BANK_TRANSFER
- VIRTUAL_ACCOUNT
- QRIS
- E_WALLET
- CREDIT_CARD

---

#### 24. Get Payment Detail (Ambil Detail Pembayaran)
```
GET /payments/{paymentId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "transactionId": "TRX-20251219-00001",
  "orderId": "uuid",
  "status": "SETTLEMENT",
  "jumlah": 350000,
  "metode": "QRIS",
  "diinisiasiPada": "2025-12-19T10:00:00Z",
  "waktuSettlement": "2025-12-19T10:15:00Z"
}
```

---

#### 25. Webhook Handler (Midtrans)
```
POST /payments/webhook/midtrans
```

**Midtrans akan mengirim:**
```json
{
  "transaction_id": "...",
  "order_id": "uuid",
  "status_code": "200",
  "transaction_status": "settlement",
  "signature_key": "..."
}
```

---

### Shipments

#### 26. Check Shipping Rates (Cek Ongkir)
```
POST /shipments/check-rates
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "origin_area_id": "area_12345",
  "destination_area_id": "area_67890",
  "couriers": "jne,jnt,grab",
  "items": [
    {
      "weight": 0.5,
      "length": 10,
      "width": 10,
      "height": 10
    }
  ]
}
```

**Response (200):**
```json
{
  "pricing": [
    {
      "courier_code": "jne",
      "courier_name": "JNE",
      "services": [
        {
          "service_code": "express",
          "service_name": "JNE Express",
          "price": 50000,
          "etd": "1"
        }
      ]
    }
  ]
}
```

---

#### 27. Create Shipment (Buat Pengiriman)
```
POST /shipments/create-with-biteship
Headers: Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "orderId": "uuid",
  "origin_area_id": "area_12345",
  "destination_area_id": "area_67890",
  "courier_code": "jne",
  "service_code": "express"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "kurir": "JNE",
  "layanan": "JNE Express",
  "nomorResi": "12345678",
  "status": "PENDING",
  "biaya": 50000,
  "dikirimPada": null,
  "diterimaPada": null
}
```

---

#### 28. Get Shipment Detail (Ambil Detail Pengiriman)
```
GET /shipments/{shipmentId}
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "kurir": "JNE",
  "layanan": "JNE Express",
  "nomorResi": "12345678",
  "status": "IN_TRANSIT",
  "biaya": 50000,
  "dikirimPada": "2025-12-19T10:00:00Z",
  "diterimaPada": null
}
```

---

#### 29. Tracking Shipment (Lacak Pengiriman)
```
GET /shipments/{shipmentId}/tracking
Headers: Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "tracking_number": "12345678",
  "courier": "JNE",
  "status": "in_transit",
  "logs": [
    {
      "timestamp": "2025-12-19T10:00:00Z",
      "status": "picked_up",
      "description": "Paket diambil dari gudang"
    }
  ]
}
```

---

#### 30. Update Shipment Status (Update Status Pengiriman)
```
PUT /shipments/{shipmentId}/status
Headers: Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "status": "DELIVERED",
  "nomorResi": "12345678"
}
```

**Response (200):**
```json
{
  "message": "Status pengiriman berhasil diupdate",
  "shipment": {...}
}
```

---

### File Upload

#### 31. Upload Image (Upload Gambar)
```
POST /upload/image
Headers: 
  Authorization: Bearer {token}
  Content-Type: multipart/form-data
Body: FormData {
  file: <binary>
}
```

**Response (201):**
```json
{
  "url": "https://res.cloudinary.com/mymedina/image/upload/v1234567890/...",
  "publicId": "mymedina/...",
  "width": 800,
  "height": 600
}
```

**Validation:**
- File size: max 5MB
- Format: jpg, jpeg, png, webp
- Ratio: recommended 1:1 or 4:3

---

## 📊 Status Codes & Enums

### Order Status

| Value | Description | Dapat di-Cancel? |
|-------|-------------|-----------------|
| `PENDING_PAYMENT` | Menunggu pembayaran | ✅ Yes |
| `PAID` | Pembayaran diterima | ❌ No |
| `IN_PRODUCTION` | Sedang diproduksi | ✅ Yes |
| `READY_TO_SHIP` | Siap dikirim | ❌ No |
| `SHIPPED` | Sudah dikirim | ❌ No |
| `DELIVERED` | Sudah diterima | ❌ No |
| `COMPLETED` | Selesai | ❌ No |
| `CANCELLED` | Dibatalkan | ❌ No |
| `REFUNDED` | Refund | ❌ No |
| `EXPIRED` | Kadaluarsa | ✅ Yes |

### Payment Status

| Value | Description |
|-------|------------|
| `PENDING` | Menunggu pembayaran |
| `SETTLEMENT` | Pembayaran berhasil |
| `DENY` | Pembayaran ditolak |
| `CANCEL` | Pembayaran dibatalkan |
| `EXPIRE` | Pembayaran kadaluarsa |
| `REFUND` | Pengembalian dana |

### Shipment Status

| Value | Description |
|-------|------------|
| `PENDING` | Menunggu pengiriman |
| `READY_TO_SHIP` | Siap dikirim |
| `SHIPPED` | Sudah dikirim |
| `IN_TRANSIT` | Dalam perjalanan |
| `DELIVERED` | Sudah diterima |

### Product Status

| Value | Description |
|-------|------------|
| `READY` | Siap jual |
| `PO` | Pre-order |
| `DISCONTINUED` | Dihentikan |

### User Role

| Value | Permissions |
|-------|------------|
| `CUSTOMER` | Browse, order |
| `ADMIN` | Manage products, orders |
| `OWNER` | Full access |

---

## 🚦 Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:

- **Endpoint Default:** 10 requests per 1 minute
- **Authentication:** 5 requests per 1 minute
- **File Upload:** 30 requests per 1 hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
```

**Rate Limit Exceeded Response (429):**
```json
{
  "statusCode": 429,
  "message": "Terlalu banyak permintaan. Coba lagi dalam beberapa menit"
}
```

---

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
APP_NAME=MyMedina

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=mymedina_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h

# Midtrans Payment Gateway
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key

# Biteship Shipping API
BITESHIP_API_KEY=your-biteship-api-key

# Cloudinary File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=MyMedina
SMTP_FROM_EMAIL=noreply@mymedina.com

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 📝 API Versioning

Current version: **2.0.0**

### Changelog

#### v2.0.0 (December 19, 2025)
- ✅ Complete class diagram implementation
- ✅ All entity methods implemented
- ✅ All relationships configured
- ✅ Enhanced documentation
- ✅ Updated status enums

#### v1.0.0 (December 14, 2025)
- Initial release
- Basic CRUD operations
- Midtrans integration
- Biteship integration

---

## 🆘 Troubleshooting

### Common Issues

**1. Token Expired**
- Solution: Re-login to get new token

**2. Email Verification Token Expired**
- Solution: Request new verification email via forgot-password endpoint

**3. Order Creation Failed - Insufficient Stock**
- Solution: Check available stock via GET /products/{productId}

**4. Payment Failed**
- Solution: Check payment status via GET /payments/{paymentId}
- Retry with different payment method

**5. Shipment Not Created**
- Solution: Ensure order status is PAID or IN_PRODUCTION
- Check shipping rates first with check-rates endpoint

---

## 📞 Support & Contact

For technical support or questions:
- Email: support@mymedina.com
- GitHub Issues: Create issue in repository
- Slack: #api-support channel

---

**Last Updated:** December 19, 2025  
**Maintained By:** MyMedina Development Team
