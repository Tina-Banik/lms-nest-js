import { KycDocumentType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadKycDocumentDto {
  @IsNotEmpty()
  @IsEnum(KycDocumentType)
  documentType!: KycDocumentType;
}
