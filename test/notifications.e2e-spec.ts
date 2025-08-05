import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/user.entity';
import { Notification } from '../src/notifications/notification.entity';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let adminJwt: string;
  let userJwt: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(require('../src/auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          const auth = req.headers['authorization'];
          if (auth === 'Bearer admin.jwt.token') {
            req.user = { userId, role: 'admin', email: 'admin@example.com' };
          } else {
            req.user = { userId, role: 'user', email: 'user@example.com' };
          }
          return true;
        },
      })
      .overrideGuard(require('../src/auth/roles.guard').RolesGuard)
      .useValue(new (require('../src/auth/roles.guard').RolesGuard)(new (require('@nestjs/core').Reflector)()))
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
    await app.init();

    userId = 'b3b8c1e2-8c2a-4e2a-9b2a-1c2a3b4c5d6e';
    adminJwt = 'Bearer admin.jwt.token';
    userJwt = 'Bearer user.jwt.token';

    // Seed user
    const userRepo = app.get(getRepositoryToken(User));
    await userRepo.save({
      id: userId,
      email: 'testuser@example.com',
      role: 'user',
      notificationPreferences: { email: true, 'in-app': true },
    });
  });

  it('/api/notifications/send (POST) - admin allowed', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notifications/send')
      .set('Authorization', adminJwt)
      .send({ userId, type: 'email', message: 'Hello' });
    if (res.status !== 201) {
      // eslint-disable-next-line no-console
      console.error('API error response:', res.body);
    }
    expect(res.status).toBe(201);
  });

  it('/api/notifications/send (POST) - user forbidden', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notifications/send')
      .set('Authorization', userJwt)
      .send({ userId, type: 'email', message: 'Hello' });
    expect(res.status).toBe(403);
  });

  it('/api/notifications/send (POST) - should validate input', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/notifications/send')
      .set('Authorization', adminJwt)
      .send({ userId, type: 'email', message: 'Hello' });
    if (res.status !== 201) {
      // Print the error response for debugging
      // eslint-disable-next-line no-console
      console.error('API error response:', res.body);
    }
    expect(res.status).toBe(201);

    // Wait for Bull to process the job
    await new Promise(resolve => setTimeout(resolve, 500)); // adjust as needed

    // Fetch notification from DB and check status
    const notificationRepo = app.get(getRepositoryToken(Notification));
    const notification = await notificationRepo.findOne({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    expect(notification.status).toBe('sent');
  });

  afterAll(async () => {
    // Clean up notifications and user
    const notificationRepo = app.get(getRepositoryToken(Notification));
    await notificationRepo.delete({ user: { id: userId } });
    const userRepo = app.get(getRepositoryToken(User));
    await userRepo.delete(userId);
    await app.close();
  });
});
