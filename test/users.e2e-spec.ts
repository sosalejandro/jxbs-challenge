import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let jwt: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(require('../src/auth/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../src/auth/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userId = 'b3b8c1e2-8c2a-4e2a-9b2a-1c2a3b4c5d6e';
    jwt = 'Bearer test.jwt.token';
  });

  it('/api/users/:id/preferences (GET)', async () => {
    return request(app.getHttpServer())
      .get(`/api/users/${userId}/preferences`)
      .set('Authorization', jwt)
      .expect(200);
  });

  it('/api/users/:id/preferences (PUT)', async () => {
    return request(app.getHttpServer())
      .put(`/api/users/${userId}/preferences`)
      .set('Authorization', jwt)
      .send({ email: false })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
