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

  //get user by phone
  async getUserByPhone(phone: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        phone,
      },
      include: {
        userRoles: {
          select: {
            role: true,
          },
        },
      },
    });

    console.log("the user's phone number =>", user);
    return user;
  }

  //create institute
  async createInstitute(registerDto: RegisterDto) {
    const institute = await this.prismaService.institute.create({
      data: {
        name: registerDto.instituteName,
        instituteType: registerDto.instituteType,

        address: registerDto.address,
        city: registerDto.city,
        state: registerDto.state,
        pincode: registerDto.pincode,

        status: 'PENDING',
      },
    });
    console.log('the institute =>', institute);
    return institute;
  }

  //create user
  async createUser(registerDto: RegisterDto, instituteId: string) {
    console.log('the register dto is =>', registerDto);
    return await this.prismaService.user.create({
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
        institute: {
          connect: {
            id: instituteId,
          },
        },
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
    return this.prismaService.verificationToken.findFirst({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  }

  async markEmailAsVerified(userId: string) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailVerified: true,
        emailVerifyExpiresAt: null,
        emailVerifyTokenHash: null,
      },
    });
  }

  //remove previous verification token id
  async deleteEmailVerification(id: string) {
    return this.prismaService.verificationToken.delete({
      where: {
        id,
      },
    });
  }

  //remove previous verification tokens
  async deletePreviousEmailVerificationToken(userId: string) {
    return await this.prismaService.verificationToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  //create the new email verification token
  async resendEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    return await this.prismaService.verificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  //find password token hash
  async findPasswordToken(tokenHash: string) {
    return await this.prismaService.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });
  }

  //update the password
  async updatePassword(userId: string, password: string) {
    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password,
      },
    });
  }

  //delete password reset token
  async deletePasswordResetToken(id: string) {
    return await this.prismaService.passwordResetToken.delete({
      where: { id },
    });
  }

  //find ADMIN role
  async findAdminRole() {
    return await this.prismaService.role.findUnique({
      where: {
        name: 'ADMIN',
      },
    });
  }

  //assign admin role
  async assignAdminRole(userId: string, roleId: string) {
    return await this.prismaService.userRoleAssignment.create({
      data: {
        userId,
        roleId,
      },
    });
  }
}
