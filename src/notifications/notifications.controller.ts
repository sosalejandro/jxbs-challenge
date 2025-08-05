import { Controller, Post, Get, Param, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);
  constructor(private notificationsService: NotificationsService) {}

  @Post('send')
  @Roles('admin')
  async send(@Body() body: SendNotificationDto) {
    try {
      return await this.notificationsService.sendNotification(body.userId, body.type, body.message);
    } catch (error) {
      this.logger.error('Error sending notification', error.stack || error.message);
      throw error;
    }
  }

  @Get('history')
  async history(@Request() req) {
    try {
      return await this.notificationsService.getHistory(req.user.userId);
    } catch (error) {
      this.logger.error('Error fetching notification history', error.stack || error.message);
      throw error;
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await this.notificationsService.getById(id);
    } catch (error) {
      this.logger.error('Error fetching notification by id', error.stack || error.message);
      throw error;
    }
  }
}
