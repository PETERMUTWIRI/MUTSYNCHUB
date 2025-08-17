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
    'https://fluffy-bassoon-g4wrqgxqjvvv3wv5-3000.app.github.dev',
  ];
  const githubPattern = /^https:\/\/.*\.app\.github\.dev$/;
  const allowedOrigins = [...allowedExact, 'https://*.app.github.dev'];

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  app.use(cookieParser());
  // If the frontend sets the Stack token as a cookie, copy it into a header
  // so guards that look for the `x-stack-access-token` header can find it.
  app.use((req: any, _res: any, next: any) => {
    try {
      if (!req.headers || !req.headers['x-stack-access-token']) {
        const cookieToken = req.cookies?.['stack-access-token'] || req.cookies?.stackAccessToken || req.cookies?.['stack-access-token'];
        if (cookieToken) {
          req.headers['x-stack-access-token'] = cookieToken;
        }
      }
    } catch (e) {
      // ignore
    }
    next();
  });
  // Set global API prefix so all routes are under /api
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

 

  await app.listen(configService.get('PORT', 5000));
  logger.log(`🚀 Server running on ${await app.getUrl()}`);
  logger.log(`🔒 Allowed Origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch(err => {
  new Logger('Bootstrap').error('Startup failed', err);
  process.exit(1);
});