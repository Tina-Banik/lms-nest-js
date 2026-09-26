import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadKycDocumentDto } from './dto/upload-kyc-document.dto';
import {memoryStorage} from "multer";

@Controller('/api/v1/kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}
    
  @Post('documents')
  @UseInterceptors(FileInterceptor('file',{
    storage:memoryStorage()
  }))
  uploadDocument(
    @Body() uploadKycDocumentDto: UploadKycDocumentDto,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(pdf|jpeg|jpg|png)$i/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userId = request.user?.id;
    console.log('The user-id =>', userId);

    if (!userId) {
      throw new BadRequestException('User not found');
    }

    //here write the service
  }
}
