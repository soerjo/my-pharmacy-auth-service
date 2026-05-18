import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service.js';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles('ADMIN', 'SYSTEM')
  async findAll(@Query() pagination: PaginationDto) {
    return this.permissionsService.findAll(pagination);
  }

  @Get(':id')
  @Roles('ADMIN', 'SYSTEM')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findById(id);
  }

  @Post()
  @Roles('ADMIN', 'SYSTEM')
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SYSTEM')
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SYSTEM')
  async remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
