import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS setup FIRST with dynamic origin check and debug logging
  // Update allowedOrigins to match frontend and Codespaces proxy
  const allowedOrigins = [
    'https://humble-space-giggle-wr4pvvp69rrj2w4v.app.github.dev',
    'https://humble-space-giggle-wr4pvvp69rrj2w4v-5000.app.github.dev',
    'https://humble-space-giggle-wr4pvvp69rrj2w4v-5173.app.github.dev',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://ufcjnhamtlmpcjzhizsn.supabase.co',
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'X-Requested-With',
    ],
    exposedHeaders: ['Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  app.use(cookieParser());
  // Set global API prefix so all routes are under /api
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security Middleware
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));


 

  // Force JwtStrategy to initialize before app.listen
  const { JwtStrategy } = await import('./modules/auth/strategies/jwt.strategy');
  app.select(AppModule).get(JwtStrategy);

  await app.listen(configService.get('PORT', 5000));
  logger.log(`🚀 Server running on ${await app.getUrl()}`);
  logger.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch(err => {
  new Logger('Bootstrap').error('Startup failed', err);
  process.exit(1);
});