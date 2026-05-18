require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
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
    { name: 'warehouse:read', description: 'Read warehouse data' },
    { name: 'depo:read', description: 'Read depo data' },
    { name: 'auth:login', description: 'Login / refresh token' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({ where: { name: p.name }, update: p, create: p });
  }

  const rolePermissions = [
    ...permissions.map(p => ({ role: 'ADMIN', permissionName: p.name })),
    { role: 'USER', permissionName: 'auth:login' },
    { role: 'USER', permissionName: 'user:read' },
    { role: 'USER', permissionName: 'warehouse:read' },
    { role: 'USER', permissionName: 'depo:read' },
  ];

  for (const rp of rolePermissions) {
    const perm = await prisma.permission.findUnique({ where: { name: rp.permissionName } });
    if (perm) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: rp.role, permissionId: perm.id } },
        update: {},
        create: { role: rp.role, permissionId: perm.id },
      });
    }
  }

  console.log('✅ Seed selesai – permissions & role‑mapping ter‑buat.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
