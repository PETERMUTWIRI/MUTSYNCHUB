import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule, PassportModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
