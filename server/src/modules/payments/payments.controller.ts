import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContextService } from '../../common/services/tenant-context.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly tenantContext: TenantContextService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(@Body() data: any) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.paymentsService.createPayment({
      ...data,
      orgId,
      createdBy: userId
    });
  }

  @Get()
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Get organization payments' })
  @ApiResponse({ status: 200, description: 'List of payments' })
  async getPayments() {
    const orgId = this.tenantContext.getTenantId();
    return this.paymentsService.getPayments(orgId);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  async getPayment(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    return this.paymentsService.getPayment(id, orgId);
  }

  @Put(':id/cancel')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cancel a payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled' })
  async cancelPayment(@Param('id') id: string) {
    const orgId = this.tenantContext.getTenantId();
    const userId = this.tenantContext.getUserId();
    return this.paymentsService.cancelPayment(id, orgId, userId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook handled' })
  async handleWebhook(@Body() data: any) {
    return this.paymentsService.handleWebhook(data);
  }
}
