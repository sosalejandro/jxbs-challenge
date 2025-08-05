import { Process, Processor } from '@nestjs/bull';
import bull from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('notifications')
export class NotificationsProcessor {
    constructor(private notificationsService: NotificationsService) { }

    @Process({ name: 'send', concurrency: 5 })
    async handleSendNotification(job: bull.Job) {
        const { notificationId } = job.data;
        await this.notificationsService.processNotification(notificationId);
    }
}
