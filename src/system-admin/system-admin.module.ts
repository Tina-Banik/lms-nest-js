import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [SystemAdminController],
  providers: [SystemAdminService],
  imports:[PrismaModule]
})
export class SystemAdminModule {}
