import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../../shared/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Auth Module
 *
 * OOP Concepts:
 * - Modularity: Authentication functionality in separate module
 * - Separation of Concerns: Auth logic separated from other modules
 * - Dependency Injection: All dependencies registered here
 *
 * Design Pattern:
 * - Module Pattern: Organizing related code
 *
 * Components:
 * - Entity: User
 * - Service: AuthService (business logic)
 * - Controller: AuthController (HTTP handlers)
 * - Strategy: JwtStrategy (JWT validation)
 * - Guards: JwtAuthGuard, RolesGuard (route protection)
 * - Decorators: @Roles() (metadata for authorization)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity
    PassportModule.register({ defaultStrategy: 'jwt' }), // Register Passport
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('JWT_SECRET') ||
          'mymedina_secret_key_for_development_only';
        console.log('🔑 JWT Module Secret (registerAsync):', secret);
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
          } as any,
        };
      },
      inject: [ConfigService],
    }),
    EmailModule, // Register Email module for sending emails
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}

