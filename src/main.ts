import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import './config/data.source';

/**
 * Application Bootstrap
 * Entry point of the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe (auto-validate DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // CORS (allow frontend to access API)
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches Railway pattern
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global prefix for all routes EXCEPT health check
  app.setGlobalPrefix('api', {
    exclude: ['/'], // Allow root path for health checks
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 MyMedina Backend is running on: http://0.0.0.0:${port}/api`);
  console.log(
    `📊 Database: ${process.env.DB_NAME || 'railway'}@${process.env.DB_HOST || 'postgres.railway.internal'}`,
  );
}

void bootstrap();
