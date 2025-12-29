import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const databaseConfig = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123321',
  database: process.env.DB_NAME || 'mymedina',

  // Entities
  entities: [join(process.cwd(), 'dist/**/*.entity.js')],

  // ✅ Development mode: auto-sync
  synchronize: process.env.NODE_ENV !== 'production',

  // ❌ Matikan migration
  migrations: [],
  migrationsRun: false,

  // Logging
  logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
});
