import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { StackAuthGuard } from '../../common/guards/stack-auth.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantContextService } from '../../common/services/tenant-context.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(StackAuthGuard, TenantContextGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly tenantContext: TenantContextService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'List of user notifications' })
  async getNotifications() {
    const userId = this.tenantContext.getUserId();
    const orgId = this.tenantContext.getTenantId();
    return this.notificationsService.getUserNotifications(userId, orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  async createNotification(@Body() data: any) {
    const userId = this.tenantContext.getUserId();
    const orgId = this.tenantContext.getTenantId();
    return this.notificationsService.createNotification({
      ...data,
      orgId,
      createdBy: userId
    });
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('id') id: string) {
    const userId = this.tenantContext.getUserId();
    const orgId = this.tenantContext.getTenantId();
    return this.notificationsService.markAsRead(id, userId, orgId);
  }
}
