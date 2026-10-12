import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { KycDocumentStatus } from '@prisma/client';

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
}
