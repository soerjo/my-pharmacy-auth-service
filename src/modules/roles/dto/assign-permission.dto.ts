import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({ example: 'permission-uuid' })
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}
