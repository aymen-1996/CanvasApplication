import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationGateway } from 'src/Gateway/NotificationGateway';
import { Repository } from 'typeorm';
import { Notification } from 'src/notif/notif.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepository: Repository<Notification>,
    private readonly notifGateway: NotificationGateway, 
  ) {}
 
  async createNotification(userId: number, message: string): Promise<Notification> {
    const notification = this.notifRepository.create({ userId, message });
    const savedNotification = await this.notifRepository.save(notification);

    this.notifGateway.server.emit('notificationCreated', savedNotification); 
    return savedNotification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await this.notifRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, 
    });
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    await this.notifRepository.update({ userId }, { isRead: true });
  }
}
