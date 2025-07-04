import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Post()
  async createNotification(@Body() data: any) {
    return this.notificationsService.createNotification(data);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
