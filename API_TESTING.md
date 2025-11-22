# 🧪 API Testing - MyMedina Backend

## 📍 Base URL
```
http://localhost:5000/api
```

---

## 🔐 AUTH ENDPOINTS

### 1. **POST** `/auth/daftar` - Register Pengguna Baru

**Request Body:**
```json
{
  "email": "customer@test.com",
  "password": "Test1234",
  "nama": "Customer Test",
  "nomorTelepon": "081234567890"
}
```

**Response Success (201):**
```json
{
  "message": "Pendaftaran berhasil! Silakan cek email untuk verifikasi.",
  "user": {
    "id": "uuid-here",
    "email": "customer@test.com",
    "nama": "Customer Test",
    "nomorTelepon": "081234567890",
    "role": "CUSTOMER",
    "emailTerverifikasi": false,
    "aktif": true,
    "fotoProfil": null,
    "tokenReset": null,
    "tokenResetKadaluarsa": null,
    "dibuatPada": "2025-11-19T10:00:00.000Z",
    "diupdatePada": "2025-11-19T10:00:00.000Z",
    "dihapusPada": null
  },
  "tokenVerifikasi": "123456"
}
```

**Response Error (409 - Email sudah terdaftar):**
```json
{
  "statusCode": 409,
  "message": "Email sudah terdaftar",
  "error": "Conflict"
}
```

**Response Error (400 - Validation Error):**
```json
{
  "statusCode": 400,
  "message": [
    "Email tidak valid",
    "Password minimal 8 karakter",
    "Password harus mengandung huruf besar, huruf kecil, dan angka"
  ],
  "error": "Bad Request"
}
```

---

### 2. **GET** `/auth/verifikasi-email/:userId/:token` - Verifikasi Email

**URL Example:**
```
GET http://localhost:5000/api/auth/verifikasi-email/uuid-here/123456
```

**Response Success (200):**
```json
{
  "message": "Email berhasil diverifikasi! Silakan login."
}
```

**Response Error (400):**
```json
{
  "statusCode": 400,
  "message": "Token verifikasi tidak valid atau sudah kadaluarsa",
  "error": "Bad Request"
}
```

---

### 3. **POST** `/auth/login` - Login Pengguna

**Request Body:**
```json
{
  "email": "customer@test.com",
  "password": "Test1234"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "customer@test.com",
    "nama": "Customer Test",
    "nomorTelepon": "081234567890",
    "role": "CUSTOMER",
    "emailTerverifikasi": true,
    "aktif": true,
    "fotoProfil": null,
    "tokenReset": null,
    "tokenResetKadaluarsa": null,
    "dibuatPada": "2025-11-19T10:00:00.000Z",
    "diupdatePada": "2025-11-19T10:00:00.000Z",
    "dihapusPada": null
  }
}
```

**Response Error (401 - Email/Password salah):**
```json
{
  "statusCode": 401,
  "message": "Email atau password salah",
  "error": "Unauthorized"
}
```

**Response Error (401 - Email belum diverifikasi):**
```json
{
  "statusCode": 401,
  "message": "Email belum diverifikasi. Silakan cek email Anda.",
  "error": "Unauthorized"
}
```

---

### 4. **POST** `/auth/lupa-password` - Request Reset Password

**Request Body:**
```json
{
  "email": "customer@test.com"
}
```

**Response Success (200):**
```json
{
  "message": "Jika email terdaftar, link reset password akan dikirim ke email Anda.",
  "tokenReset": "64-character-hex-token-here"
}
```

---

### 5. **POST** `/auth/reset-password/:token` - Reset Password

**URL Example:**
```
POST http://localhost:5000/api/auth/reset-password/64-character-hex-token-here
```

**Request Body:**
```json
{
  "passwordBaru": "NewPass1234"
}
```

**Response Success (200):**
```json
{
  "message": "Password berhasil direset! Silakan login dengan password baru."
}
```

**Response Error (400 - Token invalid):**
```json
{
  "statusCode": 400,
  "message": "Token reset password tidak valid",
  "error": "Bad Request"
}
```

**Response Error (400 - Token expired):**
```json
{
  "statusCode": 400,
  "message": "Token reset password sudah kadaluarsa",
  "error": "Bad Request"
}
```

---

## 🧪 TESTING FLOW

### **Flow 1: Register → Verify → Login**

1. **Register** pengguna baru
   - POST `/auth/daftar`
   - Simpan `userId` dan `tokenVerifikasi` dari response

2. **Verify Email**
   - GET `/auth/verifikasi-email/{userId}/{tokenVerifikasi}`

3. **Login**
   - POST `/auth/login`
   - Simpan `accessToken` dari response

### **Flow 2: Forgot Password → Reset Password → Login**

1. **Request Reset Password**
   - POST `/auth/lupa-password`
   - Simpan `tokenReset` dari response

2. **Reset Password**
   - POST `/auth/reset-password/{tokenReset}`

3. **Login dengan password baru**
   - POST `/auth/login`

---

## 📌 NOTES

- **Development Mode**: Token verifikasi dan token reset akan di-return di response (untuk testing)
- **Production Mode**: Token hanya dikirim via email, tidak di-return di response
- **JWT Token**: Simpan `accessToken` untuk endpoint yang memerlukan authentication
- **Email Service**: Email service sudah terintegrasi tapi SMTP belum dikonfigurasi (skip untuk development)

---

## 📁 CATEGORIES ENDPOINTS

### 1. **GET** `/categories` - List All Categories (Public)

**Request:**
```http
GET http://localhost:5000/api/categories
```

**Query Parameters (Optional):**
- `includeInactive` (boolean) - Include inactive categories (default: false)

**Response Success (200):**
```json
[
  {
    "id": "uuid-here",
    "nama": "Gamis",
    "slug": "gamis",
    "deskripsi": "Koleksi gamis syari untuk muslimah",
    "parentId": null,
    "aktif": true,
    "dibuatPada": "2025-11-22T00:00:00.000Z",
    "diupdatePada": "2025-11-22T00:00:00.000Z"
  },
  {
    "id": "uuid-here",
    "nama": "Tunik",
    "slug": "tunik",
    "deskripsi": "Tunik casual dan formal untuk sehari-hari",
    "parentId": null,
    "aktif": true,
    "dibuatPada": "2025-11-22T00:00:00.000Z",
    "diupdatePada": "2025-11-22T00:00:00.000Z"
  }
]
```

---

### 2. **GET** `/categories/:id` - Get Category Detail (Public)

**Request:**
```http
GET http://localhost:5000/api/categories/{categoryId}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "nama": "Gamis",
  "slug": "gamis",
  "deskripsi": "Koleksi gamis syari untuk muslimah",
  "parentId": null,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z",
  "parent": null,
  "subKategori": []
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "Kategori tidak ditemukan",
  "error": "Not Found"
}
```

---

### 3. **POST** `/categories` - Create Category (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nama": "Khimar",
  "slug": "khimar",
  "deskripsi": "Koleksi khimar syari",
  "parentId": null,
  "aktif": true
}
```

**Response Success (201):**
```json
{
  "id": "uuid-here",
  "nama": "Khimar",
  "slug": "khimar",
  "deskripsi": "Koleksi khimar syari",
  "parentId": null,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z"
}
```

**Response Error (409 - Slug already exists):**
```json
{
  "statusCode": 409,
  "message": "Slug 'khimar' sudah digunakan",
  "error": "Conflict"
}
```

**Response Error (401 - Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Response Error (403 - Forbidden - Not Admin):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

### 4. **PUT** `/categories/:id` - Update Category (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body (All fields optional):**
```json
{
  "nama": "Gamis Updated",
  "deskripsi": "Updated description"
}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "nama": "Gamis Updated",
  "slug": "gamis",
  "deskripsi": "Updated description",
  "parentId": null,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T01:00:00.000Z"
}
```

---

### 5. **DELETE** `/categories/:id` - Delete Category (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
  "message": "Kategori berhasil dihapus"
}
```

**Response Error (400 - Has subcategories):**
```json
{
  "statusCode": 400,
  "message": "Tidak dapat menghapus kategori yang memiliki sub-kategori",
  "error": "Bad Request"
}
```

---

## 📦 PRODUCTS ENDPOINTS

### 1. **GET** `/products` - List All Products (Public)

**Request:**
```http
GET http://localhost:5000/api/products?page=1&limit=10&search=gamis&categoryId=xxx&status=READY&active=true
```

**Query Parameters (All Optional):**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search in nama and deskripsi (case-insensitive)
- `categoryId` (uuid) - Filter by category ID
- `status` (enum) - Filter by status: READY, PO, DISCONTINUED
- `active` (boolean) - Filter by active status (default: true)

**Response Success (200):**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "categoryId": "uuid-here",
      "nama": "Gamis Syari Premium",
      "slug": "gamis-syari-premium",
      "deskripsi": "Gamis syari dengan bahan premium, nyaman dipakai seharian",
      "hargaDasar": 350000,
      "berat": 500,
      "status": "READY",
      "aktif": true,
      "gambarUrl": "https://via.placeholder.com/500x500.png?text=Gamis+Syari+Premium",
      "dibuatPada": "2025-11-22T00:00:00.000Z",
      "diupdatePada": "2025-11-22T00:00:00.000Z",
      "dihapusPada": null,
      "category": {
        "id": "uuid-here",
        "nama": "Gamis",
        "slug": "gamis"
      }
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

### 2. **GET** `/products/:id` - Get Product Detail (Public)

**Request:**
```http
GET http://localhost:5000/api/products/{productId}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "categoryId": "uuid-here",
  "nama": "Gamis Syari Premium",
  "slug": "gamis-syari-premium",
  "deskripsi": "Gamis syari dengan bahan premium, nyaman dipakai seharian",
  "hargaDasar": 350000,
  "berat": 500,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://via.placeholder.com/500x500.png?text=Gamis+Syari+Premium",
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z",
  "dihapusPada": null,
  "category": {
    "id": "uuid-here",
    "nama": "Gamis",
    "slug": "gamis",
    "deskripsi": "Koleksi gamis syari untuk muslimah"
  }
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "Produk tidak ditemukan",
  "error": "Not Found"
}
```

---

### 3. **POST** `/products` - Create Product (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "categoryId": "uuid-here",
  "nama": "Test Product",
  "slug": "test-product",
  "deskripsi": "This is a test product",
  "hargaDasar": 100000,
  "berat": 300,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://via.placeholder.com/500x500.png?text=Test+Product"
}
```

**Response Success (201):**
```json
{
  "id": "uuid-here",
  "categoryId": "uuid-here",
  "nama": "Test Product",
  "slug": "test-product",
  "deskripsi": "This is a test product",
  "hargaDasar": 100000,
  "berat": 300,
  "status": "READY",
  "aktif": true,
  "gambarUrl": "https://via.placeholder.com/500x500.png?text=Test+Product",
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z",
  "dihapusPada": null
}
```

**Response Error (404 - Category not found):**
```json
{
  "statusCode": 404,
  "message": "Kategori tidak ditemukan",
  "error": "Not Found"
}
```

**Response Error (409 - Slug already exists):**
```json
{
  "statusCode": 409,
  "message": "Slug 'test-product' sudah digunakan",
  "error": "Conflict"
}
```

---

### 4. **PUT** `/products/:id` - Update Product (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body (All fields optional):**
```json
{
  "hargaDasar": 120000,
  "status": "PO"
}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "categoryId": "uuid-here",
  "nama": "Test Product",
  "slug": "test-product",
  "deskripsi": "This is a test product",
  "hargaDasar": 120000,
  "berat": 300,
  "status": "PO",
  "aktif": true,
  "gambarUrl": "https://via.placeholder.com/500x500.png?text=Test+Product",
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T01:00:00.000Z",
  "dihapusPada": null
}
```

---

### 5. **DELETE** `/products/:id` - Soft Delete Product (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
  "message": "Produk berhasil dihapus"
}
```

**Note:** This is a soft delete. Product will be marked as deleted but not removed from database.

---

## 🎨 PRODUCT VARIANTS ENDPOINTS

### 1. **GET** `/products/:productId/variants` - List Variants by Product (Public)

**Request:**
```http
GET http://localhost:5000/api/products/{productId}/variants?includeInactive=false
```

**Query Parameters (Optional):**
- `includeInactive` (boolean) - Include inactive variants (default: false)

**Response Success (200):**
```json
[
  {
    "id": "uuid-here",
    "productId": "uuid-here",
    "sku": "GAMIS-SYARI-PREMIUM-S-HITAM-1",
    "ukuran": "S",
    "warna": "Hitam",
    "stok": 45,
    "hargaOverride": null,
    "aktif": true,
    "dibuatPada": "2025-11-22T00:00:00.000Z",
    "diupdatePada": "2025-11-22T00:00:00.000Z"
  },
  {
    "id": "uuid-here",
    "productId": "uuid-here",
    "sku": "GAMIS-SYARI-PREMIUM-M-NAVY-2",
    "ukuran": "M",
    "warna": "Navy",
    "stok": 32,
    "hargaOverride": null,
    "aktif": true,
    "dibuatPada": "2025-11-22T00:00:00.000Z",
    "diupdatePada": "2025-11-22T00:00:00.000Z"
  }
]
```

---

### 2. **GET** `/variants/:id` - Get Variant Detail (Public)

**Request:**
```http
GET http://localhost:5000/api/variants/{variantId}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "productId": "uuid-here",
  "sku": "GAMIS-SYARI-PREMIUM-S-HITAM-1",
  "ukuran": "S",
  "warna": "Hitam",
  "stok": 45,
  "hargaOverride": null,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z",
  "product": {
    "id": "uuid-here",
    "nama": "Gamis Syari Premium",
    "slug": "gamis-syari-premium",
    "hargaDasar": 350000
  }
}
```

**Response Error (404):**
```json
{
  "statusCode": 404,
  "message": "Varian tidak ditemukan",
  "error": "Not Found"
}
```

---

### 3. **POST** `/products/:productId/variants` - Create Variant (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "sku": "TEST-VARIANT-001",
  "ukuran": "M",
  "warna": "Hitam",
  "stok": 50,
  "hargaOverride": 120000,
  "aktif": true
}
```

**Response Success (201):**
```json
{
  "id": "uuid-here",
  "productId": "uuid-here",
  "sku": "TEST-VARIANT-001",
  "ukuran": "M",
  "warna": "Hitam",
  "stok": 50,
  "hargaOverride": 120000,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T00:00:00.000Z"
}
```

**Response Error (404 - Product not found):**
```json
{
  "statusCode": 404,
  "message": "Produk tidak ditemukan",
  "error": "Not Found"
}
```

**Response Error (409 - SKU already exists):**
```json
{
  "statusCode": 409,
  "message": "SKU 'TEST-VARIANT-001' sudah digunakan",
  "error": "Conflict"
}
```

---

### 4. **PUT** `/variants/:id` - Update Variant (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body (All fields optional):**
```json
{
  "stok": 100,
  "hargaOverride": 130000
}
```

**Response Success (200):**
```json
{
  "id": "uuid-here",
  "productId": "uuid-here",
  "sku": "TEST-VARIANT-001",
  "ukuran": "M",
  "warna": "Hitam",
  "stok": 100,
  "hargaOverride": 130000,
  "aktif": true,
  "dibuatPada": "2025-11-22T00:00:00.000Z",
  "diupdatePada": "2025-11-22T01:00:00.000Z"
}
```

---

### 5. **DELETE** `/variants/:id` - Delete Variant (Admin Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response Success (200):**
```json
{
  "message": "Varian berhasil dihapus"
}
```

---

## 📤 UPLOAD ENDPOINT

### 1. **POST** `/upload/image` - Upload Image (Admin/Owner Only)

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file` (file) - Image file (max 5MB, must be image/*)

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer {jwt_token}" \
  -F "file=@/path/to/image.jpg"
```

**Response Success (201):**
```json
{
  "message": "Gambar berhasil diupload",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/mymedina/abc123.jpg"
}
```

**Response Success (201 - Cloudinary not configured):**
```json
{
  "message": "Gambar berhasil diupload",
  "url": "https://via.placeholder.com/500x500.png?text=image.jpg"
}
```

**Response Error (400 - Invalid file type):**
```json
{
  "statusCode": 400,
  "message": "File harus berupa gambar",
  "error": "Bad Request"
}
```

**Response Error (400 - File too large):**
```json
{
  "statusCode": 400,
  "message": "Ukuran file maksimal 5MB",
  "error": "Bad Request"
}
```

**Note:**
- Cloudinary credentials are optional for development
- If not configured, placeholder URLs will be returned
- Image transformations: max 1000x1000, auto quality, auto format (WebP)

---

## 📝 NOTES

### Authentication
- **Public Endpoints**: No authentication required (GET endpoints for categories, products, variants)
- **Protected Endpoints**: Require JWT token in Authorization header
- **Admin Only**: Require JWT token + ADMIN or OWNER role

### Pagination
- Default page: 1
- Default limit: 10
- Maximum limit: 100

### Search
- Case-insensitive
- Searches in `nama` and `deskripsi` fields
- Uses ILIKE operator (PostgreSQL)

### Soft Delete
- Products use soft delete (@DeleteDateColumn)
- Soft-deleted products are excluded from queries by default
- Can be restored by setting `dihapusPada` to null

### Image Upload
- Supported formats: All image/* MIME types (jpg, png, gif, webp, etc.)
- Max file size: 5MB
- Auto-transformation: Resized to max 1000x1000, optimized quality, auto format
- Cloudinary is optional - returns placeholder URLs if not configured

### Seed Data
- Run `npm run seed` to populate database with sample data
- Creates 5 categories, 10 products, 30 variants
- Safe to run multiple times (will create duplicates)

---

