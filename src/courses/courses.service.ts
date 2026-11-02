import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma/prisma.service';

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

    return institute;
  }
}
