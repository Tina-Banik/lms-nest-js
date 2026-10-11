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
  async reviewKycDocument(
    documentId: string,
    systemAdminId: string,
    reviewKycDto: ReviewKycDto,
  ) {
    console.log('the document id =>', documentId);
    console.log('the system admin id =>', systemAdminId);

    //f1.find the document
    const document = await this.prismaService.kycDocument.findUnique({
      where: {
        id: documentId,
      },
    });
    console.log('the document =>', document);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.status === KycDocumentStatus.APPROVED) {
      throw new ConflictException('KYC document is already approved');
    }

    //reject KYC document
    if (document.status === KycDocumentStatus.REJECTED) {
      throw new ConflictException('KYC document is already rejected');
    }

    if (
      reviewKycDto.status === KycDocumentStatus.REJECTED &&
      !reviewKycDto.rejectionReason
    ) {
      throw new BadRequestException(
        'Rejection reason is required when rejecting the KYC',
      );
    }

    const updatedDocument = await this.prismaService.kycDocument.update({
      where: {
        id: documentId,
      },
      data: {
        status: reviewKycDto.status,
        rejectionReason:
          reviewKycDto.status === KycDocumentStatus.REJECTED
            ? reviewKycDto.rejectionReason
            : null,
        reviewedById: systemAdminId,
        reviewAt: new Date(),
      },
    });

    return {
      data: updatedDocument,
      message:
        reviewKycDto.status === KycDocumentStatus.APPROVED
          ? 'KYC Document is approved successfully'
          : 'KYC document is rejected successfully',
    };
  }
}
