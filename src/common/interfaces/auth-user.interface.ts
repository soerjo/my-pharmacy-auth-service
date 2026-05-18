export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: string;
  role: string;
  organizationId: string;
  permissions: string[];
}
