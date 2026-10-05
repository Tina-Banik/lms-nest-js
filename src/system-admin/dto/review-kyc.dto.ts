import { KycDocumentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewKycDto {
  @IsEnum(KycDocumentStatus)
  status!: KycDocumentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
