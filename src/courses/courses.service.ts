import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  private async getApprovedInstitute(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        isEmailVerified: true,
        instituteId: true,
      },
    });

    if (!user?.instituteId) {
      throw new BadRequestException(
        'your account is not linked to the institute',
      );
    }

    const institute = await this.prismaService.institute.findUnique({
      where: {
        id: user.instituteId,
      },
      select: {
        id: true,
        instituteType: true,
        status: true,
        isApproved: true,
      },
    });

    if (
      !institute ||
      !institute.isApproved ||
      institute.status !== 'APPROVED'
    ) {
      throw new BadRequestException(
        'Your institute must be approved before managing the courses',
      );
    }

    return institute;
  }

  //create the course by the approved admin + institute
  async create(userId: string, dto: CreateCourseDto) {
    console.log('the user-id =>', userId);

    const institute = await this.getApprovedInstitute(userId);
    console.log('The institute =>', institute);

    if (!Number.isFinite(dto.fee) || dto.fee < 0) {
      throw new BadRequestException('Course fee must be non-negative');
    }

    return this.prismaService.course.create({
      data: {
        instituteId: institute.id,
        createdById: userId,
        name: dto.name.trim(),
        duration: dto.duration.trim(),
        type: dto.type,
        fee: dto.fee,
        currency: dto.currency.trim().toUpperCase(),
        thumbnailUrl: dto.thumbnailUrl,
        instructorName: dto.instructorName,
        paymentType: dto.paymentType,
        paymentGateWay: dto.paymentGateway,
        description: dto.description,
        isPublished: dto.isPublished ?? true,
      },
    });
  }

  //lists courses
}
