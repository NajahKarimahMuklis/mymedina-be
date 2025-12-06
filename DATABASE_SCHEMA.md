# 🗄️ MyMedina Backend - DATABASE SCHEMA DOCUMENTATION

**Project:** MyMedina Backend - E-Commerce API  
**Database:** PostgreSQL 14+  
**ORM:** TypeORM  
**Total Tables:** 9 tables  
**Last Updated:** December 2025

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables](#tables)
4. [Enums](#enums)
5. [Indexes](#indexes)
6. [Relationships](#relationships)
7. [Data Integrity](#data-integrity)

---

## 1. OVERVIEW

Database MyMedina menggunakan PostgreSQL dengan TypeORM sebagai ORM. Database ini dirancang untuk mendukung e-commerce dengan fitur:

- ✅ User authentication & authorization
- ✅ Product catalog dengan categories dan variants
- ✅ Order management dengan status tracking
- ✅ Payment integration (Midtrans)
- ✅ Shipment tracking
- ✅ Soft delete untuk data preservation
- ✅ Snapshot pattern untuk historical data

### **Database Statistics:**

| Metric | Count |
|--------|-------|
| **Total Tables** | 9 tables |
| **Total Enums** | 7 enums |
| **Total Relationships** | 12 relationships |
| **Seed Data** | 45+ records |

---

## 2. ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────┐         ┌──────────────┐
│   orders    │────1────│  shipments   │
└──────┬──────┘         └──────────────┘
       │ 1
       │
       │ N                ┌──────────────┐
┌──────▼──────┐    N     │   products   │
│ order_items │◄─────────┤              │
└─────────────┘          └──────┬───────┘
       │                        │ 1
       │ N                      │
       │                        │ N
       │                 ┌──────▼────────────┐
       │                 │ product_variants  │
       └─────────────────┤                   │
                         └───────────────────┘

┌──────────────┐         ┌──────────────┐
│  categories  │────1────│   products   │
│              │    N    │              │
└──────┬───────┘         └──────────────┘
       │
       │ (self-referencing)
       │
       └──────┐
              │
       ┌──────▼───────┐
       │  categories  │
       │  (parent)    │
       └──────────────┘

┌──────────────┐         ┌──────────────┐
│   orders     │────1────│   payments   │
│              │    N    │              │
└──────────────┘         └──────────────┘
```

---

## 3. TABLES

### **3.1 users**

**Description:** User accounts (customers, admins, owners)

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
    
    -- Email Verification (Built-in)
    verification_token VARCHAR(6),
    verification_token_expires TIMESTAMP,
    
    -- Password Reset (Built-in)
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| email | VARCHAR(255) | NO | - | Unique email address |
| password_hash | VARCHAR(255) | NO | - | bcrypt hashed password (cost 12) |
| name | VARCHAR(255) | NO | - | User full name |
| phone | VARCHAR(20) | YES | NULL | Phone number |
| role | role_enum | NO | CUSTOMER | User role |
| email_verified | BOOLEAN | NO | false | Email verification status |
| active | BOOLEAN | NO | true | Account active status |
| profile_picture | VARCHAR(500) | YES | NULL | Profile picture URL |
| verification_token | VARCHAR(6) | YES | NULL | 6-digit email verification token |
| verification_token_expires | TIMESTAMP | YES | NULL | Token expiration (24 hours) |
| reset_token | VARCHAR(255) | YES | NULL | Password reset token (hashed) |
| reset_token_expires | TIMESTAMP | YES | NULL | Reset token expiration (1 hour) |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |
| deleted_at | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_users_email (email)`
- `INDEX idx_users_role (role)`

**Relationships:**
- One-to-Many: `users` → `orders`

---

### **3.2 categories**

**Description:** Product categories (supports nested categories)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| name | VARCHAR(100) | NO | - | Category name |
| slug | VARCHAR(100) | NO | - | SEO-friendly URL slug (unique) |
| description | TEXT | YES | NULL | Category description |
| parent_id | UUID | YES | NULL | Parent category ID (for nested categories) |
| active | BOOLEAN | NO | true | Active status |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_categories_slug (slug)`
- `INDEX idx_categories_parent_id (parent_id)`

**Relationships:**
- Self-referencing: `categories.parent_id` → `categories.id`
- One-to-Many: `categories` → `products`

---

### **3.3 products**

**Description:** Products in the catalog

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    weight DECIMAL(8,2) NOT NULL,
    status product_status_enum DEFAULT 'READY',
    active BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| category_id | UUID | NO | - | Foreign key to categories |
| name | VARCHAR(255) | NO | - | Product name |
| slug | VARCHAR(255) | NO | - | SEO-friendly URL slug (unique) |
| description | TEXT | NO | - | Product description |
| base_price | DECIMAL(12,2) | NO | - | Base price (can be overridden by variant) |
| weight | DECIMAL(8,2) | NO | - | Weight in grams |
| status | product_status_enum | NO | READY | Product status (READY/PO/DISCONTINUED) |
| active | BOOLEAN | NO | true | Active status |
| image_url | VARCHAR(500) | YES | NULL | Product image URL (Cloudinary) |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |
| deleted_at | TIMESTAMP | YES | NULL | Soft delete timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_products_slug (slug)`
- `INDEX idx_products_category_id (category_id)`
- `INDEX idx_products_status (status)`

**Relationships:**
- Many-to-One: `products` → `categories`
- One-to-Many: `products` → `product_variants`

---

### **3.4 product_variants**

**Description:** Product variants (size, color, stock, SKU)

```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    stock INT DEFAULT 0,
    price_override DECIMAL(12,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| product_id | UUID | NO | - | Foreign key to products (CASCADE delete) |
| sku | VARCHAR(100) | NO | - | Stock Keeping Unit (unique) |
| size | VARCHAR(50) | NO | - | Variant size (S, M, L, XL, etc.) |
| color | VARCHAR(50) | NO | - | Variant color |
| stock | INT | NO | 0 | Available stock quantity |
| price_override | DECIMAL(12,2) | YES | NULL | Override product base_price (optional) |
| active | BOOLEAN | NO | true | Active status |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_product_variants_sku (sku)`
- `INDEX idx_product_variants_product_id (product_id)`

**Relationships:**
- Many-to-One: `product_variants` → `products` (CASCADE delete)
- One-to-Many: `product_variants` → `order_items`

---

### **3.5 orders**

**Description:** Customer orders with address snapshot

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type order_type_enum NOT NULL,
    status order_status_enum DEFAULT 'PENDING_PAYMENT',

    -- Address Snapshot (Denormalized)
    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,

    -- Pricing
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,

    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| order_number | VARCHAR(50) | NO | - | Unique order number (ORD-YYYYMMDD-XXXXX) |
| user_id | UUID | NO | - | Foreign key to users |
| type | order_type_enum | NO | - | Order type (READY/PO) |
| status | order_status_enum | NO | PENDING_PAYMENT | Order status |
| receiver_name | VARCHAR(255) | NO | - | Receiver name (snapshot) |
| receiver_phone | VARCHAR(20) | NO | - | Receiver phone (snapshot) |
| address_line1 | TEXT | NO | - | Address line 1 (snapshot) |
| address_line2 | TEXT | YES | NULL | Address line 2 (snapshot) |
| city | VARCHAR(100) | NO | - | City (snapshot) |
| province | VARCHAR(100) | NO | - | Province (snapshot) |
| postal_code | VARCHAR(10) | NO | - | Postal code (snapshot) |
| subtotal | DECIMAL(12,2) | NO | - | Subtotal (sum of order items) |
| shipping_cost | DECIMAL(12,2) | NO | - | Shipping cost |
| total | DECIMAL(12,2) | NO | - | Total (subtotal + shipping_cost) |
| notes | TEXT | YES | NULL | Order notes |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_orders_order_number (order_number)`
- `INDEX idx_orders_user_id (user_id)`
- `INDEX idx_orders_status (status)`

**Relationships:**
- Many-to-One: `orders` → `users`
- One-to-Many: `orders` → `order_items`
- One-to-Many: `orders` → `payments`
- One-to-One: `orders` → `shipments`

---

### **3.6 order_items**

**Description:** Order items with product/variant snapshot

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,

    -- Product Snapshot (Denormalized)
    product_name VARCHAR(255) NOT NULL,
    variant_sku VARCHAR(100),
    variant_size VARCHAR(50),
    variant_color VARCHAR(50),

    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| order_id | UUID | NO | - | Foreign key to orders (CASCADE delete) |
| product_id | UUID | NO | - | Foreign key to products |
| product_variant_id | UUID | YES | NULL | Foreign key to product_variants |
| product_name | VARCHAR(255) | NO | - | Product name (snapshot) |
| variant_sku | VARCHAR(100) | YES | NULL | Variant SKU (snapshot) |
| variant_size | VARCHAR(50) | YES | NULL | Variant size (snapshot) |
| variant_color | VARCHAR(50) | YES | NULL | Variant color (snapshot) |
| quantity | INT | NO | - | Quantity ordered |
| price | DECIMAL(12,2) | NO | - | Price per unit (snapshot) |
| subtotal | DECIMAL(12,2) | NO | - | Subtotal (price × quantity) |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX idx_order_items_order_id (order_id)`
- `INDEX idx_order_items_product_id (product_id)`

**Relationships:**
- Many-to-One: `order_items` → `orders` (CASCADE delete)
- Many-to-One: `order_items` → `products`
- Many-to-One: `order_items` → `product_variants`

---

### **3.7 payments**

**Description:** Payment transactions (Midtrans integration)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,

    method payment_method_enum NOT NULL,
    status payment_status_enum DEFAULT 'PENDING',
    amount DECIMAL(12,2) NOT NULL,

    -- Midtrans Integration
    payment_url TEXT,
    expires_at TIMESTAMP,

    -- Midtrans Response
    midtrans_transaction_id VARCHAR(255),
    midtrans_order_id VARCHAR(255),
    midtrans_gross_amount DECIMAL(12,2),
    midtrans_payment_type VARCHAR(50),
    midtrans_transaction_time TIMESTAMP,
    midtrans_transaction_status VARCHAR(50),
    midtrans_fraud_status VARCHAR(50),

    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| order_id | UUID | NO | - | Foreign key to orders |
| transaction_id | VARCHAR(100) | NO | - | Unique transaction ID (TRX-YYYYMMDD-XXXXX) |
| method | payment_method_enum | NO | - | Payment method |
| status | payment_status_enum | NO | PENDING | Payment status |
| amount | DECIMAL(12,2) | NO | - | Payment amount |
| payment_url | TEXT | YES | NULL | Midtrans payment URL |
| expires_at | TIMESTAMP | YES | NULL | Payment URL expiration (24 hours) |
| midtrans_transaction_id | VARCHAR(255) | YES | NULL | Midtrans transaction ID |
| midtrans_order_id | VARCHAR(255) | YES | NULL | Midtrans order ID |
| midtrans_gross_amount | DECIMAL(12,2) | YES | NULL | Midtrans gross amount |
| midtrans_payment_type | VARCHAR(50) | YES | NULL | Midtrans payment type |
| midtrans_transaction_time | TIMESTAMP | YES | NULL | Midtrans transaction time |
| midtrans_transaction_status | VARCHAR(50) | YES | NULL | Midtrans transaction status |
| midtrans_fraud_status | VARCHAR(50) | YES | NULL | Midtrans fraud status |
| paid_at | TIMESTAMP | YES | NULL | Payment completion timestamp |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_payments_transaction_id (transaction_id)`
- `INDEX idx_payments_order_id (order_id)`
- `INDEX idx_payments_status (status)`

**Relationships:**
- Many-to-One: `payments` → `orders`

---

### **3.8 shipments**

**Description:** Shipment tracking

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

    courier VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    status shipment_status_enum DEFAULT 'PENDING',

    estimated_delivery DATE,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,

    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | UUID | NO | uuid_generate_v4() | Primary key |
| order_id | UUID | NO | - | Foreign key to orders (unique, one-to-one) |
| courier | VARCHAR(100) | NO | - | Courier name (JNE, J&T, SiCepat, etc.) |
| tracking_number | VARCHAR(100) | NO | - | Unique tracking number |
| status | shipment_status_enum | NO | PENDING | Shipment status |
| estimated_delivery | DATE | YES | NULL | Estimated delivery date |
| shipped_at | TIMESTAMP | YES | NULL | Shipment timestamp |
| delivered_at | TIMESTAMP | YES | NULL | Delivery timestamp |
| notes | TEXT | YES | NULL | Shipment notes |
| created_at | TIMESTAMP | NO | NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE INDEX idx_shipments_order_id (order_id)`
- `UNIQUE INDEX idx_shipments_tracking_number (tracking_number)`
- `INDEX idx_shipments_status (status)`

**Relationships:**
- One-to-One: `shipments` → `orders`

---

## 4. ENUMS

### **4.1 role_enum**

```sql
CREATE TYPE role_enum AS ENUM ('CUSTOMER', 'ADMIN', 'OWNER');
```

**Values:**
- `CUSTOMER` - Regular customer
- `ADMIN` - Admin user (can manage products, orders)
- `OWNER` - Owner (full access)

---

### **4.2 product_status_enum**

```sql
CREATE TYPE product_status_enum AS ENUM ('READY', 'PO', 'DISCONTINUED');
```

**Values:**
- `READY` - Ready stock (available immediately)
- `PO` - Pre-order (requires production time)
- `DISCONTINUED` - No longer available

---

### **4.3 order_type_enum**

```sql
CREATE TYPE order_type_enum AS ENUM ('READY', 'PO');
```

**Values:**
- `READY` - Ready stock order
- `PO` - Pre-order

---

### **4.4 order_status_enum**

```sql
CREATE TYPE order_status_enum AS ENUM (
    'PENDING_PAYMENT',
    'PAID',
    'IN_PRODUCTION',
    'READY_TO_SHIP',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'FAILED',
    'EXPIRED'
);
```

**Values:**
- `PENDING_PAYMENT` - Waiting for payment
- `PAID` - Payment successful
- `IN_PRODUCTION` - Being produced (for PO orders)
- `READY_TO_SHIP` - Ready to be shipped
- `SHIPPED` - Shipped to customer
- `DELIVERED` - Delivered to customer
- `COMPLETED` - Order completed
- `CANCELLED` - Order cancelled
- `REFUNDED` - Payment refunded
- `FAILED` - Order failed
- `EXPIRED` - Payment expired

---

### **4.5 payment_method_enum**

```sql
CREATE TYPE payment_method_enum AS ENUM (
    'BANK_TRANSFER',
    'QRIS',
    'E_WALLET',
    'CREDIT_CARD',
    'COD'
);
```

**Values:**
- `BANK_TRANSFER` - Bank Transfer (BCA, BNI, Mandiri, Permata)
- `QRIS` - QRIS (Quick Response Code Indonesian Standard)
- `E_WALLET` - E-Wallet (GoPay, ShopeePay, OVO, DANA)
- `CREDIT_CARD` - Credit/Debit Card
- `COD` - Cash on Delivery

---

### **4.6 payment_status_enum**

```sql
CREATE TYPE payment_status_enum AS ENUM (
    'PENDING',
    'SETTLEMENT',
    'DENY',
    'CANCEL',
    'EXPIRE',
    'REFUND'
);
```

**Values:**
- `PENDING` - Waiting for payment
- `SETTLEMENT` - Payment successful
- `DENY` - Payment denied
- `CANCEL` - Payment cancelled
- `EXPIRE` - Payment expired
- `REFUND` - Payment refunded

---

### **4.7 shipment_status_enum**

```sql
CREATE TYPE shipment_status_enum AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'IN_TRANSIT',
    'DELIVERED',
    'RETURNED'
);
```

**Values:**
- `PENDING` - Waiting to be shipped
- `PROCESSING` - Being prepared
- `SHIPPED` - Shipped
- `IN_TRANSIT` - In transit
- `DELIVERED` - Delivered
- `RETURNED` - Returned

---

## 5. INDEXES

### **Primary Keys:**
- All tables use UUID as primary key
- Generated using `uuid_generate_v4()`

### **Unique Indexes:**
- `users.email` - Prevent duplicate emails
- `categories.slug` - SEO-friendly URLs
- `products.slug` - SEO-friendly URLs
- `product_variants.sku` - Unique SKU
- `orders.order_number` - Unique order number
- `payments.transaction_id` - Unique transaction ID
- `shipments.order_id` - One-to-one relationship
- `shipments.tracking_number` - Unique tracking number

### **Foreign Key Indexes:**
- `products.category_id` - Fast category lookups
- `product_variants.product_id` - Fast product lookups
- `orders.user_id` - Fast user order lookups
- `order_items.order_id` - Fast order item lookups
- `payments.order_id` - Fast payment lookups

### **Status Indexes:**
- `products.status` - Filter by product status
- `orders.status` - Filter by order status
- `payments.status` - Filter by payment status
- `shipments.status` - Filter by shipment status

---

## 6. RELATIONSHIPS

### **One-to-Many:**
1. `users` → `orders` (one user has many orders)
2. `categories` → `products` (one category has many products)
3. `products` → `product_variants` (one product has many variants)
4. `orders` → `order_items` (one order has many items)
5. `orders` → `payments` (one order can have multiple payment attempts)

### **Many-to-One:**
1. `orders` → `users`
2. `products` → `categories`
3. `product_variants` → `products`
4. `order_items` → `orders`
5. `order_items` → `products`
6. `order_items` → `product_variants`
7. `payments` → `orders`

### **One-to-One:**
1. `shipments` → `orders` (one order has one shipment)

### **Self-Referencing:**
1. `categories` → `categories` (parent-child relationship)

---

## 7. DATA INTEGRITY

### **7.1 Cascade Delete:**

**CASCADE:**
- `product_variants` → Deleted when `products` deleted
- `order_items` → Deleted when `orders` deleted

**RESTRICT:**
- `products` → Cannot delete if has orders
- `categories` → Cannot delete if has products
- `users` → Cannot delete if has orders
- `orders` → Cannot delete if has payments/shipments

### **7.2 Soft Delete:**

**Tables with Soft Delete:**
- `users` - Preserves user data for historical orders
- `products` - Preserves product data for historical orders

**Implementation:**
- Uses `deleted_at` timestamp column
- NULL = active, NOT NULL = deleted
- Queries automatically exclude soft-deleted records

### **7.3 Snapshot Pattern:**

**Address Snapshot (in orders table):**
- Preserves delivery address even if user changes/deletes saved addresses
- Fields: receiver_name, receiver_phone, address_line1, address_line2, city, province, postal_code

**Product Snapshot (in order_items table):**
- Preserves product/variant details even if product modified/deleted
- Fields: product_name, variant_sku, variant_size, variant_color, price

**Benefits:**
- ✅ Historical data integrity
- ✅ Accurate order history
- ✅ Audit trail
- ✅ No broken references

### **7.4 Constraints:**

**CHECK Constraints:**
- `order_items.quantity > 0` - Quantity must be positive

**NOT NULL Constraints:**
- All primary keys
- All foreign keys (except optional relations)
- Critical business fields (email, password, name, price, etc.)

**UNIQUE Constraints:**
- Email addresses
- Slugs (categories, products)
- SKUs (product variants)
- Order numbers
- Transaction IDs
- Tracking numbers

---

## 📊 SUMMARY

**MyMedina Database** dirancang dengan prinsip:

- ✅ **Data Integrity** - Foreign keys, constraints, validations
- ✅ **Performance** - Proper indexing on frequently queried columns
- ✅ **Scalability** - UUID primary keys, efficient relationships
- ✅ **Historical Accuracy** - Snapshot pattern, soft delete
- ✅ **Security** - Password hashing, token expiration
- ✅ **Maintainability** - Clear naming, proper normalization
- ✅ **Flexibility** - Enums for extensibility, nullable fields where appropriate

**Total Database Objects:**
- 9 Tables
- 7 Enums
- 12 Relationships
- 20+ Indexes
- 45+ Seed Records

---

**Documentation Version:** 1.0
**Last Updated:** December 2025
**Author:** MyMedina Development Team
**Status:** ✅ PRODUCTION READY

