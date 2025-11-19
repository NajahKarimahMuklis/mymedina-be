import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT Configuration
 *
 * OOP Concepts:
 * - Encapsulation: JWT config in one place
 */
export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'mymedina_secret_key',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as any,
});

