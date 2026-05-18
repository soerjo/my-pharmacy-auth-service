import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { AssignPermissionDto } from './dto/assign-permission.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class RolesService {
  constructor(private rolesRepository: RolesRepository) {}

  async findAll(pagination?: PaginationDto) {
    return this.rolesRepository.findAll(pagination);
  }

  async findById(id: string) {
    return this.rolesRepository.findById(id);
  }

  async create(dto: CreateRoleDto) {
    return this.rolesRepository.create(dto);
  }

  async update(id: string, dto: UpdateRoleDto) {
    return this.rolesRepository.update(id, dto as { [key: string]: unknown });
  }

  async remove(id: string) {
    return this.rolesRepository.remove(id);
  }

  async getPermissions(roleId: string) {
    return this.rolesRepository.getPermissions(roleId);
  }

  async assignPermission(roleId: string, dto: AssignPermissionDto) {
    return this.rolesRepository.assignPermission(roleId, dto.permissionId);
  }

  async removePermission(roleId: string, permissionId: string) {
    return this.rolesRepository.removePermission(roleId, permissionId);
  }
}
