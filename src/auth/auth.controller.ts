import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    const result = this.authService.registerUser(registerDto);
    return result;
  }

  //login
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    const result = this.authService.loginUser(loginDto);
    return result;
  }
}
