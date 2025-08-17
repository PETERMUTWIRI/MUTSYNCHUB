// ...existing code...
import { Module, forwardRef } from '@nestjs/common';
import { StackAuthService } from './stack-auth.service';
import { StackAuthGuard } from './stack-auth.guard';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { OrganizationService } from '../organization/organization.service';
import { CommonModule } from '../../common/common.module';
import { RolesGuard } from '../../auth/roles.guard';
import { StackAuthBusinessService } from './stack-auth-business.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    OrganizationModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    StackAuthService,
    StackAuthGuard,
    StackAuthBusinessService,
    RolesGuard,
  ],
  exports: [
    StackAuthService,
    StackAuthGuard,
    StackAuthBusinessService,
  ],
})
export class AuthModule {}
