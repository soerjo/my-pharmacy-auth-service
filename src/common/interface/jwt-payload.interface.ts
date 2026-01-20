import { RoleEnum } from '../constant/role.constant';

export interface IJwtPayload {
  id: number;
  name: string;
  username: string;
  email: string;
  role: RoleEnum;
  jemaat_id?: number | undefined;
  nij?: string;
  tempPassword?: boolean;
  isPhoneValidate?: boolean;
}
