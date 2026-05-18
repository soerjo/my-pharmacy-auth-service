import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const normalizeKey = (key: string | undefined) =>
          key?.replace(/\\n/g, '\n');
        return {
          // privateKey: normalizeKey(configService.get<string>('JWT_PRIVATE_KEY')),
          // publicKey: normalizeKey(configService.get<string>('JWT_PUBLIC_KEY')),
          secret: normalizeKey(configService.get<string>('JWT_ACCESS_SECRET')),
          signOptions: {
            expiresIn: configService.get<number>(
              'JWT_ACCESS_EXPIRATION',
            ) as number,
            algorithm: 'HS256',
          },
          verifyOptions: {
            algorithms: ['HS256'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleStrategy] : []),
  ],
  exports: [AuthService],
})
export class AuthModule {}
