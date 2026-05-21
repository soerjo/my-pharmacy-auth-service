import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import type { UserWithOrgRole } from './user-with-org-role.interface.js';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(
    pagination?: PaginationDto,
    organizationId?: string,
  ): Promise<PaginatedResult<UserWithOrgRole>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = organizationId ? { organizationId } : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          organizationId: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          organization: { select: { id: true, name: true } },
          role: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email, isActive: true },
      include: { role: { select: { id: true, name: true } } },
    });
  }

  async findUserRequestForgotPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email, forgotPasswordUrl: { not: null } },
    });
  }

  async create(
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>,
  ) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: { [key: string]: unknown }) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateResetPasswordReq(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        forgotPasswordUrl: null,
      },
    });
  }

  async updateHandleForgotPasswordReq(id: string, forgotPasswordUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        forgotPasswordUrl: forgotPasswordUrl,
      },
    });
  }

  async findPermissionsByRole(roleId: string): Promise<string[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: { select: { name: true } } },
    });
    return rolePermissions.map((rp) => rp.permission.name);
  }
}
