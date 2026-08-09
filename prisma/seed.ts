import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ErrorCode } from '../src/common/exceptions/err-codes';

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
  console.log('The platform admin password=>', platformAdminPassword);

  if (!platformAdminEmail || !platformAdminPassword) {
    throw new BadRequestException({
      code: ErrorCode.BAD_REQUEST_EXCEPTION,
      message: 'Platform admin and password are missing on .env',
    });
  }

   // --------------------------------------------------
  // 1. Creation of Platform Admin
  // --------------------------------------------------
  
}

main().catch((error) => {
  console.error('seed failed:', error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect()
});
