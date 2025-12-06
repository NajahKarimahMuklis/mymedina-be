import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';

/**
 * Shipments Module
 *
 * OOP Concepts:
 * - Encapsulation: Groups related shipment functionality
 * - Module Pattern: Organizes code into cohesive units
 *
 * Design Patterns:
 * - Module Pattern: NestJS module system
 * - Dependency Injection: Provides services and repositories
 */
@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Order])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService, TypeOrmModule],
})
export class ShipmentsModule {}

