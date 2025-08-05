import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';
import { getQueueToken } from '@nestjs/bull';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepo: any;
  let usersService: any;
  let notificationsQueue: any;

  beforeEach(async () => {
    notificationsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    usersService = { findById: jest.fn() };
    notificationsQueue = { add: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notificationsRepo },
        { provide: UsersService, useValue: usersService },
        { provide: getQueueToken('notifications'), useValue: notificationsQueue },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should send notification and enqueue job', async () => {
    usersService.findById.mockResolvedValue({ id: 'user-id' });
    notificationsRepo.create.mockReturnValue({ id: 'notif-id' });
    notificationsRepo.save.mockResolvedValue({ id: 'notif-id' });
    await service.sendNotification('user-id', 'email', 'msg');
    expect(notificationsRepo.create).toHaveBeenCalled();
    expect(notificationsRepo.save).toHaveBeenCalled();
    expect(notificationsQueue.add).toHaveBeenCalledWith('send', { notificationId: 'notif-id' });
  });

  it('should throw if user not found', async () => {
    usersService.findById.mockResolvedValue(undefined);
    await expect(service.sendNotification('bad-id', 'email', 'msg')).rejects.toThrow('User with id bad-id not found');
  });

  it('should process notification and set status sent', async () => {
    notificationsRepo.findOne.mockResolvedValue({ id: 'notif-id', status: 'pending', save: jest.fn() });
    notificationsRepo.save.mockResolvedValue({ id: 'notif-id', status: 'sent' });
    await service.processNotification('notif-id');
    expect(notificationsRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }));
  });

  it('should process notification and set status failed on error', async () => {
    notificationsRepo.findOne.mockResolvedValue({ id: 'notif-id', status: 'pending', save: jest.fn() });
    notificationsRepo.save.mockImplementationOnce(() => { throw new Error('fail'); });
    notificationsRepo.save.mockResolvedValueOnce({ id: 'notif-id', status: 'failed' });
    await service.processNotification('notif-id');
    expect(notificationsRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
  });
});
