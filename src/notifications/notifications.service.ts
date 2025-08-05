import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './notification.entity';
import { UsersService } from '../users/users.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface INotificationsService {
  sendNotification(userId: string, type: NotificationType, message: string): Promise<Notification>;
  processNotification(notificationId: string): Promise<void>;
  getHistory(userId: string): Promise<Notification[]>;
  getById(id: string): Promise<Notification | null>;
}

@Injectable()
export class NotificationsService implements INotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectRepository(Notification) private notificationsRepo: Repository<Notification>,
    private usersService: UsersService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async sendNotification(userId: string, type: NotificationType, message: string): Promise<Notification> {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }
      const notification = this.notificationsRepo.create({ user, type, status: 'pending', message });
      await this.notificationsRepo.save(notification);
      await this.notificationsQueue.add('send', { notificationId: notification.id });
      return notification;
    } catch (error) {
      this.logger.error('Error sending notification', error.stack || error.message);
      throw error;
    }
  }

  async processNotification(notificationId: string) {
    try {
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
    } catch (error) {
      this.logger.error('Error processing notification', error.stack || error.message);
      throw error;
    }
  }

  async getHistory(userId: string) {
    try {
      return await this.notificationsRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    } catch (error) {
      this.logger.error('Error getting notification history', error.stack || error.message);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      return await this.notificationsRepo.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error getting notification by id', error.stack || error.message);
      throw error;
    }
  }
}
