import { KycDocumentType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadKycDocumentDto {
  /**here I add a validator of the document */
  @IsNotEmpty()
  @IsEnum(KycDocumentType)
  documentType!: KycDocumentType;
}
