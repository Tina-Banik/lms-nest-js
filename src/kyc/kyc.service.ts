import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { KycDocumentType } from '@prisma/client';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class KycService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadDocument(
    userId: string,
    documentType: KycDocumentType,
    file: Express.Multer.File,
  ) {
    //1.find user
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    //2.user must belong to the institute
    if (!user.instituteId) {
      throw new BadRequestException(
        'User is not associated with this institute',
      );
    }

    //3.upload directory
    const uploadDirectory = path.join(
      process.cwd(),
      'public',
      'uploads',
      'kyc',
    );

    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory, {
        recursive: true,
      });
    }

    //4.create unique file name
    const extension = path.extname(file.originalname);

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    const filePath = path.join(uploadDirectory, fileName);

    //5. save file
    fs.writeFileSync(filePath, file.buffer);

    //6. save meta data in database
    const kycDocument = await this.prismaService.kycDocument.create({
      data: {
        instituteId: user.instituteId,
        uploadedById: userId,
        documentType,
        fileName: file.originalname,
        fileUrl: `/uploads/kyc/${fileName}`,
        fileType: file.mimetype,
        status: 'PENDING',
      },
    });

    return {
        message:"KYC document uploaded successfully",
        data:kycDocument
    }
  }
}
