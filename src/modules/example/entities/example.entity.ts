import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { MainEntityAbstract } from '../../../common/abstract/main-entity.abstract';
import { RoleEnum } from '../../../common/constant/role.constant';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin' })
export class AdminEntity extends MainEntityAbstract {
  @ApiProperty({ example: 'John Doe' })
  @Column()
  name: string;

  @ApiProperty({ example: 'johndoe' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({ example: '12345678', required: false })
  @Column({ nullable: true })
  telegram_user_id?: string;

  @ApiProperty({ enum: RoleEnum, required: false })
  @Column({ enum: RoleEnum, nullable: true })
  role: RoleEnum;

  @ApiProperty({ example: 1, required: false })
  @Column({ nullable: true })
  region_id: number;

  @Exclude()
  @ApiProperty({ description: 'Password hash', required: false })
  @Column({ nullable: true })
  password: string;

  @Exclude()
  @ApiProperty({ description: 'Temporary password hash', required: false })
  @Column({ nullable: true })
  temp_password: string;

  @BeforeInsert()
  async generateUniqueCode() {
    this.username = this.username ?? (await AdminEntity.createUniqueCode(this.region_id));
  }

  static async createUniqueCode(region_id: number): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2);
    const latestUser = await this.createQueryBuilder('admin')
      .where('admin.region_id = :region_id', { region_id })
      .orderBy('admin.id', 'DESC')
      .withDeleted()
      .getOne();

    const incrementId = latestUser ? latestUser.id + 1 : 1;
    const incrementIdStr = ('0000' + incrementId).slice(-4);
    const incrementRegionId = ('0000' + region_id).slice(-4);

    return `USR-${year}${month}${incrementRegionId}${incrementIdStr}`;
  }
}
