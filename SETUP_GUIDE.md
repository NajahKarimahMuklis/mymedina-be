# MyMedina Backend - Setup Guide

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed
- ✅ npm or yarn installed

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Create PostgreSQL Database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE mymedina;
```

Or via command line (PowerShell):

```bash
psql -U postgres
```

Then in psql:

```sql
CREATE DATABASE mymedina;
\q
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and update database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mymedina
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 4. Run the Application

```bash
npm run start:dev
```

You should see:

```
🚀 MyMedina Backend is running on: http://localhost:5000/api
📊 Database: mymedina@localhost:5432
```

### 5. Test the API

Open browser or Postman:

```
GET http://localhost:5000/api
```

You should see:

```json
"Hello World!"
```

---

## 📁 Project Structure

```
src/
├── common/
│   ├── entities/
│   │   └── base.entity.ts          # Base entity (inheritance)
│   └── enums/
│       ├── role.enum.ts             # User roles
│       ├── product-status.enum.ts   # Product statuses
│       ├── order-status.enum.ts     # Order statuses
│       ├── order-type.enum.ts       # Order types
│       ├── payment-status.enum.ts   # Payment statuses
│       ├── payment-method.enum.ts   # Payment methods
│       └── shipment-status.enum.ts  # Shipment statuses
│
├── config/
│   ├── database.config.ts           # TypeORM config
│   └── jwt.config.ts                # JWT config
│
├── modules/
│   └── (will be created next)
│
├── app.module.ts                    # Root module
├── app.controller.ts                # Default controller
├── app.service.ts                   # Default service
└── main.ts                          # Entry point
```

---

## 🎯 Next Steps

After setup is complete, we will create:

1. **Auth Module** - Register, Login, Email Verification, Password Reset
2. **Products Module** - Categories, Products, Variants
3. **Orders Module** - Checkout, Order Management
4. **Payments Module** - Midtrans Integration
5. **Shipments Module** - Tracking
6. **Admin Module** - Dashboard, Reports

---

## 🐛 Troubleshooting

### Database Connection Error

If you see:

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Make sure PostgreSQL is running
2. Check database credentials in `.env`
3. Make sure database `mymedina` exists

### Port Already in Use

If you see:

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
1. Change `PORT` in `.env` to another port (e.g., 5001)
2. Or kill the process using port 5000

---

## 📚 OOP Concepts Demonstrated

### 1. **Abstraction**
- `BaseEntity` is an abstract class

### 2. **Inheritance**
- All entities will extend `BaseEntity`

### 3. **Encapsulation**
- Configuration hidden in config files
- Private methods in classes

### 4. **Dependency Injection**
- NestJS DI container
- Services injected via constructor

### 5. **Module Pattern**
- Code organized into modules
- Each module has specific responsibility

---

## ✅ Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `mymedina` created
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Application runs successfully (`npm run start:dev`)
- [ ] API responds at `http://localhost:5000/api`

---

**Next:** Create Auth Module with User entity, DTOs, and authentication logic! 🚀

