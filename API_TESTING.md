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
- **JWT Token**: Simpan `accessToken` untuk endpoint yang memerlukan authentication (akan dibuat nanti)
- **Redis**: Jika Redis belum running, verifikasi email akan error (skip dulu untuk testing basic flow)


