require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'SYSTEM', description: 'System super-admin' },
    { name: 'ADMIN', description: 'Organization administrator' },
    { name: 'USER', description: 'Regular user' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }

  const permissions = [
    { name: 'user:create', description: 'Create new users' },
    { name: 'user:read', description: 'Read user data' },
    { name: 'user:update', description: 'Update user data' },
    { name: 'user:delete', description: 'Delete user' },
    { name: 'org:create', description: 'Create organization' },
    { name: 'org:read', description: 'Read organization data' },
    { name: 'org:update', description: 'Update organization' },
    { name: 'org:delete', description: 'Delete organization' },
    { name: 'role:manage', description: 'Manage roles & permissions' },
    { name: 'permission:manage', description: 'Manage permissions' },
    { name: 'warehouse:read', description: 'Read warehouse data' },
    { name: 'depo:read', description: 'Read depo data' },
    { name: 'auth:login', description: 'Login / refresh token' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({ where: { name: p.name }, update: p, create: p });
  }

  const mappings = [
    ...permissions.map(p => ({ roleName: 'SYSTEM', permissionName: p.name })),
    ...permissions.map(p => ({ roleName: 'ADMIN', permissionName: p.name })),
    { roleName: 'USER', permissionName: 'auth:login' },
    { roleName: 'USER', permissionName: 'user:read' },
    { roleName: 'USER', permissionName: 'warehouse:read' },
    { roleName: 'USER', permissionName: 'depo:read' },
  ];

  for (const m of mappings) {
    const role = await prisma.role.findUnique({ where: { name: m.roleName } });
    const perm = await prisma.permission.findUnique({ where: { name: m.permissionName } });
    if (role && perm) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  console.log('✅ Seed selesai – roles, permissions & role-permission mapping ter-buat.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
