import { DataSourceOptions } from 'typeorm';

export const databaseConfig = (): DataSourceOptions => {
  // ✅ Support DATABASE_URL (Railway format)
  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
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
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    migrations: [],
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development' ? true : ['error', 'warn'],
  };
};
