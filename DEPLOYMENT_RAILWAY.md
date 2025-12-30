# 🚀 Deployment Guide - Railway

Panduan lengkap untuk deploy MyMedina Backend ke Railway.

---

## 📋 Prasyarat

1. ✅ Akun Railway - [Daftar di railway.app](https://railway.app/)
2. ✅ Akun GitHub (untuk connect repository)
3. ✅ Project sudah di-push ke GitHub repository
4. ✅ Environment variables sudah disiapkan

---

## 🎯 Langkah Deploy

### 1️⃣ Persiapan Project

File-file berikut sudah dibuat:

- ✅ `Procfile` - Command untuk start aplikasi
- ✅ `railway.json` - Konfigurasi Railway
- ✅ `.railwayignore` - File yang diabaikan saat deploy
- ✅ `.env.example` - Template environment variables

### 2️⃣ Setup Database PostgreSQL di Railway

1. Buka [Railway Dashboard](https://railway.app/dashboard)
2. Klik **"New Project"**
3. Pilih **"Provision PostgreSQL"**
4. Database akan otomatis dibuat dengan credentials

**Catat credentials berikut dari PostgreSQL:**

- `PGHOST` → `DB_HOST`
- `PGPORT` → `DB_PORT`
- `PGUSER` → `DB_USERNAME`
- `PGPASSWORD` → `DB_PASSWORD`
- `PGDATABASE` → `DB_NAME`

### 3️⃣ Deploy Backend dari GitHub

1. Di project yang sama, klik **"New"** → **"GitHub Repo"**
2. Connect repository MyMedina Anda
3. Railway akan otomatis detect NestJS project
4. Deploy akan dimulai otomatis

### 4️⃣ Setup Environment Variables

Di Railway Dashboard → Backend Service → **Variables**, tambahkan:

```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app

# Database (dari PostgreSQL service di Railway)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRATION=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Midtrans (untuk payment)
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_IS_PRODUCTION=false

# Biteship (untuk shipping Indonesia)
BITESHIP_API_KEY=your-biteship-api-key

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=MyMedina <no-reply@mymedina.com>
```

**Tips Variables di Railway:**

- Railway otomatis provides PostgreSQL variables dengan syntax: `${{Postgres.VARIABLE_NAME}}`
- Klik **"Reference"** untuk link ke PostgreSQL service variables

### 5️⃣ Generate Domain

1. Di **Settings** → **Networking**
2. Klik **"Generate Domain"**
3. Anda akan dapat URL seperti: `https://your-app-name.railway.app`
4. Gunakan URL ini sebagai `BACKEND_URL` di frontend

### 6️⃣ Database Migration & Seeding

Setelah deploy berhasil, jalankan migration:

**Opsi A: Via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration (jika ada)
railway run npm run migration:run

# Seed database
railway run npm run seed
```

**Opsi B: Manual via TypeORM**

- TypeORM dengan `synchronize: true` akan auto-create tables
- ⚠️ **Untuk production, set `synchronize: false`** dan gunakan migrations

### 7️⃣ Verify Deployment

Cek apakah API berjalan:

```bash
curl https://your-app-name.railway.app/api
```

Response yang diharapkan:

```json
{
  "message": "Welcome to MyMedina API"
}
```

---

## 🔧 Troubleshooting

### ❌ Build Failed

**Cek logs di Railway:**

1. Klik service → **"Deployments"**
2. Lihat build logs
3. Biasanya error di dependencies atau TypeScript

**Solusi:**

```bash
# Local test build
npm run build

# Pastikan semua dependencies ada
npm install
```

### ❌ Error: Cannot find module '@css-inline/css-inline-linux-x64-gnu'

**Penyebab:**
Native binary dari `@css-inline` (digunakan oleh email module) tidak terinstall dengan benar.

**Solusi:** ✅ Sudah diperbaiki dengan:

- Menambahkan `@css-inline/css-inline` sebagai dependency eksplisit
- Menambahkan `postinstall` script untuk rebuild native modules
- Menambahkan `.npmrc` untuk force install optional dependencies
- Update Railway build command dengan `--include=optional`

**Jika masih error, coba:**

1. Force redeploy: Railway dashboard → **"Redeploy"**
2. Clear build cache: Settings → **"Clear Build Cache"** → Redeploy
3. Cek Node.js version (pastikan compatible dengan native binaries)

### ❌ Database Connection Error

**Cek:**

- ✅ PostgreSQL service running di Railway
- ✅ Environment variables benar (DB_HOST, DB_PORT, dll)
- ✅ Database reference variables benar: `${{Postgres.PGHOST}}`

### ❌ Application Crash

**Cek logs:**

```bash
railway logs
```

**Common issues:**

- Missing environment variables
- Port binding (pastikan pakai `process.env.PORT`)
- Database not ready (tunggu PostgreSQL fully deployed)

### ⚠️ CORS Error dari Frontend

Update `FRONTEND_URL` di environment variables dengan URL frontend yang benar.

---

## 🎛️ Configuration Tips

### Health Check

Railway otomatis detect health dari HTTP response. Pastikan root endpoint (`/api`) return 200 OK.

### Auto Deploy

Railway otomatis deploy saat push ke GitHub branch tertentu:

1. Settings → **"Deployments"**
2. Pilih branch untuk auto-deploy (default: `main`)

### Custom Domain

1. Settings → **"Networking"** → **"Custom Domain"**
2. Add domain Anda
3. Update DNS records sesuai instruksi

### Logs

Lihat real-time logs:

```bash
railway logs --follow
```

### Scaling (Paid Plan)

Untuk traffic tinggi:

1. Settings → **"Resources"**
2. Adjust memory & CPU

---

## 💰 Pricing

**Free Tier:**

- $5 credit gratis per bulan
- Cukup untuk development/testing
- Auto-sleep jika tidak ada traffic (5 menit idle)

**Hobby Plan ($5/month):**

- $5 usage included
- No auto-sleep
- Better untuk production

---

## 📝 Checklist Deploy

- [ ] Project di-push ke GitHub
- [ ] PostgreSQL service created di Railway
- [ ] Backend service connected dari GitHub
- [ ] Environment variables configured
- [ ] Build & deploy success
- [ ] Domain generated
- [ ] Database seeded (optional)
- [ ] API tested dengan Postman/curl
- [ ] Frontend updated dengan backend URL

---

## 🔗 Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [NestJS on Railway](https://docs.railway.app/guides/nestjs)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

---

## 🆘 Support

Jika ada masalah:

1. Check Railway logs
2. Check Railway community/Discord
3. Review NestJS production deployment docs

**Selamat Deploy! 🚀**
