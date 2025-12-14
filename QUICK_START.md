# MyMedina API - Quick Start Guide

## Prerequisites

- Node.js v18+ installed
- PostgreSQL database running
- Git installed
- Postman (optional, for API testing)

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd MyMedina
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mymedina
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@mymedina.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Biteship Configuration (for shipping)
BITESHIP_API_KEY=your_biteship_api_key

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 4. Setup Database

Create PostgreSQL database:
```bash
createdb mymedina
```

Run database migrations:
```bash
npm run typeorm migration:run
```

Seed initial data:
```bash
npm run seed
```

### 5. Start Server

**Development Mode** (with hot reload):
```bash
npm run start:dev
```

**Production Mode**:
```bash
npm run build
npm run start:prod
```

The server will start at: `http://localhost:5000/api`

## Testing the API

### Option 1: Using Postman

1. Import `MyMedina-API-Postman.json` into Postman
2. Set the `baseUrl` variable to `http://localhost:5000/api`
3. Set the `token` variable after login
4. Start making requests

### Option 2: Using cURL

#### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/daftar \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "nama": "John Doe",
    "nomorTelepon": "08123456789"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from response. Then use it in subsequent requests:

#### 3. Get Products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&status=READY" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Using REST Client Extension (VS Code)

1. Install REST Client extension
2. Create a `.rest` file with your requests
3. Click "Send Request" to test

Example (`test.rest`):
```rest
@baseUrl = http://localhost:5000/api
@token = your_jwt_token_here

### Get Products
GET {{baseUrl}}/products?page=1&limit=10
Authorization: Bearer {{token}}

### Get Single Product
GET {{baseUrl}}/products/product-id-here
Authorization: Bearer {{token}}
```

## Development Workflow

### Available npm Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start              # Start server

# Building
npm run build              # Build TypeScript to JavaScript

# Database
npm run typeorm migration:generate  # Generate migration
npm run typeorm migration:run       # Run migrations
npm run typeorm migration:revert    # Revert migrations
npm run seed                        # Seed data

# Linting
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues

# Testing
npm run test               # Run unit tests
npm test:e2e              # Run e2e tests

# Production
npm run start:prod         # Start production server
```

### Project Structure

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── products/        # Product management
│   ├── categories/      # Category management
│   ├── orders/          # Order management
│   ├── shipments/       # Shipment & Biteship integration
│   ├── payments/        # Payment processing
│   └── product-variants/
├── common/              # Shared utilities
│   ├── entities/        # Base entities
│   ├── enums/           # Enums
│   └── decorators/      # Custom decorators
├── config/              # Configuration files
├── database/            # Database setup & seeds
├── shared/              # Shared modules
│   ├── email/           # Email service
│   └── upload/          # File upload service
├── app.module.ts        # Root module
├── app.controller.ts    # Root controller
└── main.ts              # Entry point
```

## Common Tasks

### Add a New Product

1. **Use Admin account** to create product via API:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "namaProduct": "My Product",
    "deskripsi": "Product description",
    "hargaBase": 100000,
    "categoryId": "category-uuid",
    "image": "https://cloudinary-url.com/image.jpg",
    "status": "READY",
    "active": true
  }'
```

### Create an Order as Customer

1. **Login as customer** to get token
2. **Create order**:

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "address-uuid",
    "items": [
      {
        "productId": "product-uuid",
        "variantId": "variant-uuid",
        "quantity": 2
      }
    ]
  }'
```

### Check Shipping Rates

```bash
curl -X POST http://localhost:5000/api/shipments/check-rates \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin_area_id": "area_12345",
    "destination_area_id": "area_67890",
    "couriers": "jne,jnt",
    "items": [
      {
        "name": "Product Name",
        "description": "Description",
        "value": 100000,
        "length": 30,
        "width": 20,
        "height": 10,
        "weight": 500,
        "quantity": 1
      }
    ]
  }'
```

## Troubleshooting

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Ensure PostgreSQL is running
2. Check credentials in `.env` file
3. Verify database exists:
   ```bash
   psql -U postgres -l | grep mymedina
   ```

### JWT Token Invalid

**Error:** `401 Unauthorized`

**Solution:**
1. Re-login to get a fresh token
2. Check token expiration (default 7 days)
3. Verify `JWT_SECRET` matches in `.env`

### File Upload Fails

**Error:** `401 Unauthorized - Cloudinary`

**Solution:**
1. Verify Cloudinary credentials in `.env`
2. Check API key and secret are correct
3. Ensure cloud name matches your Cloudinary account

### Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```bash
# Kill process on port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

## Testing Endpoints Checklist

- [ ] Register new user
- [ ] Login user
- [ ] Verify email
- [ ] Get all products
- [ ] Get single product
- [ ] Create order
- [ ] Get my orders
- [ ] Check shipping rates
- [ ] Create shipment
- [ ] Track shipment
- [ ] Upload file

## Performance Tips

1. **Enable pagination** - Use `page` and `limit` parameters
2. **Filter results** - Use `search`, `categoryId`, `status` filters
3. **Cache products** - Frequently accessed products are cached
4. **Database indexing** - Indexes are created on commonly queried fields

## Security Considerations

1. **Environment Variables** - Never commit `.env` to version control
2. **Password Storage** - Passwords are hashed with bcrypt
3. **JWT Secret** - Keep JWT_SECRET secure and long (32+ chars)
4. **CORS** - Configure CORS for your frontend URL only
5. **Rate Limiting** - API has rate limiting enabled (10 req/60s default)
6. **SQL Injection** - Using TypeORM prevents SQL injection

## Getting Help

- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint documentation
- Review code comments in modules
- Check error messages in server logs
- Create issues in the repository

## Next Steps

1. ✅ Setup environment variables
2. ✅ Create database and run migrations
3. ✅ Start development server
4. ✅ Test endpoints using Postman or cURL
5. ✅ Integrate with frontend

---

**Happy coding! 🚀**
