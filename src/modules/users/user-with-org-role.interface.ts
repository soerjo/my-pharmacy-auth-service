export interface UserWithOrgRole {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  organizationId: string;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
}
