import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './notification.entity';
import { UsersService } from '../users/users.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    private usersService: UsersService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async sendNotification(userId: string, type: NotificationType, message: string): Promise<Notification> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const notification = this.notificationsRepo.create({ user, type, status: 'pending', message });
    await this.notificationsRepo.save(notification);
    await this.notificationsQueue.add('send', { notificationId: notification.id });
    return notification;
  }

  async processNotification(notificationId: string) {
    const notification = await this.notificationsRepo.findOne({ where: { id: notificationId } });
    if (!notification) return;
    try {
      // Simulate sending
      notification.status = 'sent';
      await this.notificationsRepo.save(notification);
    } catch (e) {
      notification.status = 'failed';
      await this.notificationsRepo.save(notification);
    }
  }

  async getHistory(userId: string) {
    return this.notificationsRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async getById(id: string) {
    return this.notificationsRepo.findOne({ where: { id } });
  }
}
