# 🛍️ MyMedina Backend

> **Backend API untuk MyMedina** - E-commerce platform untuk Medina Stuff (Muslim Fashion Boutique)

Backend API yang dibangun dengan **NestJS** dan **TypeScript** untuk mendukung aplikasi e-commerce MyMedina yang menjual produk fashion muslim seperti gamis, tunik, hijab, dan aksesoris dengan dukungan Ready Stock dan Pre-Order (PO).

---

## 📋 **Deskripsi Project**

**MyMedina** adalah project tugas akhir mata kuliah **RPLBO (Rekayasa Perangkat Lunak Berorientasi Objek)** yang mengimplementasikan konsep OOP dan design patterns dalam pengembangan aplikasi e-commerce.

**Fitur Utama:**
- 🔐 Authentication & Authorization (JWT)
- 👥 User Management (Customer, Admin, Owner)
- 🛍️ Product Catalog dengan kategori
- 🛒 Shopping Cart & Checkout
- 💳 Payment Integration (Midtrans)
- 📦 Order Management
- 🚚 Shipment Tracking
- 📊 Admin Dashboard & Reports

---

## 🏗️ **Tech Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | ^10.0.0 | Backend Framework |
| **TypeScript** | ^5.1.3 | Programming Language |
| **PostgreSQL** | 14+ | Database |
| **TypeORM** | ^0.3.20 | ORM |
| **JWT** | ^10.2.0 | Authentication |
| **bcrypt** | ^5.1.1 | Password Hashing |
| **class-validator** | ^0.14.1 | DTO Validation |
| **class-transformer** | ^0.5.1 | Object Transformation |

---

## 📂 **Project Structure**

```
my-medina-backend/
├── src/
│   ├── modules/           # Feature modules
│   │   └── auth/          # ✅ Authentication module (DONE)
│   │       ├── entities/  # User entity
│   │       ├── dto/       # Data Transfer Objects
│   │       ├── guards/    # Auth guards
│   │       ├── strategies/# JWT strategy
│   │       ├── decorators/# Custom decorators
│   │       ├── auth.service.ts
│   │       ├── auth.controller.ts
│   │       └── auth.module.ts
│   ├── config/            # Configuration files
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── common/            # Shared utilities
│   ├── shared/            # Shared modules
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── database/              # Database scripts
├── .env                   # Environment variables
├── .env.example           # Environment template
├── API_TESTING.md         # API documentation
├── SETUP_GUIDE.md         # Setup instructions
└── README.md              # This file
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ & npm
- PostgreSQL 14+
- Git

### **Installation**

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd my-medina-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Create database
   createdb MyMedina

   # Or using psql
   psql -U postgres
   CREATE DATABASE "MyMedina";
   \q
   ```

4. **Configure environment**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env

   # Edit .env and set your database credentials
   DB_NAME=MyMedina
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Run application**
   ```bash
   # Development mode with hot-reload
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

6. **Access API**
   - Base URL: `http://localhost:5000/api`
   - API Documentation: See `API_TESTING.md`

---

## 📊 **Development Progress**

### **✅ Week 1: Authentication Module (100% COMPLETE)**

| Feature | Status | Endpoints |
|---------|--------|-----------|
| User Registration | ✅ DONE | `POST /api/auth/daftar` |
| Email Verification | ✅ DONE | `GET /api/auth/verifikasi-email/:userId/:token` |
| User Login | ✅ DONE | `POST /api/auth/login` |
| Forgot Password | ✅ DONE | `POST /api/auth/lupa-password` |
| Reset Password | ✅ DONE | `POST /api/auth/reset-password/:token` |
| JWT Authentication | ✅ DONE | JWT Strategy + Guards |
| Role-based Authorization | ✅ DONE | Roles Guard + Decorator |
| Rate Limiting | ✅ DONE | @nestjs/throttler |

**Key Achievements:**
- ✅ User Entity with TypeORM
- ✅ Password hashing with bcrypt (cost 12)
- ✅ Email verification using database fields (no Redis needed)
- ✅ JWT stateless authentication
- ✅ Role-based access control (CUSTOMER, ADMIN, OWNER)
- ✅ DTO validation with class-validator
- ✅ All endpoints tested and working

**Architecture Decision:**
- 🔄 **Removed Redis dependency** - Using database fields for email verification tokens
- ✅ Simpler architecture for development
- ✅ Easy to migrate to Redis later for production

---

### **⏳ Week 2: Product Catalog (PLANNED)**

| Feature | Status | Target |
|---------|--------|--------|
| Categories Module | ⏳ TODO | CRUD categories |
| Products Module | ⏳ TODO | CRUD products |
| Product Variants | ⏳ TODO | Size, color variants |
| Image Upload | ⏳ TODO | Cloudinary integration |
| Product Search & Filter | ⏳ TODO | Search, filter, pagination |

---

### **⏳ Week 3: Orders & Payments (PLANNED)**

| Feature | Status | Target |
|---------|--------|--------|
| Shopping Cart | ⏳ TODO | Add/remove items |
| Checkout Process | ⏳ TODO | Create order |
| Payment Integration | ⏳ TODO | Midtrans |
| Order Management | ⏳ TODO | Order status tracking |
| Shipment Tracking | ⏳ TODO | Shipping info |

---

### **⏳ Week 4: Admin & Deployment (PLANNED)**

| Feature | Status | Target |
|---------|--------|--------|
| Admin Dashboard | ⏳ TODO | Statistics |
| Reports | ⏳ TODO | Sales, products |
| Export Data | ⏳ TODO | CSV/Excel |
| Testing | ⏳ TODO | Unit & E2E tests |
| Deployment | ⏳ TODO | Railway/Render |

---

## 🏛️ **Architecture & Design Patterns**

### **OOP Principles Implemented:**
- ✅ **Encapsulation** - Private properties, getters/setters
- ✅ **Abstraction** - Interfaces, abstract classes
- ✅ **Inheritance** - Base entities, extended classes
- ✅ **Polymorphism** - Method overriding, interfaces

### **Design Patterns Used:**
- ✅ **Dependency Injection** - NestJS built-in DI container
- ✅ **Repository Pattern** - TypeORM repositories
- ✅ **Singleton Pattern** - Services as singletons
- ✅ **Guard Pattern** - Authentication & authorization guards
- ✅ **Decorator Pattern** - Custom decorators (@Roles, @Public)
- ✅ **Strategy Pattern** - JWT strategy for authentication
- ✅ **Factory Pattern** - Entity creation

### **Layered Architecture:**
```
Controller → Service → Repository → Database
    ↓          ↓           ↓
  HTTP      Business    Data Access
 Layer       Logic       Layer
```

---

## 🗄️ **Database Schema**

### **Current Tables:**

#### **users**
- `id` (UUID, PK)
- `email` (unique)
- `password_hash`
- `name`
- `phone`
- `role` (CUSTOMER, ADMIN, OWNER)
- `email_verified` (boolean)
- `active` (boolean)
- `profile_picture` (nullable)
- `verification_token` (varchar 6, nullable) ⭐ NEW
- `verification_token_expires` (timestamp, nullable) ⭐ NEW
- `reset_token` (varchar 255, nullable)
- `reset_token_expires` (timestamp, nullable)
- `created_at`
- `updated_at`
- `deleted_at` (soft delete)

**Indexes:**
- `idx_users_email` (unique)
- `idx_users_role`

---

## 🔐 **Security Features**

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with cost 12 |
| JWT Authentication | Stateless tokens, 7 days expiry |
| Rate Limiting | 10 requests per 60 seconds |
| Input Validation | class-validator DTOs |
| SQL Injection Prevention | TypeORM parameterized queries |
| CORS | Enabled for frontend URL |
| Soft Delete | Paranoid mode for user data |

---

## 📝 **Naming Convention (Hybrid Approach)**

Untuk memudahkan kolaborasi dan maintainability:

| Element | Convention | Example |
|---------|-----------|---------|
| **Class Names** | English PascalCase | `User`, `AuthService`, `AuthController` |
| **Properties** | Bahasa Indonesia camelCase | `nama`, `nomorTelepon`, `emailTerverifikasi` |
| **Methods** | Bahasa Indonesia camelCase | `daftarPengguna()`, `loginPengguna()` |
| **Database Columns** | English snake_case | `name`, `phone`, `email_verified` |
| **DTOs** | Bahasa Indonesia | `DaftarDto`, `LoginDto` |
| **Endpoints** | Bahasa Indonesia kebab-case | `/auth/daftar`, `/auth/login` |

---

## 🧪 **Testing**

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Testing Status:**
- ⏳ Unit tests: TODO
- ⏳ E2E tests: TODO
- ✅ Manual API testing: DONE (see `API_TESTING.md`)

---

## 📚 **Documentation**

- **API Testing Guide**: `API_TESTING.md` - Complete API endpoints documentation
- **Setup Guide**: `SETUP_GUIDE.md` - Detailed setup instructions
- **Database Schema**: `../Database/SIMPLIFIED_README.md` - Database documentation
- **Implementation Roadmap**: `../Database/IMPLEMENTATION_ROADMAP.md` - 4-week plan

---

## 🛠️ **Development Commands**

```bash
# Development
npm run start:dev          # Start with hot-reload

# Build
npm run build              # Compile TypeScript

# Production
npm run start:prod         # Run production build

# Linting
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Database
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

---

## 🌐 **Environment Variables**

See `.env.example` for all available environment variables:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MyMedina
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

---





---


---

## 🙏 **Acknowledgments**

- **NestJS** - Progressive Node.js framework
- **TypeORM** - Amazing ORM for TypeScript
- **PostgreSQL** - Powerful open-source database
   

---

**Last Updated:** 19 November 2025
**Version:** 1.0.0 (Week 1 Complete)
**Status:** 🟢 Active Development
