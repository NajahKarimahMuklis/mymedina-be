import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { ProductsModule } from './modules/products/products.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { UploadModule } from './shared/upload/upload.module';

/**
 * Root Application Module
 *
 * OOP Concepts:
 * - Module Pattern: Organizing related code
 * - Dependency Injection: NestJS DI container
 * - Separation of Concerns: Each module has specific responsibility
 */
@Module({
  imports: [
    // Configuration Module (loads .env file)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM Module (Database connection)
    TypeOrmModule.forRoot({
      ...databaseConfig(),
      synchronize: false,    // Disabled: migrations handle schema changes
      logging: ['error', 'warn'],         // Only log errors and warnings
    }),

    // Rate Limiting Module
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
      },
    ]),

    // Feature modules
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    OrdersModule,
    PaymentsModule,
    ShipmentsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}