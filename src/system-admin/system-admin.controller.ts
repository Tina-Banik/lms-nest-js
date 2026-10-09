import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { SystemAdminGuard } from './guards/system-admin/system-admin.guard';
import { SystemAdminService } from './system-admin.service';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Controller('/api/v1/system-admin')
@UseGuards(JwtAuthGuard, SystemAdminGuard)
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Patch('/kyc/:documentId/review')
  reviewKyc(
    @Param('documentId') documentId:string,
    @Body() reviewKycDto:ReviewKycDto,
    @Req() request:any,
  ) {
    //here I call the service
  }
}
