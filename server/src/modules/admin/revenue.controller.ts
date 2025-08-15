import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';

@ApiTags('Admin Revenue')
@Controller('admin/revenue')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class RevenueController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('ADMIN')
  async getTotalRevenue() {
    const result = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    return { totalRevenue: result._sum.amount || 0 };
  }
}
