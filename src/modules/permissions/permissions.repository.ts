import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';

@Injectable()
export class PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(pagination?: PaginationDto): Promise<PaginatedResult<unknown>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.permission.count(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return permission;
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.permission.create({ data });
  }

  async update(id: string, data: { [key: string]: unknown }) {
    await this.findById(id);
    return this.prisma.permission.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.permission.delete({ where: { id } });
  }
}
