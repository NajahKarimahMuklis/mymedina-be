# MyMedina API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** December 14, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Auth Module](#auth-module)
   - [Products Module](#products-module)
   - [Categories Module](#categories-module)
   - [Orders Module](#orders-module)
   - [Shipments Module](#shipments-module)
   - [Payments Module](#payments-module)
   - [Upload Module](#upload-module)

---

## Overview

MyMedina is an E-commerce platform API built with NestJS and TypeORM. It provides comprehensive functionality for managing products, orders, shipments, and payments.

### Key Features
- User authentication with JWT
- Role-based access control (Customer, Admin, Owner)
- Product catalog with variants
- Shopping cart and order management
- Shipment tracking with Biteship integration
- Payment processing
- Email notifications
- File uploads with Cloudinary

### Tech Stack
- **Framework:** NestJS
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Cloudinary
- **Shipping:** Biteship API
- **Email:** Nodemailer

---

## Authentication

### JWT Token

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### User Roles

- **CUSTOMER** - Regular user, can place orders
- **ADMIN** - Can manage products, orders, and view reports
- **OWNER** - Full system access

### Login Response

```json
{
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "role": "CUSTOMER",
    "isVerified": true
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

---

## Endpoints

### Auth Module

Base Path: `/api/auth`

#### 1. Register User

```
POST /api/auth/daftar
```

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "nama": "John Doe",
  "nomorTelepon": "08123456789"
}
```

**Response (201):**
```json
{
  "message": "Registrasi berhasil. Silakan verifikasi email Anda",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "nomorTelepon": "08123456789",
    "role": "CUSTOMER",
    "isVerified": false
  },
  "verificationToken": "123456" // Development only
}
```

**Validation Rules:**
- Email must be valid and unique
- Password minimum 8 characters
- Nama required (non-empty)
- NomorTelepon required

---

#### 2. Login User

```
POST /api/auth/login
```

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login berhasil",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "nama": "John Doe",
    "role": "CUSTOMER",
    "isVerified": true
  }
}
```

**Errors:**
- 400: Invalid email/password combination
- 403: Email not verified

---

#### 3. Verify Email

```
GET /api/auth/verifikasi-email/:userId/:token
```

Verify user email address.

**Parameters:**
- `userId` (string): User ID
- `token` (string): 6-digit verification token from email

**Response (200):**
```json
{
  "message": "Email berhasil diverifikasi"
}
```

**Errors:**
- 404: User not found
- 400: Invalid/expired token

---

#### 4. Forgot Password

```
POST /api/auth/lupa-password
```

Request password reset token via email.

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

#### 5. Reset Password

```
POST /api/auth/reset-password/:token
```

Reset password using token from email.

**Parameters:**
- `token` (string): Reset token from email

**Request Body:**
```json
{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password berhasil direset"
}
```

---

### Products Module

Base Path: `/api/products`

#### 1. Get All Products

```
GET /api/products
```

List all products with pagination, filtering, and search.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by product name
- `categoryId` (string): Filter by category ID
- `status` (string): Filter by status (READY, DISCONTINUED, DRAFT)
- `active` (string): Filter by active status (true/false)

**Example:**
```
GET /api/products?page=1&limit=20&search=gamis&categoryId=uuid&status=READY
```

**Response (200):**
```json
{
  "message": "Berhasil mengambil daftar produk",
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "data": [
    {
      "id": "uuid",
      "namaProduct": "Gamis Cantik",
      "deskripsi": "Gamis modern dengan bahan berkualitas",
      "hargaBase": 150000,
      "status": "READY",
      "active": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### 2. Get Product Detail

```
GET /api/products/:id
```

Get detailed information about a product including variants.

**Parameters:**
- `id` (string): Product ID

**Response (200):**
```json
{
  "message": "Berhasil mengambil detail produk",
  "data": {
    "id": "uuid",
    "namaProduct": "Gamis Cantik",
    "deskripsi": "Gamis modern dengan bahan berkualitas",
    "hargaBase": 150000,
    "status": "READY",
    "active": true,
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "nama": "Gamis"
    },
    "image": "https://cloudinary.url/image.jpg",
    "variants": [
      {
        "id": "uuid",
        "skuVariant": "GAMIS-001-BLK-M",
        "ukuranVariant": "M",
        "warnaVariant": "Black",
        "hargaVariant": 160000,
        "stokVariant": 50,
        "active": true
      }
    ]
  }
}
```

---

#### 3. Create Product (Admin/Owner Only)

```
POST /api/products
```

Create a new product.

**Authorization:** JWT + (ADMIN or OWNER role)

**Request Body:**
```json
{
  "namaProduct": "Gamis Cantik",
  "deskripsi": "Gamis modern dengan bahan berkualitas",
  "hargaBase": 150000,
  "categoryId": "uuid",
  "image": "https://cloudinary.url/image.jpg",
  "status": "READY",
  "active": true
}
```

**Response (201):**
```json
{
  "message": "Produk berhasil dibuat",
  "data": {
    "id": "uuid",
    "namaProduct": "Gamis Cantik",
    "deskripsi": "Gamis modern dengan bahan berkualitas",
    "hargaBase": 150000,
    "categoryId": "uuid",
    "image": "https://cloudinary.url/image.jpg",
    "status": "READY",
    "active": true
  }
}
```

---

#### 4. Update Product (Admin/Owner Only)

```
PUT /api/products/:id
```

Update product information.

**Authorization:** JWT + (ADMIN or OWNER role)

**Parameters:**
- `id` (string): Product ID

**Request Body:** (All fields optional)
```json
{
  "namaProduct": "Gamis Cantik Updated",
  "deskripsi": "Updated description",
  "hargaBase": 160000,
  "categoryId": "uuid",
  "status": "DRAFT",
  "active": false
}
```

**Response (200):**
```json
{
  "message": "Produk berhasil diupdate",
  "data": { /* updated product */ }
}
```

---

#### 5. Delete Product (Admin/Owner Only)

```
DELETE /api/products/:id
```

Delete a product (soft delete).

**Authorization:** JWT + (ADMIN or OWNER role)

**Parameters:**
- `id` (string): Product ID

**Response (200):**
```json
{
  "message": "Produk berhasil dihapus"
}
```

---

### Categories Module

Base Path: `/api/categories`

#### 1. Get All Categories

```
GET /api/categories
```

Get list of all product categories.

**Response (200):**
```json
{
  "message": "Berhasil mengambil daftar kategori",
  "data": [
    {
      "id": "uuid",
      "nama": "Gamis",
      "deskripsi": "Kategori gamis",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

---

#### 2. Create Category (Admin/Owner Only)

```
POST /api/categories
```

Create new product category.

**Authorization:** JWT + (ADMIN or OWNER role)

**Request Body:**
```json
{
  "nama": "Gamis",
  "deskripsi": "Kategori gamis"
}
```

**Response (201):**
```json
{
  "message": "Kategori berhasil dibuat",
  "data": {
    "id": "uuid",
    "nama": "Gamis",
    "deskripsi": "Kategori gamis"
  }
}
```

---

### Orders Module

Base Path: `/api/orders`

#### 1. Create Order (Checkout)

```
POST /api/orders
```

Create new order (checkout).

**Authorization:** JWT (CUSTOMER role)

**Request Body:**
```json
{
  "addressId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2
    }
  ],
  "notes": "Please handle with care"
}
```

**Response (201):**
```json
{
  "message": "Order berhasil dibuat",
  "order": {
    "id": "uuid",
    "nomorOrder": "ORD-20240115-001",
    "userId": "uuid",
    "totalAmount": 320000,
    "status": "PENDING",
    "items": [
      {
        "productId": "uuid",
        "namaProduk": "Gamis Cantik",
        "kuantitas": 2,
        "hargaSnapshot": 160000,
        "subtotal": 320000
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 2. Get My Orders

```
GET /api/orders
```

Get list of orders for the authenticated customer.

**Authorization:** JWT (CUSTOMER role)

**Response (200):**
```json
{
  "message": "Berhasil mengambil daftar order",
  "total": 5,
  "orders": [
    {
      "id": "uuid",
      "nomorOrder": "ORD-20240115-001",
      "totalAmount": 320000,
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### 3. Get Order by ID

```
GET /api/orders/:id
```

Get detailed information about a specific order.

**Authorization:** JWT (Customer can view own orders, Admin can view all)

**Parameters:**
- `id` (string): Order ID

**Response (200):**
```json
{
  "message": "Berhasil mengambil detail order",
  "data": {
    "id": "uuid",
    "nomorOrder": "ORD-20240115-001",
    "userId": "uuid",
    "user": {
      "nama": "John Doe",
      "email": "john@example.com"
    },
    "totalAmount": 320000,
    "status": "COMPLETED",
    "items": [
      {
        "id": "uuid",
        "productId": "uuid",
        "namaProduk": "Gamis Cantik",
        "kuantitas": 2,
        "hargaSnapshot": 160000,
        "subtotal": 320000
      }
    ],
    "shipment": {
      "id": "uuid",
      "status": "DELIVERED",
      "trackingNumber": "BIT-123456"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 4. Update Order Status (Admin/Owner Only)

```
PUT /api/orders/:id/status
```

Update order status (PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED).

**Authorization:** JWT + (ADMIN or OWNER role)

**Parameters:**
- `id` (string): Order ID

**Request Body:**
```json
{
  "status": "PROCESSING"
}
```

**Response (200):**
```json
{
  "message": "Status order berhasil diupdate",
  "data": { /* updated order */ }
}
```

---

### Shipments Module

Base Path: `/api/shipments`

#### 1. Check Shipping Rates (Cek Ongkir)

```
POST /api/shipments/check-rates
```

Check shipping rates via Biteship API.

**Authorization:** JWT

**Request Body:**
```json
{
  "origin_area_id": "area_12345",
  "destination_area_id": "area_67890",
  "couriers": "jne,jnt",
  "items": [
    {
      "name": "Gamis Cantik",
      "description": "Gamis modern",
      "value": 160000,
      "length": 30,
      "width": 20,
      "height": 10,
      "weight": 500,
      "quantity": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Berhasil cek ongkir",
  "data": {
    "couriers": [
      {
        "courier_name": "JNE",
        "courier_code": "jne",
        "courier_service_name": "OKE",
        "courier_service_code": "oke",
        "type": "reguler",
        "description": "Pengiriman 2-3 hari kerja",
        "price": 45000,
        "estimated_days": "2-3"
      }
    ]
  }
}
```

---

#### 2. Create Shipment (Manual)

```
POST /api/shipments
```

Create shipment manually (without Biteship).

**Authorization:** JWT + (ADMIN or OWNER role)

**Request Body:**
```json
{
  "orderId": "uuid",
  "kurir": "JNE",
  "layanan": "OKE",
  "nomorResi": "12345678901234",
  "biaya": 45000
}
```

**Response (201):**
```json
{
  "message": "Pengiriman berhasil dibuat",
  "shipment": {
    "id": "uuid",
    "orderId": "uuid",
    "kurir": "JNE",
    "layanan": "OKE",
    "nomorResi": "12345678901234",
    "biaya": 45000,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 3. Create Shipment via Biteship

```
POST /api/shipments/create-with-biteship
```

Create shipment and automatically integrate with Biteship.

**Authorization:** JWT + (ADMIN or OWNER role)

**Request Body:**
```json
{
  "orderId": "uuid",
  "origin_area_id": "area_12345",
  "destination_contact_name": "John Doe",
  "destination_contact_phone": "08123456789",
  "destination_contact_email": "john@example.com",
  "destination_address": "Jl. Merdeka No. 123",
  "destination_postal_code": 12345,
  "destination_area_id": "area_67890",
  "courier_company": "JNE",
  "courier_type": "OKE"
}
```

**Response (201):**
```json
{
  "message": "Shipment berhasil dibuat via Biteship",
  "shipment": {
    "id": "uuid",
    "orderId": "uuid",
    "biteshipOrderId": "biteship-uuid",
    "biteshipTrackingId": "tracking-id",
    "courierTrackingUrl": "https://biteship.com/tracking",
    "kurir": "JNE",
    "layanan": "OKE",
    "nomorResi": "123456789",
    "biaya": 45000,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 4. Track Shipment

```
GET /api/shipments/order/:orderId/track
```

Track shipment by order ID.

**Authorization:** JWT

**Parameters:**
- `orderId` (string): Order ID

**Response (200):**
```json
{
  "message": "Berhasil mengambil tracking shipment",
  "shipment": {
    "id": "uuid",
    "orderId": "uuid",
    "kurir": "JNE",
    "layanan": "OKE",
    "nomorResi": "123456789",
    "courierTrackingUrl": "https://tracking.jne.com",
    "status": "IN_TRANSIT",
    "estimasiPengiriman": "2024-01-17",
    "updatedAt": "2024-01-15T15:00:00Z"
  }
}
```

---

#### 5. Get Shipment Details

```
GET /api/shipments/:id
```

Get detailed information about a shipment.

**Authorization:** JWT

**Parameters:**
- `id` (string): Shipment ID

**Response (200):**
```json
{
  "message": "Berhasil mengambil detail pengiriman",
  "shipment": { /* detailed shipment info */ }
}
```

---

#### 6. Update Shipment Status (Admin/Owner Only)

```
PUT /api/shipments/:id/status
```

Update shipment status.

**Authorization:** JWT + (ADMIN or OWNER role)

**Parameters:**
- `id` (string): Shipment ID

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

**Response (200):**
```json
{
  "message": "Status pengiriman berhasil diupdate",
  "shipment": { /* updated shipment */ }
}
```

---

### Payments Module

Base Path: `/api/payments`

#### 1. Create Payment

```
POST /api/payments
```

Create payment record (integration with payment gateway).

**Authorization:** JWT

**Request Body:**
```json
{
  "orderId": "uuid",
  "paymentMethod": "BANK_TRANSFER"
}
```

**Response (201):**
```json
{
  "message": "Pembayaran berhasil dibuat",
  "payment": {
    "id": "uuid",
    "orderId": "uuid",
    "amount": 320000,
    "status": "PENDING",
    "paymentMethod": "BANK_TRANSFER",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### 2. Verify Payment (Admin/Owner Only)

```
PUT /api/payments/:id/verify
```

Verify and confirm payment.

**Authorization:** JWT + (ADMIN or OWNER role)

**Parameters:**
- `id` (string): Payment ID

**Response (200):**
```json
{
  "message": "Pembayaran berhasil diverifikasi",
  "payment": {
    "id": "uuid",
    "orderId": "uuid",
    "status": "COMPLETED",
    "verifiedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### Upload Module

Base Path: `/api/upload`

#### 1. Upload File

```
POST /api/upload
```

Upload file to Cloudinary.

**Authorization:** JWT

**Content-Type:** `multipart/form-data`

**Request:**
```
Form Data:
- file: [binary file]
```

**Response (201):**
```json
{
  "message": "File berhasil diupload",
  "data": {
    "public_id": "mymedina/image-uuid",
    "url": "https://cloudinary.url/image.jpg",
    "secure_url": "https://cloudinary.url/image.jpg",
    "original_filename": "gamis.jpg"
  }
}
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mymedina
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@mymedina.com

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Biteship
BITESHIP_API_KEY=your_biteship_api_key

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default:** 10 requests per 60 seconds per IP
- **Configurable:** Via `THROTTLE_TTL` and `THROTTLE_LIMIT` environment variables

When rate limit is exceeded:
```
HTTP 429 Too Many Requests
```

---

## CORS Configuration

CORS is enabled for the frontend URL specified in `FRONTEND_URL` environment variable. Credentials are allowed.

---

## Code Examples

### Example: Complete Checkout Flow

1. **Get Products**
```bash
curl -X GET "http://localhost:5000/api/products?limit=10&status=READY"
```

2. **Create Order**
```bash
curl -X POST "http://localhost:5000/api/orders" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "uuid",
    "items": [
      {
        "productId": "uuid",
        "variantId": "uuid",
        "quantity": 1
      }
    ]
  }'
```

3. **Check Shipping Rates**
```bash
curl -X POST "http://localhost:5000/api/shipments/check-rates" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "origin_area_id": "area_12345",
    "destination_area_id": "area_67890",
    "couriers": "jne,jnt",
    "items": [...]
  }'
```

4. **Create Shipment**
```bash
curl -X POST "http://localhost:5000/api/shipments/create-with-biteship" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid",
    "origin_area_id": "area_12345",
    ...
  }'
```

5. **Create Payment**
```bash
curl -X POST "http://localhost:5000/api/payments" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "uuid",
    "paymentMethod": "BANK_TRANSFER"
  }'
```

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.

---

## Changelog

### Version 1.0.0 (December 14, 2025)
- Initial API documentation
- Complete endpoint documentation
- Authentication guide
- Error handling guide
- Environment variables guide
