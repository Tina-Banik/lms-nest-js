import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { KycDocumentStatus } from '@prisma/client';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { RequestKycInfo } from './dto/request-kyc-info.dto';

@Injectable()
export class SystemAdminService {
  constructor(private readonly prismaService: PrismaService) {}

  //write the business logic
  // async reviewKycDocument(
  //   documentId: string,
  //   systemAdminId: string,
  //   reviewKycDto: ReviewKycDto,
  // ) {
  //   console.log('the document id =>', documentId);
  //   console.log('the system admin id =>', systemAdminId);

  //   //f1.find the document
  //   const document = await this.prismaService.kycDocument.findUnique({
  //     where: {
  //       id: documentId,
  //     },
  //   });
  //   console.log('the document =>', document);

  //   if (!document) {
  //     throw new NotFoundException('Document not found');
  //   }

  //   if (document.status === KycDocumentStatus.APPROVED) {
  //     throw new ConflictException('KYC document is already approved');
  //   }

  //   //reject KYC document
  //   if (document.status === KycDocumentStatus.REJECTED) {
  //     throw new ConflictException('KYC document is already rejected');
  //   }

  //   if (
  //     reviewKycDto.status === KycDocumentStatus.REJECTED &&
  //     !reviewKycDto.rejectionReason
  //   ) {
  //     throw new BadRequestException(
  //       'Rejection reason is required when rejecting the KYC',
  //     );
  //   }

  //   const updatedDocument = await this.prismaService.kycDocument.update({
  //     where: {
  //       id: documentId,
  //     },
  //     data: {
  //       status: reviewKycDto.status,
  //       rejectionReason:
  //         reviewKycDto.status === KycDocumentStatus.REJECTED
  //           ? reviewKycDto.rejectionReason
  //           : null,
  //       reviewedById: systemAdminId,
  //       reviewAt: new Date(),
  //     },
  //   });

  //   return {
  //     data: updatedDocument,
  //     message:
  //       reviewKycDto.status === KycDocumentStatus.APPROVED
  //         ? 'KYC Document is approved successfully'
  //         : 'KYC document is rejected successfully',
  //   };
  // }

  private ensureUnderReview(documents: { status: KycDocumentStatus }[]) {
    if (documents.some((doc) => doc.status !== KycDocumentStatus.UNDER_VIEW)) {
      throw new BadRequestException(
        'All KYC documents must be under review before this action',
      );
    }
  }

  //1.find the institute submission using one of its document Ids
  private async getSubmission(kycId: string) {
    const document = await this.prismaService.kycDocument.findUnique({
      where: {
        id: kycId,
      },
      select: {
        id: true,
        instituteId: true,
        institute: {
          select: {
            name: true,
            user: {
              select: {
                firstName: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.instituteId) {
      throw new BadRequestException(
        'This KYC document is not associated with an institute',
      );
    }

    const documents = await this.prismaService.kycDocument.findMany({
      where: {
        instituteId: document.instituteId,
      },
    });

    if (documents.length === 0) {
      throw new BadRequestException('No KYC documents not found');
    }

    return {
      documentId: document.id,
      instituteId: document.instituteId,
      instituteName: document.institute.name,
      documents,
    };
  }

  //2.start the kyc review
  async startReview(kycId: string, systemAdminId: string) {
    const { instituteId, documents } = await this.getSubmission(kycId);

    console.log('the institute id =>', instituteId);
    console.log('the documents =>', documents);

    const allowedStatuses: KycDocumentStatus[] = [
      KycDocumentStatus.PENDING,
      //will ad needs_information
    ];

    if (!documents.every((doc) => allowedStatuses.includes(doc.status))) {
      throw new BadRequestException(
        'the submission can not enter review from its current status',
      );
    }

    const res = await this.prismaService.kycDocument.updateMany({
      where: {
        instituteId,
        status: {
          in: allowedStatuses,
        },
      },
      data: {
        status: KycDocumentStatus.UNDER_VIEW,
        reviewedById: systemAdminId,
        reviewAt: new Date(),
        rejectionReason: null,
      },
    });

    return {
      message: 'KYC review started successfully',
      instituteId,
      status: KycDocumentStatus.UNDER_VIEW,
      res,
    };
  }

  //3.approved the kyc
  async approveKyc(kycId: string, systemAdminId: string) {
    console.log('the kyc id =>', kycId);
    console.log('the system admin id =>', systemAdminId);

    const { instituteId, documents } = await this.getSubmission(kycId);
    console.log('the institute-id=>', instituteId);
    console.log('the documents=>', documents);

    this.ensureUnderReview(documents);

    await this.prismaService.$transaction(async (tx) => {
      await tx.kycDocument.updateMany({
        where: { instituteId },
        data: {
          status: KycDocumentStatus.APPROVED,
          reviewedById: systemAdminId,
          reviewAt: new Date(),
          rejectionReason: null,
          //later add the review not
        },
      });

      //mark the institute as approved as well
      await tx.institute.update({
        where: {
          id: instituteId,
        },
        data: {
          status: 'APPROVED',
          isApproved: true,
        },
      });
    });

    return {
      message: 'KYC submission is approved successfully',
      instituteId,
      status: KycDocumentStatus.APPROVED,
    };
  }

  //4.reject the kyc
  async rejectKyc(kycId: string, systemAdminId: string, dto: RejectKycDto) {
    console.log('The kyc id =>', kycId);
    console.log('The system-admin id =>', systemAdminId);

    const { instituteId, documents } = await this.getSubmission(kycId);
    console.log('the institute id =>', instituteId);
    console.log('the documents =>', documents);

    this.ensureUnderReview(documents);

    await this.prismaService.$transaction(async (tx) => {
      await this.prismaService.kycDocument.updateMany({
        where: {
          id: kycId,
        },
        data: {
          status: KycDocumentStatus.REJECTED,
          rejectionReason: dto.rejectionReason,
          reviewAt: new Date(),
          reviewedById: systemAdminId,
          //later I will add the reviewNote
        },
      });

      await this.prismaService.institute.updateMany({
        where: {
          id: instituteId,
        },
        data: {
          status: 'REJECTED',
          isApproved: false,
          isPublished: false,
        },
      });

      return {
        message: 'KYC is rejected successfully',
        instituteId,
        rejectionReason: dto.rejectionReason,
        status: KycDocumentStatus.REJECTED,
      };
    });
  }

  //5.ask the applicant for missing information
  async requestInfo(kycId: string, systemAdminId: string, dto: RequestKycInfo) {
    console.log('the kyc id =>', kycId);
    console.log('The system admin id =>', systemAdminId);

    const { instituteId, documents } = await this.getSubmission(kycId);
    console.log('the institute id =>', instituteId);
    console.log('the kyc documents =>', documents);

    this.ensureUnderReview(documents);

    await this.prismaService.kycDocument.updateMany({
      where: {
        instituteId,
      },
      data: {
        status: KycDocumentStatus.APPROVED, //will add NEEDS_INFORMATION
        reviewedById: systemAdminId,
        reviewAt: new Date(),
        rejectionReason: dto.reason,
      },
    });

    return {
      message: 'Additional KYC information requested',
      instituteId,
      systemAdminId,
      reason: dto.reason,
    };
  }

  //6.Suspend the associated institute
  async suspendKyc(kycId: string, systemAdminId: string) {
    console.log('the kyc id =>', kycId);
    console.log('the system admin id =>', systemAdminId);

    const { instituteId, documents } = await this.getSubmission(kycId);
    console.log('the institute-id => ', instituteId);
    console.log('the user documents=>', documents);

    this.ensureUnderReview(documents);

    const institute = await this.prismaService.institute.findUnique({
      where: { id: instituteId },
    });

    if (!institute) {
      throw new NotFoundException('Institute not found');
    }

    if (institute.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only an approved institute can be suspended',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.kycDocument.updateMany({
        where: { instituteId },
        data: {
          status: KycDocumentStatus.REJECTED,
          reviewedById: systemAdminId,
          reviewAt: new Date(),
        },
      });

      await tx.institute.update({
        where: { id: instituteId },
        data: {
          status: 'REJECTED',
          isApproved: false,
          isPublished: false,
        },
      });
    });

    return {
      message: 'Institute and kyc suspend successfully',
      instituteId,
      status: 'SUSPENDED',
      performedBy: systemAdminId,
    };
  }
}
