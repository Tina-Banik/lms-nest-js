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

  //create user
  createUser(registerDto: RegisterDto) {
    console.log('the register dto is =>', registerDto);
    return this.prismaService.user.create({
      data: {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        phone: registerDto.phone,
        password: registerDto.password,
        address: registerDto.address,
        city: registerDto.city,
        state: registerDto.state,
        pincode: registerDto.pincode,
      },
    });
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
        id: true,
        email: true,
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

  /**delete the old password reset token */
  async deleteOldPasswordResetToken(userId: string) {
    return await this.prismaService.passwordResetToken.deleteMany({
      where: { id: userId },
    });
  }

  /**create the saved password hash token */
  async savedPasswordHashToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return await this.prismaService.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  /**find user by email verification token */
  async findEmailVerificationTokenHash(tokenHash: string) {
    return this.prismaService.user.findFirst({
      where: {
        emailVerifyTokenHash: tokenHash,
      },
    });
  }
  
  async markEmailAsVerified(userId:string) {
    return this.prismaService.user.update({
      where:{
        id:userId
      },
      data:{
        isEmailVerified:true,
        emailVerifyExpiresAt:null,
        emailVerifyTokenHash:null
      }
    });
  }

  async resendEmailVerificationToken(userId:string, tokenHash:string,expiresAt:Date) {
    return await this.prismaService.user.update({
      where:{
        id:userId
      },
      data:{
        emailVerifyTokenHash:tokenHash,
        emailVerifyExpiresAt:expiresAt
      }
    })
  }
}
