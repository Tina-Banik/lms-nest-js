import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { SystemAdminGuard } from './guards/system-admin/system-admin.guard';
import { SystemAdminService } from './system-admin.service';
import { ReviewKycDto } from './dto/review-kyc.dto';

export interface AuthenticationRequest extends Request {
  user: {
    sub: string;
    roles: string[];
  };
}

@Controller('/api/v1/system-admin')
@UseGuards(JwtAuthGuard, SystemAdminGuard)
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  // @Patch('/kyc/:documentId/review')
  // reviewKyc(
  //   @Param('documentId') documentId: string,
  //   @Body() reviewKycDto: ReviewKycDto,
  //   @Req() request: any,
  // ) {
  //   //here I call the service
  //   console.log('The req.user.sub system-admin :', request.user.sub);
  //   return this.systemAdminService.reviewKycDocument(
  //     documentId,
  //     request.user.sub,
  //     reviewKycDto,
  //   );
  // }

  // start the kyc review = where the system-admin start the kyc review
  @Post('/:kycId/start-review')
  startReview(
    @Param('kycId') kycId: string,
    @Req() request: AuthenticationRequest,
  ) {
    console.log('The kyc id =>', kycId);
    console.log('The request user sub =>', request.user.sub);
    console.log('the request user roles =>', request.user.roles);

    return this.systemAdminService.startReview(kycId, request.user.sub);
  }

  //approve kyc
  @Post('/:kycId/approve')
  approveKyc(
    @Param('kycId') kycId: string,
    @Req() request: AuthenticationRequest,
  ) {
    //here import the service code
    console.log('the kyc id =>', kycId);
    console.log('the request user sub=>', request.user.sub);
    console.log('the request user roles=>', request.user.roles);

    return this.systemAdminService.approveKyc(kycId, request.user.sub);
  }
}
