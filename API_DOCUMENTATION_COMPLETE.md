# 📚 MyMedina Backend - COMPLETE API DOCUMENTATION

**Project:** MyMedina Backend - E-Commerce API  
**Version:** 3.0 (Week 1-3 Complete)  
**Base URL:** `http://localhost:5000/api`  
**Last Updated:** December 2025

---

## 📋 TABLE OF CONTENTS

1. [Authentication](#1-authentication-6-endpoints)
2. [Categories](#2-categories-5-endpoints)
3. [Products](#3-products-5-endpoints)
4. [Product Variants](#4-product-variants-5-endpoints)
5. [Upload](#5-upload-1-endpoint)
6. [Orders](#6-orders-5-endpoints)
7. [Payments](#7-payments-5-endpoints)
8. [Shipments](#8-shipments-4-endpoints)
9. [Error Responses](#error-responses)
10. [Status Codes](#status-codes)

**Total Endpoints:** 36 endpoints

---

## 🔐 AUTHENTICATION

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### **Roles:**
- `CUSTOMER` - Regular customer
- `ADMIN` - Admin user (can manage products, orders)
- `OWNER` - Owner (full access)

---

## 1. AUTHENTICATION (6 Endpoints)

### **1.1 Register User**

**Endpoint:** `POST /api/auth/daftar`  
**Auth:** None (Public)  
**Description:** Register new user account

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "Password123!",
  "nama": "John Doe",
  "nomorTelepon": "081234567890"
}
```

**Response (201):**
```json
{
  "message": "Registrasi berhasil! Silakan cek email Anda untuk verifikasi.",
  "user": {
    "id": "uuid",
    "email": "customer@example.com",
    "nama": "John Doe",
    "nomorTelepon": "081234567890",
    "role": "CUSTOMER",
    "emailTerverifikasi": false,
    "aktif": true,
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
}
```

**Validations:**
- Email must be valid format
- Email must be unique
- Password minimum 8 characters
- Name is required

---

### **1.2 Verify Email**

**Endpoint:** `GET /api/auth/verifikasi-email/:userId/:token`  
**Auth:** None (Public)  
**Description:** Verify user email with 6-digit token

**URL Parameters:**
- `userId` - User UUID
- `token` - 6-digit verification token (from email)

**Response (200):**
```json
{
  "message": "Email berhasil diverifikasi! Anda sekarang dapat login."
}
```

**Error Responses:**
- `404` - User not found
- `400` - Invalid or expired token
- `400` - Email already verified

---

### **1.3 Login**

**Endpoint:** `POST /api/auth/login`  
**Auth:** None (Public)  
**Description:** Login and get JWT token

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login berhasil!",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "customer@example.com",
    "nama": "John Doe",
    "nomorTelepon": "081234567890",
    "role": "CUSTOMER",
    "emailTerverifikasi": true,
    "aktif": true
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `401` - Email not verified
- `401` - Account inactive

---

### **1.4 Forgot Password**

**Endpoint:** `POST /api/auth/lupa-password`  
**Auth:** None (Public)  
**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "customer@example.com"
}
```

**Response (200):**
```json
{
  "message": "Email reset password telah dikirim. Silakan cek inbox Anda."
}
```

**Note:** Always returns success even if email doesn't exist (security best practice)

---

### **1.5 Reset Password**

**Endpoint:** `POST /api/auth/reset-password/:token`  
**Auth:** None (Public)  
**Description:** Reset password with token from email

**URL Parameters:**
- `token` - Reset token from email

**Request Body:**
```json
{
  "passwordBaru": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password berhasil direset! Silakan login dengan password baru Anda."
}
```

**Error Responses:**
- `400` - Invalid or expired token
- `400` - Password too weak

---

### **1.6 Get Profile**

**Endpoint:** `GET /api/auth/profil`  
**Auth:** JWT Required  
**Description:** Get current user profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "customer@example.com",
  "nama": "John Doe",
  "nomorTelepon": "081234567890",
  "role": "CUSTOMER",
  "emailTerverifikasi": true,
  "aktif": true,
  "fotoProfil": null,
  "dibuatPada": "2025-11-01T10:00:00.000Z",
  "diupdatePada": "2025-11-01T10:00:00.000Z"
}
```

---

## 2. CATEGORIES (5 Endpoints)

### **2.1 Create Category**

**Endpoint:** `POST /api/categories`
**Auth:** Admin/Owner
**Description:** Create new category

**Request Body:**
```json
{
  "nama": "Gamis",
  "slug": "gamis",
  "deskripsi": "Koleksi gamis muslimah",
  "parentId": null,
  "aktif": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "nama": "Gamis",
  "slug": "gamis",
  "deskripsi": "Koleksi gamis muslimah",
  "parentId": null,
  "aktif": true,
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:00:00.000Z"
}
```

---

### **2.2 Get All Categories**

**Endpoint:** `GET /api/categories`
**Auth:** None (Public)
**Description:** Get all active categories

**Query Parameters:**
- `includeInactive` (optional) - Include inactive categories (default: false)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nama": "Gamis",
    "slug": "gamis",
    "deskripsi": "Koleksi gamis muslimah",
    "aktif": true,
    "parent": null,
    "subKategori": [
      {
        "id": "uuid",
        "nama": "Gamis Syari",
        "slug": "gamis-syari"
      }
    ],
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
]
```

---

### **2.3 Get Category by ID**

**Endpoint:** `GET /api/categories/:id`
**Auth:** None (Public)
**Description:** Get category details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis",
  "slug": "gamis",
  "deskripsi": "Koleksi gamis muslimah",
  "aktif": true,
  "parent": null,
  "subKategori": [],
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:00:00.000Z"
}
```

---

### **2.4 Update Category**

**Endpoint:** `PUT /api/categories/:id`
**Auth:** Admin/Owner
**Description:** Update category

**Request Body:**
```json
{
  "nama": "Gamis Premium",
  "deskripsi": "Koleksi gamis premium",
  "aktif": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis Premium",
  "slug": "gamis",
  "deskripsi": "Koleksi gamis premium",
  "aktif": true,
  "diupdatePada": "2025-12-06T11:00:00.000Z"
}
```

---

### **2.5 Delete Category**

**Endpoint:** `DELETE /api/categories/:id`
**Auth:** Admin/Owner
**Description:** Delete category (if no products or sub-categories)

**Response (200):**
```json
{
  "message": "Kategori berhasil dihapus"
}
```

**Error Responses:**
- `400` - Category has products
- `400` - Category has sub-categories

---

## 3. PRODUCTS (5 Endpoints)

### **3.1 Create Product**

**Endpoint:** `POST /api/products`
**Auth:** Admin/Owner
**Description:** Create new product

**Request Body:**
```json
{
  "categoryId": "uuid",
  "nama": "Gamis Syari Elegant",
  "slug": "gamis-syari-elegant",
  "deskripsi": "Gamis syari dengan bahan premium",
  "hargaDasar": 250000,
  "berat": 500,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://res.cloudinary.com/..."
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "nama": "Gamis Syari Elegant",
  "slug": "gamis-syari-elegant",
  "deskripsi": "Gamis syari dengan bahan premium",
  "hargaDasar": 250000,
  "berat": 500,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://res.cloudinary.com/...",
  "category": {
    "id": "uuid",
    "nama": "Gamis"
  },
  "dibuatPada": "2025-12-06T10:00:00.000Z"
}
```

---

### **3.2 Get All Products**

**Endpoint:** `GET /api/products`
**Auth:** None (Public)
**Description:** Get all products with pagination, search, and filters

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search in name and description
- `categoryId` (optional) - Filter by category UUID
- `status` (optional) - Filter by status (READY, PO, DISCONTINUED)
- `active` (optional) - Filter by active status (true/false)

**Examples:**
```
GET /api/products?page=1&limit=10
GET /api/products?search=gamis
GET /api/products?categoryId=uuid&status=READY
GET /api/products?search=syari&active=true&page=2
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nama": "Gamis Syari Elegant",
      "slug": "gamis-syari-elegant",
      "deskripsi": "Gamis syari dengan bahan premium",
      "hargaDasar": 250000,
      "berat": 500,
      "status": "READY",
      "aktif": true,
      "gambarUrl": "https://res.cloudinary.com/...",
      "category": {
        "id": "uuid",
        "nama": "Gamis"
      },
      "dibuatPada": "2025-12-06T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### **3.3 Get Product by ID**

**Endpoint:** `GET /api/products/:id`
**Auth:** None (Public)
**Description:** Get product details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis Syari Elegant",
  "slug": "gamis-syari-elegant",
  "deskripsi": "Gamis syari dengan bahan premium",
  "hargaDasar": 250000,
  "berat": 500,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://res.cloudinary.com/...",
  "category": {
    "id": "uuid",
    "nama": "Gamis",
    "slug": "gamis"
  },
  "variants": [
    {
      "id": "uuid",
      "sku": "GMS-SYR-ELG-M-BLK",
      "ukuran": "M",
      "warna": "Black",
      "stok": 10,
      "hargaOverride": null,
      "aktif": true
    }
  ],
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:00:00.000Z"
}
```

---

### **3.4 Update Product**

**Endpoint:** `PUT /api/products/:id`
**Auth:** Admin/Owner
**Description:** Update product

**Request Body:**
```json
{
  "nama": "Gamis Syari Elegant Premium",
  "hargaDasar": 275000,
  "status": "READY",
  "aktif": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "nama": "Gamis Syari Elegant Premium",
  "hargaDasar": 275000,
  "status": "READY",
  "aktif": true,
  "diupdatePada": "2025-12-06T11:00:00.000Z"
}
```

---

### **3.5 Delete Product (Soft Delete)**

**Endpoint:** `DELETE /api/products/:id`
**Auth:** Admin/Owner
**Description:** Soft delete product (sets deleted_at timestamp)

**Response (200):**
```json
{
  "message": "Produk berhasil dihapus"
}
```

---

## 4. PRODUCT VARIANTS (5 Endpoints)

### **4.1 Create Product Variant**

**Endpoint:** `POST /api/products/:productId/variants`
**Auth:** Admin/Owner
**Description:** Create variant for product

**Request Body:**
```json
{
  "sku": "GMS-SYR-ELG-M-BLK",
  "ukuran": "M",
  "warna": "Black",
  "stok": 10,
  "hargaOverride": null,
  "aktif": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "sku": "GMS-SYR-ELG-M-BLK",
  "ukuran": "M",
  "warna": "Black",
  "stok": 10,
  "hargaOverride": null,
  "aktif": true,
  "dibuatPada": "2025-12-06T10:00:00.000Z"
}
```

---

### **4.2 Get Variants by Product ID**

**Endpoint:** `GET /api/products/:productId/variants`
**Auth:** None (Public)
**Description:** Get all variants of a product

**Query Parameters:**
- `includeInactive` (optional) - Include inactive variants (default: false)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "sku": "GMS-SYR-ELG-M-BLK",
    "ukuran": "M",
    "warna": "Black",
    "stok": 10,
    "hargaOverride": null,
    "aktif": true,
    "product": {
      "id": "uuid",
      "nama": "Gamis Syari Elegant",
      "hargaDasar": 250000
    },
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
]
```

---

### **4.3 Get Variant by ID**

**Endpoint:** `GET /api/variants/:id`
**Auth:** None (Public)
**Description:** Get variant details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "sku": "GMS-SYR-ELG-M-BLK",
  "ukuran": "M",
  "warna": "Black",
  "stok": 10,
  "hargaOverride": null,
  "aktif": true,
  "product": {
    "id": "uuid",
    "nama": "Gamis Syari Elegant",
    "hargaDasar": 250000,
    "gambarUrl": "https://res.cloudinary.com/..."
  },
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:00:00.000Z"
}
```

---

### **4.4 Update Variant**

**Endpoint:** `PUT /api/variants/:id`
**Auth:** Admin/Owner
**Description:** Update product variant

**Request Body:**
```json
{
  "stok": 15,
  "hargaOverride": 260000,
  "aktif": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "stok": 15,
  "hargaOverride": 260000,
  "aktif": true,
  "diupdatePada": "2025-12-06T11:00:00.000Z"
}
```

---

### **4.5 Delete Variant**

**Endpoint:** `DELETE /api/variants/:id`
**Auth:** Admin/Owner
**Description:** Delete product variant

**Response (200):**
```json
{
  "message": "Varian produk berhasil dihapus"
}
```

---

## 5. UPLOAD (1 Endpoint)

### **5.1 Upload Image**

**Endpoint:** `POST /api/upload/image`
**Auth:** Admin/Owner
**Description:** Upload image to Cloudinary

**Request:**
```
Content-Type: multipart/form-data

Body:
- file: <image_file>
- folder: "products" (optional)
```

**Response (201):**
```json
{
  "message": "Gambar berhasil diupload",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/products/abc123.jpg"
}
```

**Validations:**
- File type: image/* only
- Max file size: 5MB
- Auto-optimization: max 1000x1000, WebP format

**Note:** If Cloudinary not configured, returns placeholder URL

---

## 6. ORDERS (5 Endpoints)

### **6.1 Create Order (Checkout)**

**Endpoint:** `POST /api/orders`
**Auth:** Customer/Admin/Owner
**Description:** Create new order (checkout from cart)

**Request Body:**
```json
{
  "items": [
    {
      "productVariantId": "uuid",
      "kuantitas": 2
    },
    {
      "productVariantId": "uuid",
      "kuantitas": 1
    }
  ],
  "alamatPengiriman": {
    "namaPenerima": "John Doe",
    "teleponPenerima": "081234567890",
    "alamatBaris1": "Jl. Merdeka No. 123",
    "alamatBaris2": "Dekat Masjid Al-Ikhlas",
    "kota": "Jakarta Selatan",
    "provinsi": "DKI Jakarta",
    "kodePos": "12345"
  },
  "tipe": "READY",
  "ongkosKirim": 15000,
  "catatan": "Kirim pagi hari"
}
```

**Response (201):**
```json
{
  "message": "Order berhasil dibuat",
  "order": {
    "id": "uuid",
    "nomorOrder": "ORD-20251206-00001",
    "tipe": "READY",
    "status": "PENDING_PAYMENT",
    "namaPenerima": "John Doe",
    "teleponPenerima": "081234567890",
    "alamatBaris1": "Jl. Merdeka No. 123",
    "alamatBaris2": "Dekat Masjid Al-Ikhlas",
    "kota": "Jakarta Selatan",
    "provinsi": "DKI Jakarta",
    "kodePos": "12345",
    "subtotal": 500000,
    "ongkosKirim": 15000,
    "total": 515000,
    "catatan": "Kirim pagi hari",
    "items": [
      {
        "id": "uuid",
        "namaProduk": "Gamis Syari Elegant",
        "variantSku": "GMS-SYR-ELG-M-BLK",
        "variantUkuran": "M",
        "variantWarna": "Black",
        "kuantitas": 2,
        "harga": 250000,
        "subtotal": 500000
      }
    ],
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
}
```

**Features:**
- ✅ Automatic order number generation (ORD-YYYYMMDD-XXXXX)
- ✅ Stock validation and deduction
- ✅ Automatic subtotal and total calculation
- ✅ Address snapshot (denormalized)
- ✅ Product/variant snapshot in order items

---

### **6.2 Get My Orders**

**Endpoint:** `GET /api/orders/my-orders`
**Auth:** Customer/Admin/Owner
**Description:** Get all orders for current user

**Response (200):**
```json
[
  {
    "id": "uuid",
    "nomorOrder": "ORD-20251206-00001",
    "tipe": "READY",
    "status": "PENDING_PAYMENT",
    "total": 515000,
    "items": [
      {
        "namaProduk": "Gamis Syari Elegant",
        "kuantitas": 2,
        "harga": 250000
      }
    ],
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
]
```

---

### **6.3 Get Order by ID**

**Endpoint:** `GET /api/orders/:id`
**Auth:** Customer/Admin/Owner
**Description:** Get order details by ID

**Authorization:**
- Customer can only view own orders
- Admin/Owner can view all orders

**Response (200):**
```json
{
  "id": "uuid",
  "nomorOrder": "ORD-20251206-00001",
  "user": {
    "id": "uuid",
    "nama": "John Doe",
    "email": "customer@example.com"
  },
  "tipe": "READY",
  "status": "PENDING_PAYMENT",
  "namaPenerima": "John Doe",
  "teleponPenerima": "081234567890",
  "alamatBaris1": "Jl. Merdeka No. 123",
  "alamatBaris2": "Dekat Masjid Al-Ikhlas",
  "kota": "Jakarta Selatan",
  "provinsi": "DKI Jakarta",
  "kodePos": "12345",
  "subtotal": 500000,
  "ongkosKirim": 15000,
  "total": 515000,
  "catatan": "Kirim pagi hari",
  "items": [
    {
      "id": "uuid",
      "namaProduk": "Gamis Syari Elegant",
      "variantSku": "GMS-SYR-ELG-M-BLK",
      "variantUkuran": "M",
      "variantWarna": "Black",
      "kuantitas": 2,
      "harga": 250000,
      "subtotal": 500000,
      "product": {
        "id": "uuid",
        "gambarUrl": "https://..."
      }
    }
  ],
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:00:00.000Z"
}
```

---

### **6.4 Get All Orders (Admin)**

**Endpoint:** `GET /api/orders`
**Auth:** Admin/Owner
**Description:** Get all orders with pagination and filters

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `status` (optional) - Filter by status
- `tipe` (optional) - Filter by type (READY/PO)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nomorOrder": "ORD-20251206-00001",
      "user": {
        "nama": "John Doe",
        "email": "customer@example.com"
      },
      "status": "PENDING_PAYMENT",
      "total": 515000,
      "dibuatPada": "2025-12-06T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### **6.5 Update Order Status**

**Endpoint:** `PUT /api/orders/:id/status`
**Auth:** Admin/Owner
**Description:** Update order status

**Request Body:**
```json
{
  "status": "PAID"
}
```

**Response (200):**
```json
{
  "message": "Status order berhasil diupdate",
  "order": {
    "id": "uuid",
    "nomorOrder": "ORD-20251206-00001",
    "status": "PAID",
    "diupdatePada": "2025-12-06T11:00:00.000Z"
  }
}
```

**Valid Status Transitions:**
```
PENDING_PAYMENT → PAID → IN_PRODUCTION → READY_TO_SHIP → SHIPPED → DELIVERED → COMPLETED
                   ↓
                CANCELLED / REFUNDED / FAILED / EXPIRED
```

---

## 7. PAYMENTS (5 Endpoints)

### **7.1 Create Payment**

**Endpoint:** `POST /api/payments`
**Auth:** Customer/Admin/Owner
**Description:** Create payment and get Midtrans payment URL

**Request Body:**
```json
{
  "orderId": "uuid",
  "metode": "BANK_TRANSFER"
}
```

**Payment Methods:**
- `BANK_TRANSFER` - Bank Transfer (BCA, BNI, Mandiri, Permata)
- `QRIS` - QRIS (Quick Response Code Indonesian Standard)
- `E_WALLET` - E-Wallet (GoPay, ShopeePay)
- `CREDIT_CARD` - Credit/Debit Card
- `COD` - Cash on Delivery (manual)

**Response (201):**
```json
{
  "message": "Pembayaran berhasil dibuat",
  "payment": {
    "id": "uuid",
    "transactionId": "TRX-20251206-00001",
    "orderId": "uuid",
    "metode": "BANK_TRANSFER",
    "status": "PENDING",
    "jumlah": 515000,
    "urlPembayaran": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
    "kadaluarsaPada": "2025-12-07T10:00:00.000Z",
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
}
```

**Features:**
- ✅ Real Midtrans Snap API integration
- ✅ Automatic transaction ID generation (TRX-YYYYMMDD-XXXXX)
- ✅ Payment URL with 24-hour expiration
- ✅ Multiple payment methods support

---

### **7.2 Get Payments by Order ID**

**Endpoint:** `GET /api/payments/order/:orderId`
**Auth:** Customer/Admin/Owner
**Description:** Get all payments for an order

**Authorization:**
- Customer can only view payments for own orders
- Admin/Owner can view all payments

**Response (200):**
```json
[
  {
    "id": "uuid",
    "transactionId": "TRX-20251206-00001",
    "orderId": "uuid",
    "metode": "BANK_TRANSFER",
    "status": "PENDING",
    "jumlah": 515000,
    "urlPembayaran": "https://app.sandbox.midtrans.com/...",
    "kadaluarsaPada": "2025-12-07T10:00:00.000Z",
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
]
```

---

### **7.3 Get Payment by ID**

**Endpoint:** `GET /api/payments/:id`
**Auth:** Customer/Admin/Owner
**Description:** Get payment details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "transactionId": "TRX-20251206-00001",
  "orderId": "uuid",
  "metode": "BANK_TRANSFER",
  "status": "SETTLEMENT",
  "jumlah": 515000,
  "urlPembayaran": "https://app.sandbox.midtrans.com/...",
  "kadaluarsaPada": "2025-12-07T10:00:00.000Z",
  "dibayarPada": "2025-12-06T10:30:00.000Z",
  "midtransTransactionId": "abc123",
  "midtransOrderId": "TRX-20251206-00001",
  "midtransGrossAmount": 515000,
  "midtransPaymentType": "bank_transfer",
  "midtransTransactionStatus": "settlement",
  "midtransFraudStatus": "accept",
  "order": {
    "id": "uuid",
    "nomorOrder": "ORD-20251206-00001",
    "total": 515000
  },
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-06T10:30:00.000Z"
}
```

---

### **7.4 Update Payment Status (Manual)**

**Endpoint:** `PUT /api/payments/:id/status`
**Auth:** Admin/Owner
**Description:** Manually update payment status (for COD or manual verification)

**Request Body:**
```json
{
  "status": "SETTLEMENT"
}
```

**Response (200):**
```json
{
  "message": "Status pembayaran berhasil diupdate",
  "payment": {
    "id": "uuid",
    "status": "SETTLEMENT",
    "dibayarPada": "2025-12-06T11:00:00.000Z"
  }
}
```

**Valid Statuses:**
- `PENDING` - Waiting for payment
- `SETTLEMENT` - Payment successful
- `DENY` - Payment denied
- `CANCEL` - Payment cancelled
- `EXPIRE` - Payment expired
- `REFUND` - Payment refunded

---

### **7.5 Midtrans Webhook**

**Endpoint:** `POST /api/payments/webhook`
**Auth:** None (Public, but signature verified)
**Description:** Receive payment notification from Midtrans

**Request Body (from Midtrans):**
```json
{
  "transaction_time": "2025-12-06 10:30:00",
  "transaction_status": "settlement",
  "transaction_id": "abc123",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "sha512_hash",
  "payment_type": "bank_transfer",
  "order_id": "TRX-20251206-00001",
  "merchant_id": "G123456789",
  "gross_amount": "515000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response (200):**
```json
{
  "message": "Webhook berhasil diproses"
}
```

**Features:**
- ✅ SHA512 signature verification
- ✅ Automatic payment status update
- ✅ Automatic order status update
- ✅ Complete Midtrans response storage

---

## 8. SHIPMENTS (4 Endpoints)

### **8.1 Create Shipment**

**Endpoint:** `POST /api/shipments`
**Auth:** Admin/Owner
**Description:** Create shipment for paid order

**Request Body:**
```json
{
  "orderId": "uuid",
  "kurir": "JNE",
  "nomorResi": "JNE1234567890",
  "estimasiPengiriman": "2025-12-10",
  "catatan": "Fragile - Handle with care"
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
    "nomorResi": "JNE1234567890",
    "status": "PENDING",
    "estimasiPengiriman": "2025-12-10",
    "catatan": "Fragile - Handle with care",
    "dibuatPada": "2025-12-06T10:00:00.000Z"
  }
}
```

**Features:**
- ✅ Unique tracking number
- ✅ Automatic order status update to PROCESSING

---

### **8.2 Track Shipment**

**Endpoint:** `GET /api/shipments/track/:trackingNumber`
**Auth:** None (Public)
**Description:** Track shipment by tracking number

**Response (200):**
```json
{
  "id": "uuid",
  "nomorResi": "JNE1234567890",
  "kurir": "JNE",
  "status": "IN_TRANSIT",
  "estimasiPengiriman": "2025-12-10",
  "dikirimPada": "2025-12-07T08:00:00.000Z",
  "order": {
    "nomorOrder": "ORD-20251206-00001",
    "namaPenerima": "John Doe",
    "kota": "Jakarta Selatan"
  },
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-07T08:00:00.000Z"
}
```

---

### **8.3 Get Shipment by ID**

**Endpoint:** `GET /api/shipments/:id`
**Auth:** Customer/Admin/Owner
**Description:** Get shipment details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "orderId": "uuid",
  "kurir": "JNE",
  "nomorResi": "JNE1234567890",
  "status": "DELIVERED",
  "estimasiPengiriman": "2025-12-10",
  "dikirimPada": "2025-12-07T08:00:00.000Z",
  "diterimaPada": "2025-12-09T14:30:00.000Z",
  "catatan": "Fragile - Handle with care",
  "order": {
    "id": "uuid",
    "nomorOrder": "ORD-20251206-00001",
    "namaPenerima": "John Doe",
    "teleponPenerima": "081234567890",
    "alamatBaris1": "Jl. Merdeka No. 123",
    "kota": "Jakarta Selatan"
  },
  "dibuatPada": "2025-12-06T10:00:00.000Z",
  "diupdatePada": "2025-12-09T14:30:00.000Z"
}
```

---

### **8.4 Update Shipment Status**

**Endpoint:** `PUT /api/shipments/:id/status`
**Auth:** Admin/Owner
**Description:** Update shipment status

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
  "shipment": {
    "id": "uuid",
    "status": "SHIPPED",
    "dikirimPada": "2025-12-07T08:00:00.000Z",
    "diupdatePada": "2025-12-07T08:00:00.000Z"
  }
}
```

**Valid Statuses:**
- `PENDING` - Waiting to be shipped
- `PROCESSING` - Being prepared
- `SHIPPED` - Shipped (sets shipped_at timestamp)
- `IN_TRANSIT` - In transit
- `DELIVERED` - Delivered (sets delivered_at timestamp)
- `RETURNED` - Returned

**Automatic Order Status Updates:**
- `SHIPPED` → Order status: SHIPPED
- `DELIVERED` → Order status: DELIVERED

---

## ERROR RESPONSES

### **Common Error Formats**

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ]
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## STATUS CODES

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (email, slug, SKU) |
| 500 | Internal Server Error | Server error |

---

## APPENDIX

### **Order Status Flow**

```
PENDING_PAYMENT
    ↓ (payment success)
PAID
    ↓ (admin starts production)
IN_PRODUCTION
    ↓ (production complete)
READY_TO_SHIP
    ↓ (admin creates shipment)
PROCESSING
    ↓ (admin ships order)
SHIPPED
    ↓ (customer receives)
DELIVERED
    ↓ (order complete)
COMPLETED
```

### **Payment Status Flow**

```
PENDING
    ↓ (Midtrans webhook: settlement)
SETTLEMENT
    ↓ (order status → PAID)
```

### **Shipment Status Flow**

```
PENDING
    ↓
PROCESSING
    ↓
SHIPPED
    ↓
IN_TRANSIT
    ↓
DELIVERED
```

---

## 📚 RESOURCES

- **Postman Collection:** Import `MyMedina-API.postman_collection.json`
- **Midtrans Documentation:** https://docs.midtrans.com/
- **Midtrans Simulator:** https://simulator.sandbox.midtrans.com/
- **Setup Guide:** See `SETUP_GUIDE.md`
- **Week 1 Documentation:** See `WEEK1_DOCUMENTATION.md`
- **Week 2 Documentation:** See `WEEK2_DOCUMENTATION.md`
- **Week 3 Documentation:** See `WEEK3_DOCUMENTATION.md`
- **Midtrans Setup:** See `MIDTRANS_SETUP.md`

---

**Documentation Version:** 3.0
**Last Updated:** December 2025
**Total Endpoints:** 36 endpoints
**Status:** ✅ COMPLETE (Week 1-3)

---

**Author:** MyMedina Development Team
**Project:** MyMedina Backend - E-Commerce API
**Technology:** NestJS, TypeORM, PostgreSQL, Midtrans

