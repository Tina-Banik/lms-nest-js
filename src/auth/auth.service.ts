import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerUser.dto';

@Injectable()
export class AuthService {
  //logic for register user
  /**
   * check email before exists
   * hash the passwords
   * store the user into db
   * generate jwt token
   * send token in response
   */
  constructor(private readonly userService: UserService) {}
  
  registerUser(registerDto:RegisterDto) {
    console.log("The register dto is =>",registerDto);
    return this.userService.createUser();
  }
}
