import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        ConfigService,
        JwtService,
        {
          provide: 'GOOGLE_CLIENT_ID',
          useValue: 'test-client-id',
        },
        {
          provide: 'GOOGLE_CLIENT_SECRET',
          useValue: 'test-client-secret',
        },
        {
          provide: 'GOOGLE_REDIRECT_URI',
          useValue: 'http://localhost:3000/auth/google/callback',
        },
        {
          provide: 'JWT_SECRET_KEY',
          useValue: 'test-secret',
        },
        {
          provide: 'JWT_EXPIRATION_TIME',
          useValue: '1h',
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
