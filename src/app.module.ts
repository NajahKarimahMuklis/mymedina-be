import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';

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
      isGlobal: true, // Make config available globally
      envFilePath: '.env',
    }),

    // TypeORM Module (Database connection)
    TypeOrmModule.forRoot(databaseConfig()),

    // Rate Limiting Module
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000, // Convert to milliseconds
        limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
      },
    ]),

    // Feature modules
    AuthModule,
    // ProductsModule,
    // OrdersModule,
    // etc.
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
