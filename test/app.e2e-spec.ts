import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/main.module';

let app: INestApplication;
let server;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  server = app.getHttpServer();
  await app.listen(0);
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

describe('API Root', () => {
  it('should return 404 for API root', () => {
    return request(server).get('/api').expect(404);
  });

  it('should return 404 for unknown routes', () => {
    return request(server).get('/unknown-route').expect(404);
  });
});

describe('Auth Module', () => {
  it('should have auth controller defined', () => {
    return request(server).get('/api/auth/profile').expect(401);
  });
});
