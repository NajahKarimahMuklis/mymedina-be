import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT Configuration
 *
 * OOP Concepts:
 * - Encapsulation: JWT config in one place
 */
export const jwtConfig = (): JwtModuleOptions => {
  const secret = process.env.JWT_SECRET || 'mymedina_secret_key';
  console.log('🔑 JWT Config Secret:', secret);

  return {
    secret,
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as any,
  };
};

