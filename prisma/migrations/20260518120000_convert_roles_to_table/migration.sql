-- 1. Create the new "roles" table
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- 2. Seed the three predefined roles from the old enum
INSERT INTO "roles" ("id", "name", "description", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'SYSTEM', 'System super-admin', now(), now()),
  (gen_random_uuid(), 'ADMIN',  'Organization administrator', now(), now()),
  (gen_random_uuid(), 'USER',   'Regular user', now(), now());

-- 3. Rename old junction table
ALTER TABLE "RolePermission" RENAME TO "RolePermission_old";

-- 4. Create new "permissions" table (renamed from "Permission")
ALTER TABLE "Permission" RENAME TO "permissions";

-- 5. Create new "role_permissions" junction table
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- 6. Migrate existing role-permission mappings (enum name → role row id)
INSERT INTO "role_permissions" ("roleId", "permissionId")
SELECT r.id, rp_old."permissionId"
FROM "RolePermission_old" rp_old
JOIN "roles" r ON r.name = rp_old."role"::text;

-- 7. Add roleId column to users (nullable first)
ALTER TABLE "users" ADD COLUMN "roleId" TEXT;

-- 8. Populate roleId from old enum role column
UPDATE "users" u SET "roleId" = r.id
FROM "roles" r
WHERE u.role::text = r.name;

-- 9. Make roleId NOT NULL and add FK
ALTER TABLE "users" ALTER COLUMN "roleId" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. Add FKs on role_permissions
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. Drop old enum column and old junction table
ALTER TABLE "users" DROP COLUMN "role";
DROP TABLE "RolePermission_old";

-- 12. Drop the RoleName enum type
DROP TYPE "RoleName";
