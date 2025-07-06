import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security Middleware
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Dynamic CORS Configuration
  const codespaceName = configService.get('CODESPACE_NAME', 'bug-free-lamp-jjgwv979796x357v4');
  const frontendOrigin = `https://${codespaceName}-5173.app.github.dev`;
  const allowedOrigins = [
    frontendOrigin,
    `https://${codespaceName}-5000.app.github.dev`,
    'http://localhost:5173'
  ];

  // Enhanced CORS Setup
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  });

  // Critical: Ensure CORS headers on all responses
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || frontendOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  await app.listen(configService.get('PORT', 5000));
  logger.log(`🚀 Server running on ${await app.getUrl()}`);
  logger.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch(err => {
  new Logger('Bootstrap').error('Startup failed', err);
  process.exit(1);
});