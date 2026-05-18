import { Injectable } from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async findAll(pagination?: PaginationDto) {
    return this.organizationsRepository.findAll(pagination);
  }

  async findBySlug(slug: string) {
    return this.organizationsRepository.findBySlug(slug);
  }

  async findById(id: string) {
    return this.organizationsRepository.findById(id);
  }

  async create(dto: CreateOrganizationDto) {
    return this.organizationsRepository.create(dto);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    return this.organizationsRepository.update(
      id,
      dto as { [key: string]: unknown },
    );
  }

  async remove(id: string) {
    return this.organizationsRepository.remove(id);
  }
}
