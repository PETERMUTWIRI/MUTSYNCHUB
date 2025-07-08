import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogController } from './audit-log.controller';
import { RevenueController } from './revenue.controller';
import { CommonModule } from '../../common/common.module';
import { RolesGuard } from '../../common/guards/roles.guard';
import { APP_GUARD, Reflector } from '@nestjs/core';

@Module({
  imports: [CommonModule, PassportModule],
  controllers: [AdminController, AuditLogController, RevenueController],
  providers: [
    AdminService,
    Reflector,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AdminModule {}
