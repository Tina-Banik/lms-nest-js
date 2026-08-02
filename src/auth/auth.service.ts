import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import bcrypt from "bcrypt";

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
  
  async registerUser(registerDto:RegisterDto) {
    console.log("The register dto is =>",registerDto);
    
    const slatRounds = 10;
    const hash = await bcrypt.hash(registerDto.password, slatRounds);
    console.log("The password is =>", hash);

    return this.userService.createUser({...registerDto, password:hash});
  }
}
