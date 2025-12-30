import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

/**
 * Email Module
 *
 * Module untuk mengelola email service dengan Resend.
 *
 * OOP Concepts:
 * - Modularity: Email functionality dipisahkan dalam module tersendiri
 * - Dependency Injection: ConfigService diinject untuk konfigurasi
 * - Encapsulation: Email logic dikapsulasi dalam module ini
 */
@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
