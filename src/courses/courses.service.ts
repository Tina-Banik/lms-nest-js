import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCourseDto } from './dto/list-courses.dto';
import { Prisma } from '@prisma/client';
import { UpdateCourseDto } from './dto/update-course.dto';

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
  async listMine(userId: string, query: ListCourseDto) {
    console.log('the user id =>', userId);
    const institute = await this.getApprovedInstitute(userId);
    console.log('the institute details =>', institute);

    const page = Number(query.page) ?? 1;
    const limit = Number(query.limit) ?? 10;

    const where: Prisma.CourseWhereInput = {
      instituteId: institute.id,
      ...(query.type ? { type: query.type } : {}),
      ...(query.isPublished !== undefined
        ? { isPublished: query.isPublished }
        : {}),
      ...(query.search
        ? {
            name: {
              contains: query.search.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.course.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  //get my courses
  async getMine(userId: string, courseId: string) {
    console.log('the user id =>', userId);
    console.log('The course id =>', courseId);

    const institute = await this.getApprovedInstitute(userId);

    console.log('the institute =>', institute);

    const course = await this.prismaService.course.findFirst({
      where: {
        id: courseId,
        instituteId: institute.id,
      },
    });

    if (!institute) {
      throw new BadRequestException('Course not found');
    }

    return course;
  }

  //update the course
  async update(userId: string, courseId: string, dto: UpdateCourseDto) {
    console.log('The admin user-id =>', userId);
    console.log('the course id =>', courseId);

    const institute = await this.getApprovedInstitute(userId);
    console.log('the institute details =>', institute);

    await this.getMine(userId, courseId);

    return this.prismaService.course.update({
      where: { id: courseId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.duration !== undefined
          ? { duration: dto.duration.trim() }
          : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.fee !== undefined ? { fee: dto.fee } : {}),
        ...(dto.currency !== undefined
          ? { currency: dto.currency.trim().toUpperCase() }
          : {}),
        ...(dto.thumbnailUrl !== undefined
          ? { thumbnailUrl: dto.thumbnailUrl }
          : {}),
        ...(dto.instructorName !== undefined
          ? { instructorName: dto.instructorName }
          : {}),
        ...(dto.paymentType !== undefined
          ? { paymentType: dto.paymentType }
          : {}),
        ...(dto.paymentGateway !== undefined
          ? { paymentGateway: dto.paymentGateway }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
      },
    });
  }

  //delete/remove the course
  async remove(userId: string, courseId: string) {
    console.log('the course id => ', courseId);
    console.log('The user id =>', userId);

    await this.getApprovedInstitute(userId);
    await this.getMine(userId, courseId);

    await this.prismaService.course.delete({
      where: { id: courseId },
    });

    return {
      message: 'course is deleted successfully',
      courseId,
    };
  }
}
