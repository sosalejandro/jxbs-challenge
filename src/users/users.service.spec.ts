import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

const mockUser = {
  id: 'user-id',
  email: 'test@example.com',
  role: 'user',
  notificationPreferences: { email: true, 'in-app': true },
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should find user by id', async () => {
    const user = await service.findById('user-id');
    expect(user).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('test@example.com');
    expect(user).toEqual(mockUser);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should get preferences', async () => {
    const prefs = await service.getPreferences('user-id');
    expect(prefs).toEqual(mockUser.notificationPreferences);
  });

  it('should update preferences', async () => {
    repo.findOne.mockResolvedValueOnce(mockUser);
    await service.updatePreferences('user-id', { email: false });
    expect(repo.update).toHaveBeenCalledWith('user-id', { notificationPreferences: { email: false } });
  });
});
