# 🔐 Midtrans Payment Gateway Integration

## 📋 **Overview**

MyMedina Backend sudah terintegrasi dengan **Midtrans Payment Gateway** untuk memproses pembayaran online.

**Midtrans** adalah payment gateway terbesar di Indonesia yang mendukung berbagai metode pembayaran:
- Bank Transfer (BCA, BNI, Mandiri, Permata, dll)
- QRIS (Quick Response Code Indonesian Standard)
- E-Wallet (GoPay, OVO, DANA, ShopeePay, dll)
- Credit/Debit Card (Visa, Mastercard, JCB)

---

## 🚀 **Setup Instructions**

### **1. Daftar Akun Midtrans**

1. Buka [https://dashboard.midtrans.com/register](https://dashboard.midtrans.com/register)
2. Daftar akun baru (gunakan email aktif)
3. Verifikasi email
4. Login ke dashboard

### **2. Dapatkan API Keys**

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Pilih environment **Sandbox** (untuk testing)
3. Klik **Settings** → **Access Keys**
4. Copy:
   - **Server Key** (contoh: `SB-Mid-server-xxxxxxxxxxxxx`)
   - **Client Key** (contoh: `SB-Mid-client-xxxxxxxxxxxxx`)

### **3. Update `.env` File**

Buka file `Code/my-medina-backend/.env` dan update:

```env
# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
```

**⚠️ PENTING:**
- Ganti `YOUR_SERVER_KEY_HERE` dengan Server Key dari dashboard
- Ganti `YOUR_CLIENT_KEY_HERE` dengan Client Key dari dashboard
- Set `MIDTRANS_IS_PRODUCTION=false` untuk testing (Sandbox)
- Set `MIDTRANS_IS_PRODUCTION=true` untuk production (setelah verifikasi bisnis)

### **4. Setup Webhook URL (Opsional untuk Testing Lokal)**

Untuk testing di localhost, Anda perlu expose localhost ke internet agar Midtrans bisa kirim webhook.

**Menggunakan ngrok:**

```bash
# Install ngrok (https://ngrok.com/)
ngrok http 5000
```

Ngrok akan memberikan URL publik (contoh: `https://abc123.ngrok.io`)

**Update Webhook URL di Midtrans Dashboard:**
1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Klik **Settings** → **Configuration**
3. Set **Payment Notification URL** ke: `https://abc123.ngrok.io/api/payments/webhook`
4. Save

---

## 🔄 **Payment Flow**

### **1. Customer Creates Payment**

```http
POST /api/payments
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "orderId": "uuid-order-id",
  "metode": "BANK_TRANSFER"
}
```

**Response:**
```json
{
  "message": "Pembayaran berhasil dibuat",
  "payment": {
    "id": "uuid",
    "transactionId": "TRX-20240115-00001",
    "urlPembayaran": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
    "status": "PENDING",
    "jumlah": 150000,
    "kadaluarsaPada": "2024-01-16T10:00:00.000Z"
  }
}
```

### **2. Customer Pays via Midtrans**

Customer membuka `urlPembayaran` dan melakukan pembayaran melalui Midtrans.

### **3. Midtrans Sends Webhook**

Setelah pembayaran berhasil, Midtrans akan kirim webhook ke:
```
POST /api/payments/webhook
```

Backend akan otomatis:
- Verify signature
- Update payment status ke `SETTLEMENT`
- Update order status ke `PAID`

---

## 🧪 **Testing**

### **Test Payment di Sandbox**

Midtrans Sandbox menyediakan test credentials:

**Bank Transfer:**
- Pilih bank (BCA, BNI, Mandiri, dll)
- Copy nomor VA yang diberikan
- Gunakan [Midtrans Simulator](https://simulator.sandbox.midtrans.com/) untuk simulasi pembayaran

**QRIS:**
- Scan QR code dengan app Midtrans Simulator

**E-Wallet (GoPay):**
- Nomor HP: `081234567890`
- OTP: `123456`

**Credit Card:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp: `01/25`

---

## 📊 **Endpoints**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments` | JWT | Create payment (get Midtrans URL) |
| GET | `/api/payments/order/:orderId` | JWT | Get payments by order ID |
| GET | `/api/payments/:id` | JWT | Get payment by ID |
| PUT | `/api/payments/:id/status` | Admin | Manual update payment status |
| POST | `/api/payments/webhook` | Public | Midtrans webhook (auto-update) |

---

## 🔒 **Security**

- ✅ Webhook signature verification (SHA512 hash)
- ✅ Server Key tidak pernah di-expose ke frontend
- ✅ HTTPS required untuk production
- ✅ Payment URL expires dalam 24 jam

---

## 📚 **Resources**

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans Snap API](https://snap-docs.midtrans.com/)
- [Midtrans Simulator](https://simulator.sandbox.midtrans.com/)
- [Midtrans Dashboard](https://dashboard.midtrans.com/)

