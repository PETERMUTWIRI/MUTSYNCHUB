import { Module } from '@nestjs/common';
import { TenantContextService } from './services/tenant-context.service';
import { AuditLoggerService } from './services/audit-logger.service';
import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TenantContextService, AuditLoggerService],
  exports: [TenantContextService, AuditLoggerService, PrismaModule], // Export PrismaModule as well
})
export class CommonModule {}
