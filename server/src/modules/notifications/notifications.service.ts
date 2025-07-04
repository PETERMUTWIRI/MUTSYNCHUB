import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async getUserNotifications(userId: string) {
    // TODO: Fetch notifications from DB
    return [];
  }
  async createNotification(data: any) {
    // TODO: Create notification in DB and send email if needed
    return { success: true };
  }
  async markAsRead(id: string, userId: string) {
    // TODO: Mark notification as read in DB
    return { success: true };
  }
}
