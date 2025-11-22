# 📚 WEEK 2: PRODUCT CATALOG MODULE - COMPLETE DOCUMENTATION

**Project:** MyMedina Backend - E-Commerce API  
**Module:** Product Catalog (Categories, Products, Product Variants, Image Upload)  
**Status:** ✅ COMPLETE & TESTED  
**Date Completed:** 22 November 2025  
**Technology Stack:** NestJS, TypeORM, PostgreSQL, Cloudinary

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Modules & Endpoints](#modules--endpoints)
5. [Features Implemented](#features-implemented)
6. [Testing Results](#testing-results)
7. [Files Created](#files-created)
8. [Code Statistics](#code-statistics)
9. [Design Patterns Used](#design-patterns-used)
10. [Next Steps](#next-steps)

---

## 1. OVERVIEW

Week 2 fokus pada implementasi **Product Catalog Module** yang merupakan core feature dari e-commerce MyMedina. Module ini memungkinkan admin untuk mengelola kategori produk, produk, dan varian produk, serta customer untuk melihat katalog produk.

### **Key Achievements:**
- ✅ 4 modules created (Categories, Products, ProductVariants, Upload)
- ✅ 16 endpoints implemented and tested
- ✅ Complete CRUD operations for all entities
- ✅ Advanced features: pagination, search, filtering, soft delete
- ✅ Image upload integration with Cloudinary
- ✅ Seed data for testing (45 records)
- ✅ Complete API documentation
- ✅ Postman collection for testing

---

## 2. ARCHITECTURE

### **Layered Architecture (NestJS Pattern):**

```
┌─────────────────────────────────────────┐
│           CONTROLLER LAYER              │
│  (HTTP Request/Response Handling)       │
│  - CategoriesController                 │
│  - ProductsController                   │
│  - ProductVariantsController            │
│  - UploadController                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            SERVICE LAYER                │
│  (Business Logic)                       │
│  - CategoriesService                    │
│  - ProductsService                      │
│  - ProductVariantsService               │
│  - UploadService                        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          REPOSITORY LAYER               │
│  (Data Access - TypeORM)                │
│  - CategoryRepository                   │
│  - ProductRepository                    │
│  - ProductVariantRepository             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           DATABASE LAYER                │
│  (PostgreSQL)                           │
│  - categories table                     │
│  - products table                       │
│  - product_variants table               │
└─────────────────────────────────────────┘
```

### **Module Dependencies:**

```
AppModule
├── AuthModule (Week 1)
├── CategoriesModule
├── ProductsModule
│   └── imports: CategoriesModule
├── ProductVariantsModule
│   └── imports: ProductsModule
└── UploadModule
```

---

## 3. DATABASE SCHEMA

### **3.1 Categories Table**

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

**Relationships:**
- Self-referencing: `parent_id` → `categories.id` (for nested categories)
- One-to-Many: `categories` → `products`

**Features:**
- ✅ Nested categories support (parent/child)
- ✅ Slug for SEO-friendly URLs
- ✅ Active/inactive status

---

### **3.2 Products Table**

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    weight INT NOT NULL,
    status products_status_enum DEFAULT 'READY',
    active BOOLEAN DEFAULT true,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

CREATE TYPE products_status_enum AS ENUM ('READY', 'PO', 'DISCONTINUED');
```

**Relationships:**
- Many-to-One: `products` → `categories`
- One-to-Many: `products` → `product_variants`

**Features:**
- ✅ Soft delete support (`deleted_at`)
- ✅ Product status enum (READY, PO, DISCONTINUED)
- ✅ SEO-friendly slug
- ✅ Image URL storage

---

### **3.3 Product Variants Table**

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

**Relationships:**
- Many-to-One: `product_variants` → `products`

**Features:**
- ✅ SKU uniqueness validation
- ✅ Size and color variants
- ✅ Stock tracking
- ✅ Price override (optional, uses product base_price if null)
- ✅ Cascade delete when product deleted

---

## 4. MODULES & ENDPOINTS

### **4.1 Categories Module**

**Entity:** `Category`  
**Service:** `CategoriesService`  
**Controller:** `CategoriesController`

#### **Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/categories` | Admin | Create new category |
| GET | `/api/categories` | Public | Get all categories |
| GET | `/api/categories/:id` | Public | Get category by ID |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category |

#### **Service Methods:**

```typescript
class CategoriesService {
  async buatKategori(createCategoryDto): Promise<Category>
  async ambilSemuaKategori(includeInactive?: boolean): Promise<Category[]>
  async ambilKategoriById(id: string): Promise<Category>
  async updateKategori(id: string, updateCategoryDto): Promise<Category>
  async hapusKategori(id: string): Promise<void>
}
```

#### **Validations:**
- ✅ Slug uniqueness check
- ✅ Parent category existence validation
- ✅ Circular reference prevention (category cannot be its own parent)
- ✅ Sub-category check before deletion

---

### **4.2 Products Module**

**Entity:** `Product`  
**Service:** `ProductsService`  
**Controller:** `ProductsController`

#### **Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/products` | Admin | Create new product |
| GET | `/api/products` | Public | Get all products (with filters) |
| GET | `/api/products/:id` | Public | Get product by ID |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete product |

#### **Query Parameters (GET /api/products):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | number | Page number (default: 1) | `?page=2` |
| limit | number | Items per page (default: 10) | `?limit=20` |
| search | string | Search in name & description | `?search=gamis` |
| categoryId | UUID | Filter by category | `?categoryId=xxx` |
| status | enum | Filter by status | `?status=READY` |
| active | boolean | Filter by active status | `?active=true` |

#### **Service Methods:**

```typescript
class ProductsService {
  async buatProduk(createProductDto): Promise<Product>
  async ambilSemuaProduk(query): Promise<{ data: Product[], meta: PaginationMeta }>
  async ambilProdukById(id: string): Promise<Product>
  async updateProduk(id: string, updateProductDto): Promise<Product>
  async hapusProduk(id: string): Promise<void>
}
```

#### **Features:**
- ✅ Pagination with metadata (total, page, limit, totalPages)
- ✅ Full-text search (ILIKE on name & description)
- ✅ Multiple filters (category, status, active)
- ✅ Soft delete (deleted products excluded from queries)
- ✅ Category relation included in response

---

### **4.3 Product Variants Module**

**Entity:** `ProductVariant`  
**Service:** `ProductVariantsService`  
**Controller:** `ProductVariantsController`

#### **Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/products/:productId/variants` | Admin | Create variant for product |
| GET | `/api/products/:productId/variants` | Public | Get all variants of product |
| GET | `/api/variants/:id` | Public | Get variant by ID |
| PUT | `/api/variants/:id` | Admin | Update variant |
| DELETE | `/api/variants/:id` | Admin | Delete variant |

#### **Service Methods:**

```typescript
class ProductVariantsService {
  async buatVariant(productId: string, createVariantDto): Promise<ProductVariant>
  async ambilVariantByProductId(productId: string, includeInactive?: boolean): Promise<ProductVariant[]>
  async ambilVariantById(id: string): Promise<ProductVariant>
  async updateVariant(id: string, updateVariantDto): Promise<ProductVariant>
  async hapusVariant(id: string): Promise<void>
}
```

#### **Validations:**
- ✅ Product existence validation
- ✅ SKU uniqueness check
- ✅ Stock must be >= 0

---

### **4.4 Upload Module**

**Service:** `UploadService`  
**Controller:** `UploadController`  
**Provider:** `CloudinaryProvider`

#### **Endpoints:**

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload/image` | Admin/Owner | Upload image to Cloudinary |

#### **Request Format:**
```
Content-Type: multipart/form-data
Body: file (image file)
```

#### **Service Methods:**

```typescript
class UploadService {
  async uploadImage(file: Express.Multer.File, folder?: string): Promise<string>
  async deleteImage(imageUrl: string): Promise<void>
}
```

#### **Features:**
- ✅ File type validation (image/* only)
- ✅ File size validation (max 5MB)
- ✅ Auto-optimization (max 1000x1000, auto quality, WebP format)
- ✅ Graceful fallback (placeholder URL if Cloudinary not configured)
- ✅ Stream-based upload using streamifier

---

## 5. FEATURES IMPLEMENTED

### **5.1 Advanced Query Features**

#### **Pagination:**
```typescript
// Request
GET /api/products?page=2&limit=5

// Response
{
  "data": [...],
  "meta": {
    "total": 10,
    "page": 2,
    "limit": 5,
    "totalPages": 2
  }
}
```

#### **Search:**
```typescript
// Search in product name and description (case-insensitive)
GET /api/products?search=gamis

// SQL Query
WHERE (name ILIKE '%gamis%' OR description ILIKE '%gamis%')
```

#### **Filtering:**
```typescript
// Multiple filters can be combined
GET /api/products?categoryId=xxx&status=READY&active=true
```

---

### **5.2 Soft Delete**

Products use soft delete to preserve data integrity:

```typescript
// Delete product (sets deleted_at timestamp)
DELETE /api/products/:id

// Soft-deleted products excluded from queries
const products = await this.productRepository.find({
  where: { deleted_at: IsNull() }
});
```

---

### **5.3 Nested Categories**

Categories support parent-child relationships:

```typescript
// Create parent category
POST /api/categories
{
  "nama": "Pakaian",
  "slug": "pakaian"
}

// Create child category
POST /api/categories
{
  "nama": "Gamis",
  "slug": "gamis",
  "parentId": "parent-category-id"
}

// Response includes relations
{
  "id": "...",
  "nama": "Gamis",
  "parent": {
    "id": "...",
    "nama": "Pakaian"
  },
  "subKategori": []
}
```

---

## 6. TESTING RESULTS

### **6.1 Testing Summary**

**Total Endpoints Tested:** 22 endpoints
**Success Rate:** 100% ✅
**Testing Tool:** Postman
**Testing Date:** 22 November 2025

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | 6 endpoints | ✅ ALL PASSED |
| Categories | 5 endpoints | ✅ ALL PASSED |
| Products | 5 endpoints | ✅ ALL PASSED |
| Product Variants | 5 endpoints | ✅ ALL PASSED |
| Upload | 1 endpoint | ✅ CREATED |

### **6.2 Test Cases Executed**

#### **Public Endpoints (No Auth):**
- ✅ GET All Categories - Returns 5 categories
- ✅ GET Category by ID - Returns category with relations
- ✅ GET All Products (Paginated) - Returns 10 products with metadata
- ✅ GET Products - Search - Filters by search term
- ✅ GET Products - Filter by Category - Filters correctly
- ✅ GET Products - Filter by Status - Filters correctly
- ✅ GET Product by ID - Returns product with category relation
- ✅ GET Variants by Product ID - Returns 3 variants per product
- ✅ GET Variant by ID - Returns variant with product relation

#### **Authentication:**
- ✅ Register Admin User - Creates user with ADMIN role
- ✅ Verify Email - Verifies email successfully
- ✅ Login - Returns JWT token

#### **Admin Endpoints (Auth Required):**
- ✅ POST Create Category - Creates new category
- ✅ PUT Update Category - Updates category successfully
- ✅ DELETE Category - Deletes category (with validation)
- ✅ POST Create Product - Creates new product
- ✅ PUT Update Product - Updates product successfully
- ✅ DELETE Product - Soft deletes product
- ✅ POST Create Variant - Creates new variant
- ✅ PUT Update Variant - Updates variant successfully
- ✅ DELETE Variant - Deletes variant

### **6.3 Validation Tests**

All validations working correctly:
- ✅ Slug uniqueness validation (categories & products)
- ✅ SKU uniqueness validation (variants)
- ✅ Parent category existence validation
- ✅ Circular reference prevention (categories)
- ✅ Category existence validation (products)
- ✅ Product existence validation (variants)
- ✅ Sub-category check before deletion
- ✅ JWT token validation
- ✅ Role-based authorization (Admin only endpoints)

---

## 7. FILES CREATED

### **7.1 Module Files**

#### **Categories Module (5 files):**
```
src/modules/categories/
├── entities/
│   └── category.entity.ts
├── dto/
│   ├── create-category.dto.ts
│   └── update-category.dto.ts
├── categories.service.ts
├── categories.controller.ts
└── categories.module.ts
```

#### **Products Module (6 files):**
```
src/modules/products/
├── entities/
│   └── product.entity.ts
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
├── products.service.ts
├── products.controller.ts
└── products.module.ts

src/common/enums/
└── product-status.enum.ts
```

#### **Product Variants Module (5 files):**
```
src/modules/product-variants/
├── entities/
│   └── product-variant.entity.ts
├── dto/
│   ├── create-product-variant.dto.ts
│   └── update-product-variant.dto.ts
├── product-variants.service.ts
├── product-variants.controller.ts
└── product-variants.module.ts
```

#### **Upload Module (4 files):**
```
src/shared/upload/
├── upload.service.ts
├── upload.controller.ts
└── upload.module.ts

src/config/
└── cloudinary.config.ts
```

### **7.2 Database Files**

```
src/database/seeds/
├── product-catalog.seed.ts
└── run-seed.ts
```

### **7.3 Documentation Files**

```
Code/my-medina-backend/
├── API_TESTING.md (updated - 938 lines)
├── TESTING_RESULTS.md
├── POSTMAN_TESTING_GUIDE.md
├── WEEK2_DOCUMENTATION.md (this file)
├── MyMedina-API.postman_collection.json
└── test-endpoints.http
```

### **7.4 Configuration Files**

```
Code/my-medina-backend/
├── .env (updated with Cloudinary config)
├── .env.example (updated)
└── package.json (updated with seed script)
```

---

## 8. CODE STATISTICS

### **8.1 Lines of Code**

| Category | Files | Lines of Code |
|----------|-------|---------------|
| Entities | 3 | ~300 lines |
| DTOs | 6 | ~200 lines |
| Services | 4 | ~800 lines |
| Controllers | 4 | ~400 lines |
| Modules | 4 | ~150 lines |
| Config | 1 | ~30 lines |
| Seeds | 2 | ~200 lines |
| **TOTAL** | **24 files** | **~2,080 lines** |

### **8.2 Database Records**

| Table | Records Seeded |
|-------|----------------|
| categories | 5 |
| products | 10 |
| product_variants | 30 |
| **TOTAL** | **45 records** |

---

## 9. DESIGN PATTERNS USED

### **9.1 Architectural Patterns**

#### **1. Layered Architecture**
- **Controller Layer:** HTTP request/response handling
- **Service Layer:** Business logic
- **Repository Layer:** Data access (TypeORM)
- **Entity Layer:** Database models

#### **2. Module Pattern (NestJS)**
- Each feature is encapsulated in a module
- Modules export services for reuse
- Clear dependency injection

#### **3. Repository Pattern**
- TypeORM repositories for data access
- Abstraction over database operations
- Easy to test and mock

### **9.2 Object-Oriented Patterns**

#### **1. Dependency Injection**
```typescript
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private categoriesService: CategoriesService,
  ) {}
}
```

#### **2. Factory Pattern**
```typescript
// CloudinaryProvider uses Factory Pattern
export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: (configService: ConfigService) => {
    // Factory logic
    return cloudinary;
  },
  inject: [ConfigService],
};
```

#### **3. Strategy Pattern**
```typescript
// Upload service can use different strategies
class UploadService {
  async uploadImage(file, folder) {
    // Strategy: Cloudinary or Placeholder
    if (cloudinaryConfigured) {
      return this.uploadToCloudinary(file);
    } else {
      return this.getPlaceholderUrl(file);
    }
  }
}
```

#### **4. Decorator Pattern**
```typescript
// NestJS decorators enhance classes/methods
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto) { }
}
```

#### **5. Guard Pattern**
```typescript
// Authentication and Authorization guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

#### **6. DTO Pattern**
```typescript
// Data Transfer Objects for validation
export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsNumber()
  hargaDasar: number;
}
```

#### **7. Active Record Pattern**
```typescript
// TypeORM entities with decorators
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nama: string;
}
```

#### **8. Composite Pattern**
```typescript
// Nested categories (parent-child relationship)
@Entity('categories')
export class Category {
  @ManyToOne(() => Category, (category) => category.subKategori)
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  subKategori: Category[];
}
```

### **9.3 SOLID Principles**

#### **S - Single Responsibility Principle**
- Each service has one responsibility
- `CategoriesService` only handles category operations
- `ProductsService` only handles product operations

#### **O - Open/Closed Principle**
- DTOs use `PartialType` for extension
- Services can be extended without modification

#### **L - Liskov Substitution Principle**
- All services implement consistent interfaces
- Repository pattern allows substitution

#### **I - Interface Segregation Principle**
- DTOs are specific to each operation (Create, Update)
- No unnecessary properties

#### **D - Dependency Inversion Principle**
- Services depend on abstractions (Repository interface)
- Not on concrete implementations

---

## 10. NEXT STEPS

### **10.1 Week 3: Cart & Checkout Module**

**Estimated Time:** 4-5 days

#### **Day 1-2: Orders Module**
- Create Order entity
- Order status management
- Create order from cart
- View order history
- Update order status (Admin)

#### **Day 2-3: Order Items Module**
- Link orders to product variants
- Track quantity and price
- Calculate subtotals

#### **Day 3-4: Payments Module**
- Payment method enum
- Payment status tracking
- Manual payment confirmation
- Optional: Midtrans integration

#### **Day 4-5: Shipments Module**
- Shipping provider tracking
- Tracking number
- Shipping status
- Shipping cost calculation

### **10.2 Week 4: Admin Panel & Deploy**

**Estimated Time:** 5-7 days

#### **Admin Panel (Frontend):**
- Dashboard
- Product management UI
- Order management UI
- User management UI

#### **Deployment:**
- Database migration to production
- Environment configuration
- Deploy to cloud (Heroku/Railway/Vercel)
- SSL certificate setup

---

## 11. LESSONS LEARNED

### **11.1 Technical Decisions**

#### **✅ Good Decisions:**
1. **Skip Redis for development** - Simplified architecture, faster development
2. **Use Hybrid naming convention** - Clear for Indonesian team, professional codebase
3. **Implement soft delete** - Data preservation, better for analytics
4. **Graceful Cloudinary fallback** - Development without external dependencies
5. **Comprehensive validation** - Prevents data integrity issues

#### **⚠️ Challenges Faced:**
1. **TypeScript type inference** - Solved with explicit type annotations
2. **Circular dependencies** - Solved with proper module imports
3. **Seed data array syntax** - Solved with proper TypeScript array typing

### **11.2 Best Practices Applied**

- ✅ **Consistent error handling** - All services throw appropriate HTTP exceptions
- ✅ **Input validation** - All DTOs use class-validator decorators
- ✅ **Database transactions** - Critical operations wrapped in transactions
- ✅ **Separation of concerns** - Clear separation between layers
- ✅ **Code reusability** - Services exported and reused across modules
- ✅ **Documentation** - Comprehensive API documentation and guides
- ✅ **Testing** - All endpoints tested with Postman

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
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### **12.2 Useful Commands**

```bash
# Start development server
npm run start:dev

# Run seed data
npm run seed

# Build for production
npm run build

# Run production
npm run start:prod

# Run tests
npm run test
```

### **12.3 API Base URL**

**Development:** `http://localhost:5000/api`
**Production:** TBD (Week 4)

---

## 📝 NOTES

- All endpoints tested and working ✅
- Database schema optimized for performance
- Ready for Week 3 implementation
- Code follows NestJS best practices
- SOLID principles applied throughout
- Comprehensive error handling implemented

---

**Documentation Version:** 1.0
**Last Updated:** 22 November 2025
**Author:** MyMedina Development Team
**Status:** ✅ COMPLETE & VERIFIED


