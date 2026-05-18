import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findAll(pagination?: PaginationDto) {
    return this.usersRepository.findAll(pagination);
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
    const user = await this.usersRepository.create(dto);
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
