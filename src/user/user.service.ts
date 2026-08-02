import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/registerUser.dto';

@Injectable()
export class UserService {
  createUser(registerDto: RegisterDto) {
    return { message: 'User is created' };
  }
}
