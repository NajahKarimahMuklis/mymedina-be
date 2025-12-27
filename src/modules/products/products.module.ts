import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';

/**
 * Products Module
 *
 * Module untuk mengelola produk.
 *
 * OOP Concepts:
 * - Modularity: Product functionality organized in one module
 * - Separation of Concerns: Product logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 *
 * Components:
 * - Entity: Product
 * - Service: ProductsService (business logic)
 * - Controller: ProductsController (HTTP handlers)
 *
 * Dependencies:
 * - TypeOrmModule: Database access for Product and Category
 *
 * Exports:
 * - ProductsService: Can be used by other modules
 * - TypeOrmModule: Allows other modules to inject Product repository
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [
    ProductsService,
    TypeOrmModule, // ← CRITICAL: Export TypeOrmModule supaya ProductVariantsService bisa inject Product repository
  ],
})
export class ProductsModule {}