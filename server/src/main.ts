import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Always allow OPTIONS requests before any guards/interceptors
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
    } else {
      next();
    }
  });
  // Set global API prefix so all routes are under /api
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security Middleware
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const allowedOrigins = [
  'https://humble-goggles-v65jg96wwqjwfwrg-5173.app.github.dev',
  'http://localhost:5173',
  'https://localhost:5173'
];

// ✅ CORS setup
app.enableCors({
  origin: allowedOrigins, // 🔁 Simplify this for dev — no dynamic check
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
});


 

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