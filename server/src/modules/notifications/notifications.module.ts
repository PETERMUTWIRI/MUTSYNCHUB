import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PassportModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
