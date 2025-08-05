import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../src/notifications/notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../src/notifications/notification.entity';
import { UsersService } from '../src/users/users.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let usersService: Partial<UsersService>;
  let repo: any;

  beforeEach(async () => {
    usersService = { findById: jest.fn().mockResolvedValue({ id: 'user1' }) };
    repo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: repo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should send notification', async () => {
    repo.create.mockReturnValue({});
    repo.save.mockResolvedValue({});
    const result = await service.sendNotification('user1', 'email', 'msg');
    expect(result).toBeDefined();
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });
});
