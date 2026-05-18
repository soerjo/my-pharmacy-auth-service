import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from '../users/users.repository.js';
import { EmailService } from '../email/email.service.js';
import * as bcrypt from 'bcryptjs';
// import type { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';

import type { AuthUser } from '../../common/interfaces/auth-user.interface.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const permissions = await this.getPermissionsByRole(user.roleId);
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.roleId,
        role: user.role.name,
        organizationId: user.organizationId,
        permissions,
      };
    }

    return null;
  }

  async validateUserById(id: string): Promise<AuthUser | null> {
    const user = await this.usersRepository.findById(id);
    if (!user) return null;

    const permissions = await this.getPermissionsByRole(user.roleId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: user.role.name,
      organizationId: user.organizationId,
      permissions,
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const adminRole = await this.prisma.role.findUniqueOrThrow({
      where: { name: 'ADMIN' },
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: `Organization of ${dto.email}`,
          slug: `org-${dto.email}`,
        },
      });

      return tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName ?? '',
          lastName: dto.lastName ?? '',
          organizationId: organization.id,
          roleId: adminRole.id,
        },
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async validateGoogleUser(
    email: string,
    firstName: string,
    lastName: string,
    organizationId: string,
  ): Promise<AuthUser> {
    let user = await this.usersRepository.findByEmail(email);
    if (!user) {
      const userRole = await this.prisma.role.findUniqueOrThrow({
        where: { name: 'USER' },
      });
      await this.usersRepository.create({
        email,
        password: '',
        firstName,
        lastName,
        organizationId,
        roleId: userRole.id,
      });
      user = (await this.usersRepository.findByEmail(email)) as NonNullable<
        typeof user
      >;
    }
    const permissions = await this.getPermissionsByRole(user.roleId);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: user.role.name,
      organizationId: user.organizationId,
      permissions,
    };
  }

  login(payload: AuthUser) {
    const JWT_REFRESH_SECRET =
      this.configService.get<string>('JWT_REFRESH_SECRET');
    const JWT_REFRESH_EXPIRATION = this.configService.get<number>(
      'JWT_REFRESH_EXPIRATION',
    );

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRATION,
      algorithm: 'HS256',
    });

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  async getPermissionsByRole(roleId: string): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: { select: { name: true } } },
    });
    return rolePermissions.map((rp) => rp.permission.name);
  }

  async refreshTokens(refreshToken: string) {
    let payload: AuthUser;
    try {
      payload = this.jwtService.verify<AuthUser>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: user.role.name,
      organizationId: user.organizationId,
      permissions: [],
    };

    return this.login(authUser);
  }

  async setPassword(userId: string, newPassword: string) {
    const user = await this.usersRepository.findByEmail(
      (await this.usersRepository.findById(userId)).email,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.password) {
      throw new BadRequestException(
        'Password already set. Use change password instead.',
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updatePassword(userId, hashedPassword);
    return { message: 'Password set successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersRepository.findByEmail(
      (await this.usersRepository.findById(userId)).email,
    );
    if (!user || !user.password) {
      throw new BadRequestException(
        'No password set. Use set password instead.',
      );
    }
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updatePassword(userId, hashedPassword);
    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }
    const payload: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: user.role.name,
      organizationId: user.organizationId,
      permissions: [],
    };
    const resetToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: '1h',
    });

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    await this.emailService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'forgot-password',
      context: { resetUrl },
    });

    await this.usersRepository.updateHandleForgotPasswordReq(user.id, resetUrl);

    return {
      to: email,
      subject: 'Reset your password',
      template: 'forgot-password',
      context: { resetUrl },
    };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: AuthUser;
    try {
      payload = this.jwtService.verify<AuthUser>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    const user = await this.usersRepository.findUserRequestForgotPassword(
      payload.email,
    );
    if (!user) {
      throw new UnauthorizedException('User not request forgot password');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updateResetPasswordReq(user.id, hashedPassword);
    return { message: 'Password reset successfully' };
  }
}
