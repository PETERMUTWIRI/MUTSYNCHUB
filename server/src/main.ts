import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Dynamic CORS config for Codespaces and localhost
  const allowedExact = [
    'http://localhost:5173',
    'https://localhost:5173',
    'https://verbose-robot-97475jqg6j9v3xqwr.app.github.dev',
  ];
  const githubPattern = /^https:\/\/.*\.app\.github\.dev$/;
  const allowedOrigins = [...allowedExact, 'https://*.app.github.dev'];

  app.enableCors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests (like curl)
      if (allowedExact.includes(origin) || githubPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
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


 


  await app.listen(configService.get('PORT', 5000));
  logger.log(`🚀 Server running on ${await app.getUrl()}`);
  logger.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch(err => {
  new Logger('Bootstrap').error('Startup failed', err);
  process.exit(1);
});