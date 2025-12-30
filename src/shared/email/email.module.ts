import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';

/**
 * Email Module
 *
 * Module untuk mengelola email service dengan Brevo API v3.
 *
 * OOP Concepts:
 * - Modularity: Email functionality dipisahkan dalam module tersendiri
 * - Dependency Injection: ConfigService dan HttpService diinject
 * - Encapsulation: Email logic dikapsulasi dalam module ini
 */
@Module({
  imports: [ConfigModule, HttpModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
