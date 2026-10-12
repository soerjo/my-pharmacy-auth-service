import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { EmailModule } from './modules/email/email.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { PermissionsModule } from './modules/permissions/permissions.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { loggerConfig } from './config/logger.config.js';
import { validate } from './config/env.validation.js';
import { OtelModule } from './otel/otel.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    LoggerModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    HealthModule,
    EmailModule,
    RolesModule,
    PermissionsModule,
    OtelModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
