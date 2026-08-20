import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/registerUser.dto';
import { PrismaService } from '../prisma/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
  //get user by email
  async getUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          select: {
            role: true,
          },
        },
      },
    });
    console.log('The existing user is =>', user);
    return user;
  }

  createUser(registerDto: RegisterDto) {
    console.log('the register dto is =>', registerDto);
    return { message: 'User is created' };
  }

  //session create
  async sessionCreate(
    id: string,
    userId: string,
    token: string,
    userAgent?: string,
    ipAddress?: string,
    expiresAt?: Date,
  ) {
    const sessionToken = await this.prismaService.session.create({
      data: {
        id,
        userId,
        token,
        userAgent,
        ipAddress,
        expiresAt: expiresAt!,
      },
    });

    return sessionToken;
  }

  /*
  Logout from a single device
  Deletes a specific active session based on its unique token string
  */
  async deleteSingleDevice(
    sessionId: string,
    userId: string,
    // refreshToken: string,
  ) {
    return await this.prismaService.session.deleteMany({
      where: { id: sessionId, userId },
    });
  }

  /**get session by id */
  async getSessionById(
    sessionId: string, //jti
    userId: string, //sub
    refreshToken: string,
  ) {
    return await this.prismaService.session.findFirst({
      where: {
        id: sessionId,
        userId,
        token: refreshToken,
      },
    });
  }

  /**get user by id */
  async getUserById(userId: string) {
    return await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id:true,
        email:true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
