import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { ErrorCode } from '../src/common/exceptions/err-codes';
import { hashPassword } from '../src/shared/utils/password/password';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeded........');

  // --------------------------------------------------
  // 1. Platform Admin configuration
  // --------------------------------------------------

  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const platformAdminPhone = process.env.PLATFORM_ADMIN_PHONE;
  const platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD;

  console.log('The platform admin email =>', platformAdminEmail);
  console.log('The platform admin phone=>', platformAdminPhone);

  if (!platformAdminEmail || !platformAdminPassword) {
    throw new BadRequestException({
      code: ErrorCode.BAD_REQUEST_EXCEPTION,
      message: 'Platform admin and password are missing on .env',
    });
  }

  // --------------------------------------------------
  // 1. Creation of Platform Admin
  // --------------------------------------------------
  let platformAdminUser = await prisma.user.findUnique({
    where: {
      email: platformAdminEmail,
    },
  });

  if (!platformAdminUser) {
    const hashedPasswords = await hashPassword(platformAdminPassword);

    platformAdminUser = await prisma.user.create({
      data: {
        firstName: 'Platform Admin',
        lastName: '',
        email: platformAdminEmail,
        phone: platformAdminPhone as string,
        password: hashedPasswords,
        isActive: true,
      },
    });

    console.log(`Platform admin created: ${platformAdminUser.email}`);
  } else {
    console.log(`The Platform admin exists: ${platformAdminUser.email}`);
  }

  // ------------------------
  // 3. Roles
  // -------------------------
  const roles = [
    {
      name: 'PLATFORM_ADMIN',
      description: 'Full system access',
      isSystem: true,
    },
    {
      name: 'ADMIN',
      description: 'Institute Administrator',
      isSystem: true,
    },
    {
      name: 'STUDENT',
      description: 'Student role',
      isSystem: true,
    },
    {
      name: 'REVIEWER',
      description: 'Reviewer role for kyc verification',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      create: role,
      update: {},
    });
  }

  console.log('The roles are seeded');

  //----------------------
  //4. Permissions
  //----------------------
  const permissions = [
    //User
    { name: 'user.view', module: 'user' },
    { name: 'user.create', module: 'user' },
    { name: 'user.update', module: 'user' },
    { name: 'user.delete', module: 'user' },
    { name: 'user.activate', module: 'user' },

    //Institute
    { name: 'institute.create', module: 'institute' },
    { name: 'institute.view', module: 'institute' },
    { name: 'institute.update', module: 'institute' },
    { name: 'institute.suspend', module: 'institute' },

    //Kyc
    { name: 'kyc.view', module: 'kyc' },
    { name: 'kyc.update', module: 'kyc' },
    { name: 'kyc.approve', module: 'kyc' },
    { name: 'kyc.reject', module: 'kyc' },

    //Course
    { name: 'course.view', module: 'course' },
    { name: 'course.create', module: 'course' },
    { name: 'course.update', module: 'course' },
    { name: 'course.delete', module: 'course' },
    { name: 'course.publish', module: 'course' },

    //Course material
    { name: 'course_material.view', module: 'course_material' },
    { name: 'course_material.upload', module: 'course_material' },
    { name: 'course_material.delete', module: 'course_material' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      create: permission,
      update: {},
    });
  }

  console.log('permission seeded');

  //----------------------
  //5. Platform Admin Role
  //----------------------
  const platformAdminRole = await prisma.role.findUnique({
    where: {
      name: 'PLATFORM_ADMIN',
    },
  });

  if (!platformAdminRole) {
    throw new NotFoundException({
      code: ErrorCode.BAD_REQUEST_EXCEPTION,
      message: 'Platform admin role not found',
    });
  }

  //----------------------------------------
  //6.Give platform admin all permissions
  //----------------------------------------
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermissionAssignment.upsert({
      where: {
        roleId_permissionId: {
          roleId: platformAdminRole.id,
          permissionId: permission.id,
        },
      },
      create: {
        roleId: platformAdminRole.id,
        permissionId: permission.id,
      },
      update: {},
    });
  }

  console.log(`Platform admin granted ${allPermissions.length} permissions`);

  //-----------------------------------------
  //7.Assign platform admin role to admin user
  //------------------------------------------
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId: {
        userId: platformAdminUser.id,
        roleId: platformAdminRole.id,
      },
    },
    create: {
      userId: platformAdminUser.id,
      roleId: platformAdminRole.id,
    },
    update: {},
  });

  console.log('Platform_admin role assigned to user');

  //-----------------------------
  //8.ADMIN permissions
  //------------------------------
  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'ADMIN',
    },
  });

  if (!adminRole) {
    throw new NotFoundException({
      code: ErrorCode.BAD_REQUEST_EXCEPTION,
      message: 'ADMIN role not found',
    });
  }

  const adminPermissionNames = [
    'user.view',
    'user.create',
    'user.update',
    'user.delete',
    'user.activate',

    'institute.create',
    'institute.view',
    'institute.update',
    'institute.suspend',

    'course.view',
    'course.create',
    'course.update',
    'course.delete',
    'course.publish',

    'course_material.view',
    'course_material.upload',
    'course_material.delete',
  ];

  const adminPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: adminPermissionNames,
      },
    },
  });

  for (const permission of adminPermissions) {
    await prisma.rolePermissionAssignment.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
      update: {},
    });
  }

  console.log(`ADMIN granted ${adminPermissions.length} permissions`);

  console.log('\nDatabase seed completed successfully');
}

main()
  .catch((error) => {
    console.error('\nseed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
