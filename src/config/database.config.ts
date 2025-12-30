import { DataSourceOptions } from 'typeorm';
import { join } from 'path';

export const databaseConfig = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Entities path: production uses compiled .js in dist/, development uses .ts in src/
  const entitiesPath = isProduction
    ? [join(__dirname, '../**/*.entity.js')]
    : [join(__dirname, '../**/*.entity{.ts,.js}')];

  // ✅ Support DATABASE_URL (Railway format)
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: entitiesPath,
      synchronize: true, // ⚠️ Temporary enabled for initial database setup
      migrations: [],
      migrationsRun: false,
      logging:
        process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // ✅ Fallback: Individual environment variables
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123321',
    database: process.env.DB_NAME || 'mymedina',
    entities: entitiesPath,
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: [],
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
  };
};
