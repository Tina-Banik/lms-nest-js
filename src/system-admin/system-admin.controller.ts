import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { SystemAdminGuard } from './guards/system-admin/system-admin.guard';
import { SystemAdminService } from './system-admin.service';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { RequestKycInfo } from './dto/request-kyc-info.dto';
import { KycDocumentStatus } from '@prisma/client';
import { request } from 'http';

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

  //lists KYC submission with filters = GET http://localhost:3000/api/v1/system-admin/kyc
  @Get('/kyc')
  listsKyc(
    @Req() request: AuthenticationRequest,
    @Query('status') status?: KycDocumentStatus,
    @Query('instituteId') instituteId?: string,
  ) {
    const validStatuses = Object.values(KycDocumentStatus);

    if (status && !validStatuses.includes(status)) {
      throw new BadRequestException('Invalid KYC document status');
    }

    return this.systemAdminService.listsKyc(
      request.user.sub,
      status,
      instituteId,
    );
  }

  //get the kyc by id = GET http://localhost:3000/api/v1/system-admin/:kycId
  @Get('/:kycId')
  getKycById(
    @Param('kycId') kycId: string,
    @Req() request: AuthenticationRequest,
  ) {
    return this.systemAdminService.getKycById(kycId, request.user.sub);
  }

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

  //reject kyc
  @Post('/:kycId/reject')
  rejectKyc(
    @Param('kycId') kycId: string,
    @Body() dto: RejectKycDto,
    @Req() request: AuthenticationRequest,
  ) {
    //here add the service code
    console.log('the kyc id =>', kycId);
    console.log('the req.user =>', request.user.sub);
    console.log('the request user roles:', request.user.roles);

    return this.systemAdminService.rejectKyc(kycId, request.user.sub, dto);
  }

  //request0kyc-info
  @Post('/:kycId/request-info')
  requestInfo(
    @Param('kycId') kycId: string,
    @Body() dto: RequestKycInfo,
    @Req() request: AuthenticationRequest,
  ) {
    console.log('The kyc-id =>', kycId);
    console.log('the request user =>', request.user.sub);
    console.log('the request user role =>', request.user.roles);

    return this.systemAdminService.requestInfo(kycId, request.user.sub, dto);
  }

  //suspend kyc
  @Post('/:kycId/suspend')
  suspendKyc(
    @Param('kycId') kycId: string,
    @Req() request: AuthenticationRequest,
  ) {
    console.log('The kyc id => ', kycId);
    console.log('the req.user =>', request.user.sub);
    console.log('the request roles =>', request.user.roles);

    return this.systemAdminService.suspendKyc(kycId, request.user.sub);
  }

  //reactive kyc
  @Post('/:kycId/reactive')
  reactiveKyc(
    @Param('kycId') kycId: string,
    @Req() request: AuthenticationRequest,
  ) {
    console.log('The kyc-id =>', kycId);
    console.log('the request user =>', request.user.sub);
    console.log('the request user roles =>', request.user.roles);

    return this.systemAdminService.reactiveKyc(kycId, request.user.sub);
  }
}
