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
}
