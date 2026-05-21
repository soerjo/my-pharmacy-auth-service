import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(pagination?: PaginationDto, organizationId?: string) {
    const result = await this.usersRepository.findAll(
      pagination,
      organizationId,
    );
    return {
      data: result.data.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        roleId: user.roleId,
        role: user.role.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      meta: result.meta,
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    const permissions = await this.usersRepository.findPermissionsByRole(
      user.roleId,
    );
    return {
      id: user.id,
      email: user.email,
      userName: user.firstName + ' ' + user.lastName,
      organizationName: user.organization.name,
      roleId: user.roleId,
      role: user.role.name,
      organizationId: user.organization.id,
      permissions,
    };
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.usersRepository.update(id, dto as { [key: string]: unknown });
  }

  async remove(id: string) {
    return this.usersRepository.remove(id);
  }
}
