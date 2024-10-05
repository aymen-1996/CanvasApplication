import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notif.service';
import { Notification } from 'src/notif/notif.entity';

@Controller('notifications')
export class NotificationController {

  constructor(private readonly notificationService: NotificationService) {}

@Get(':userId/notif')
async getUserNotifications(@Param('userId') userId: number): Promise<Notification[]> {
  return await this.notificationService.getNotificationsByUserId(userId);
}

@Patch('read/:userId')
async markAsRead(@Param('userId') userId: number): Promise<void> {
  await this.notificationService.markNotificationsAsRead(userId);
}

}
