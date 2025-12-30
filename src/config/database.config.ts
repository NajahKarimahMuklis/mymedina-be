import { DataSourceOptions } from 'typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { Address } from '../modules/auth/entities/address.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductVariant } from '../modules/product-variants/entities/product-variant.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { Shipment } from '../modules/shipments/entities/shipment.entity';

const entities = [
  User,
  Address,
  Category,
  Product,
  ProductVariant,
  Order,
  OrderItem,
  Payment,
  Shipment,
];

export const databaseConfig = (): DataSourceOptions => {
  // ✅ Support DATABASE_URL (Railway format)
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: entities,
      synchronize: true, // ⚠️ Temporary enabled for initial database setup
      migrations: [],
      migrationsRun: false,
      logging:
        process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // ✅ Fallback: Individual environment variables
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123321',
    database: process.env.DB_NAME || 'mymedina',
    entities: entities,
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: [],
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
  };
};
