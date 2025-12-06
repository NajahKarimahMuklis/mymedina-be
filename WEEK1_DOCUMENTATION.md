# 📚 WEEK 1: AUTHENTICATION MODULE - COMPLETE DOCUMENTATION

**Project:** MyMedina Backend - E-Commerce API  
**Module:** Authentication & User Management  
**Status:** ✅ COMPLETE & TESTED  
**Date Completed:** November 2025  
**Technology Stack:** NestJS, TypeORM, PostgreSQL, JWT, bcrypt, Nodemailer

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Endpoints](#endpoints)
6. [Security Features](#security-features)
7. [Testing Results](#testing-results)
8. [Files Created](#files-created)
9. [Design Patterns Used](#design-patterns-used)
10. [Next Steps](#next-steps)

---

## 1. OVERVIEW

Week 1 fokus pada implementasi **Authentication & User Management Module** yang merupakan foundation dari aplikasi MyMedina. Module ini menyediakan fitur registrasi, login, verifikasi email, dan reset password.

### **Key Achievements:**
- ✅ User Entity with TypeORM
- ✅ JWT stateless authentication
- ✅ Email verification (database-based, no Redis)
- ✅ Password reset functionality
- ✅ Role-based authorization (CUSTOMER, ADMIN, OWNER)
- ✅ Email service with Handlebars templates
- ✅ Rate limiting for security
- ✅ All 6 endpoints tested and working

---

## 2. ARCHITECTURE

### **Layered Architecture:**

```
┌─────────────────────────────────────────┐
│         CONTROLLER LAYER                │
│   (HTTP Request/Response Handling)      │
│   - AuthController                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          SERVICE LAYER                  │
│        (Business Logic)                 │
│   - AuthService                         │
│   - EmailService                        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       REPOSITORY LAYER                  │
│      (Data Access - TypeORM)            │
│   - UserRepository                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         DATABASE LAYER                  │
│          (PostgreSQL)                   │
│   - users table                         │
└─────────────────────────────────────────┘
```

### **Module Dependencies:**

```
AppModule
├── AuthModule
│   ├── JwtModule
│   ├── PassportModule
│   └── EmailModule
└── ThrottlerModule (Rate Limiting)
```

---

## 3. DATABASE SCHEMA

### **3.1 Users Table**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role role_enum DEFAULT 'CUSTOMER',
    email_verified BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    profile_picture VARCHAR(500),
    
    -- Email Verification (Built-in, no separate table)
    verification_token VARCHAR(6),
    verification_token_expires TIMESTAMP,
    
    -- Password Reset (Built-in, no separate table)
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TYPE role_enum AS ENUM ('CUSTOMER', 'ADMIN', 'OWNER');
```

**Indexes:**
- `idx_users_email` (unique)
- `idx_users_role`

**Features:**
- ✅ UUID primary key
- ✅ Email uniqueness constraint
- ✅ Password hashing with bcrypt (cost 12)
- ✅ Role-based access control
- ✅ Email verification built-in (no Redis needed)
- ✅ Password reset built-in
- ✅ Soft delete support

---

## 4. AUTHENTICATION FLOW

### **4.1 Registration Flow**

```
1. User submits registration form
   ↓
2. Validate input (email, password, name)
   ↓
3. Check if email already exists
   ↓
4. Hash password with bcrypt (cost 12)
   ↓
5. Generate 6-digit verification token
   ↓
6. Save user to database (email_verified = false)
   ↓
7. Send verification email
   ↓
8. Return success response
```

### **4.2 Email Verification Flow**

```
1. User clicks verification link in email
   ↓
2. Extract userId and token from URL
   ↓
3. Find user by ID
   ↓
4. Validate token and expiration (24 hours)
   ↓
5. Mark email as verified
   ↓
6. Clear verification token
   ↓
7. Return success response
```

### **4.3 Login Flow**

```
1. User submits email and password
   ↓
2. Find user by email
   ↓
3. Check if user exists
   ↓
4. Verify password with bcrypt
   ↓
5. Check if email is verified
   ↓
6. Check if account is active
   ↓
7. Generate JWT token (7 days expiry)
   ↓
8. Return token and user data
```

### **4.4 Password Reset Flow**

```
1. User requests password reset
   ↓
2. Find user by email
   ↓
3. Generate secure reset token (crypto.randomBytes)
   ↓
4. Save hashed token to database (1 hour expiry)
   ↓
5. Send reset email with link
   ↓
6. User clicks link and submits new password
   ↓
7. Validate token and expiration
   ↓
8. Hash new password
   ↓
9. Update password and clear reset token
   ↓
10. Return success response
```

---

## 5. ENDPOINTS

### **5.1 Register User**

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
    "role": "CUSTOMER",
    "emailTerverifikasi": false
  }
}
```

**Validations:**
- ✅ Email format validation
- ✅ Email uniqueness check
- ✅ Password minimum 8 characters
- ✅ Name required
- ✅ Phone number optional

---

### **5.2 Verify Email**

**Endpoint:** `GET /api/auth/verifikasi-email/:userId/:token`
**Auth:** None (Public)
**Description:** Verify user email with token

**URL Parameters:**
- `userId` - User UUID
- `token` - 6-digit verification token

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

### **5.3 Login**

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
    "role": "CUSTOMER",
    "emailTerverifikasi": true
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `401` - Email not verified
- `401` - Account inactive

---

### **5.4 Forgot Password**

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

### **5.5 Reset Password**

**Endpoint:** `POST /api/auth/reset-password/:token`
**Auth:** None (Public)
**Description:** Reset password with token

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

### **5.6 Get Profile**

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

## 6. SECURITY FEATURES

### **6.1 Password Security**

**Hashing Algorithm:** bcrypt
**Cost Factor:** 12 (2^12 = 4096 iterations)

```typescript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// Password verification
const isValid = await bcrypt.compare(password, user.hashPassword);
```

**Password Requirements:**
- Minimum 8 characters
- Recommended: Mix of uppercase, lowercase, numbers, symbols

---

### **6.2 JWT Authentication**

**Algorithm:** HS256 (HMAC with SHA-256)
**Expiration:** 7 days
**Payload:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Validation:**
- ✅ Signature verification
- ✅ Expiration check
- ✅ User existence check
- ✅ Account active check

---

### **6.3 Email Verification**

**Token Generation:**
```typescript
// Generate 6-digit random token
const token = Math.floor(100000 + Math.random() * 900000).toString();

// Set expiration (24 hours)
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 24);
```

**Security Features:**
- ✅ 6-digit numeric token
- ✅ 24-hour expiration
- ✅ One-time use (cleared after verification)
- ✅ Stored in database (no Redis needed)

---

### **6.4 Password Reset**

**Token Generation:**
```typescript
// Generate secure random token
const resetToken = crypto.randomBytes(32).toString('hex');

// Hash token before storing
const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// Set expiration (1 hour)
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1);
```

**Security Features:**
- ✅ Cryptographically secure random token
- ✅ Token hashed before storage
- ✅ 1-hour expiration
- ✅ One-time use
- ✅ Token cleared after use

---

### **6.5 Rate Limiting**

**Configuration:**
- TTL: 60 seconds
- Limit: 10 requests per TTL

```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 10,
}])
```

**Protected Endpoints:**
- All authentication endpoints
- Prevents brute force attacks

---

## 7. TESTING RESULTS

### **7.1 Testing Summary**

**Total Endpoints Tested:** 6 endpoints
**Success Rate:** 100% ✅
**Testing Tool:** Postman
**Testing Date:** November 2025

| Endpoint | Method | Status |
|----------|--------|--------|
| Register User | POST | ✅ PASSED |
| Verify Email | GET | ✅ PASSED |
| Login | POST | ✅ PASSED |
| Forgot Password | POST | ✅ PASSED |
| Reset Password | POST | ✅ PASSED |
| Get Profile | GET | ✅ PASSED |

### **7.2 Test Cases Executed**

#### **Registration Tests:**
- ✅ Register with valid data - Success
- ✅ Register with duplicate email - Error 409
- ✅ Register with invalid email - Error 400
- ✅ Register with weak password - Error 400
- ✅ Verification email sent successfully

#### **Email Verification Tests:**
- ✅ Verify with valid token - Success
- ✅ Verify with invalid token - Error 400
- ✅ Verify with expired token - Error 400
- ✅ Verify already verified email - Error 400

#### **Login Tests:**
- ✅ Login with valid credentials - Success, returns JWT
- ✅ Login with invalid password - Error 401
- ✅ Login with non-existent email - Error 401
- ✅ Login with unverified email - Error 401
- ✅ JWT token works for protected routes

#### **Password Reset Tests:**
- ✅ Request reset with valid email - Success
- ✅ Request reset with invalid email - Success (security)
- ✅ Reset with valid token - Success
- ✅ Reset with invalid token - Error 400
- ✅ Reset with expired token - Error 400

#### **Authorization Tests:**
- ✅ Access protected route with valid JWT - Success
- ✅ Access protected route without JWT - Error 401
- ✅ Access protected route with expired JWT - Error 401
- ✅ Access admin route as customer - Error 403
- ✅ Access admin route as admin - Success

---

## 8. FILES CREATED

### **8.1 Module Files**

```
src/modules/auth/
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── daftar.dto.ts
│   ├── login.dto.ts
│   ├── lupa-password.dto.ts
│   └── reset-password.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.module.ts
```

### **8.2 Email Service**

```
src/shared/email/
├── templates/
│   ├── verification-email.hbs
│   └── reset-password-email.hbs
├── email.service.ts
└── email.module.ts
```

### **8.3 Configuration Files**

```
src/config/
├── database.config.ts
└── jwt.config.ts

src/common/enums/
└── role.enum.ts
```

---

## 9. DESIGN PATTERNS USED

### **9.1 Architectural Patterns**

#### **1. Layered Architecture**
- Controller → Service → Repository → Database
- Clear separation of concerns

#### **2. Module Pattern**
- AuthModule encapsulates all auth-related code
- EmailModule for email functionality
- Reusable and maintainable

#### **3. Repository Pattern**
- TypeORM repositories for data access
- Abstraction over database operations

---

### **9.2 OOP Design Patterns**

#### **1. Dependency Injection**
```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
}
```

#### **2. Strategy Pattern**
```typescript
// JWT Strategy for authentication
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

#### **3. Guard Pattern**
```typescript
// Authentication guard
@UseGuards(JwtAuthGuard)

// Authorization guard
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

#### **4. Decorator Pattern**
```typescript
// Custom decorators
@CurrentUser() user: User
@Roles(Role.ADMIN, Role.OWNER)
```

#### **5. DTO Pattern**
```typescript
export class DaftarDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

### **9.3 SOLID Principles**

#### **S - Single Responsibility**
- AuthService: Authentication logic only
- EmailService: Email sending only
- UserRepository: Data access only

#### **O - Open/Closed**
- DTOs use validation decorators (extensible)
- Guards can be combined (composable)

#### **L - Liskov Substitution**
- All guards implement CanActivate interface
- All strategies extend PassportStrategy

#### **I - Interface Segregation**
- Specific DTOs for each operation
- No unnecessary properties

#### **D - Dependency Inversion**
- Services depend on Repository interface
- Not on concrete implementations

---

## 10. NEXT STEPS

### **10.1 Week 2: Product Catalog Module** ✅ COMPLETED

- ✅ Categories Module
- ✅ Products Module
- ✅ Product Variants Module
- ✅ Image Upload Module

### **10.2 Week 3: Orders & Checkout Module** (IN PROGRESS)

- Orders Module
- Payments Module (Midtrans Integration)
- Shipments Module

### **10.3 Week 4: Admin Panel & Deployment** (PLANNED)

- Admin Dashboard
- Reports & Analytics
- Testing (Unit & E2E)
- Production Deployment

---

## 11. LESSONS LEARNED

### **11.1 Technical Decisions**

#### **✅ Good Decisions:**
1. **JWT Stateless Authentication** - No session storage needed, scalable
2. **Database-based Verification** - No Redis dependency, simpler setup
3. **bcrypt Cost 12** - Good balance between security and performance
4. **Hybrid Naming Convention** - Clear for Indonesian team
5. **Email Templates with Handlebars** - Professional, maintainable

#### **⚠️ Challenges Faced:**
1. **Email Service Configuration** - Solved with graceful error handling
2. **TypeScript Type Safety** - Solved with proper type annotations
3. **JWT Token Validation** - Solved with custom guards

---

### **11.2 Best Practices Applied**

- ✅ **Password Security** - bcrypt with high cost factor
- ✅ **Token Security** - Cryptographically secure random tokens
- ✅ **Input Validation** - class-validator on all DTOs
- ✅ **Error Handling** - Consistent HTTP exceptions
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Soft Delete** - Data preservation
- ✅ **Email Verification** - Prevent fake accounts
- ✅ **Role-based Authorization** - Granular access control

---

## 12. APPENDIX

### **12.1 Environment Variables**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=MyMedina
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=MyMedina <noreply@mymedina.com>

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### **12.2 Useful Commands**

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Run production
npm run start:prod

# Run tests
npm run test
```

---

## 📝 SUMMARY

**Week 1 Authentication Module** berhasil diimplementasikan dengan lengkap dan telah ditest 100%. Module ini menyediakan foundation yang solid untuk development selanjutnya dengan fitur:

- ✅ Complete user authentication flow
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ JWT-based authorization
- ✅ Role-based access control
- ✅ Security best practices
- ✅ Professional email templates
- ✅ Comprehensive error handling

**Status:** ✅ PRODUCTION READY

---

**Documentation Version:** 1.0
**Last Updated:** December 2025
**Author:** MyMedina Development Team
**Status:** ✅ COMPLETE & VERIFIED

