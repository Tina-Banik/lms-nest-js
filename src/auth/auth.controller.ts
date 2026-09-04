import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { PasswordRequestResetDto } from './dto/password-request-reset.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-conform.dto';
import { ResendVerifyEmailDto } from './dto/resend-email-verification.dto';

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
  login(@Body() loginDto: LoginDto, @Req() request: any) {
    const result = this.authService.loginUser(
      loginDto,
      // request.referrerPolicy,
      request.headers['user-agent'],
      request.ip,
    );
    return result;
  }

  //logout
  @Post('logout')
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.refreshToken);
  }

  //refresh the access token = /refresh-token
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  //verify email
  @Get('verify-email')
  verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  //resend-verify-email
  @Post('resend-verify-email')
  resendVerifyEmail(@Body() resendVerifyEmailDto: ResendVerifyEmailDto) {
    return this.authService.resendVerifyEmail(resendVerifyEmailDto.email);
  }

  //here request forgot password= /forgot-password
  @Post('forgot-password')
  forgotPasswordRequest(
    @Body() forgotPasswordRequestDto: PasswordRequestResetDto,
  ) {
    return this.authService.requestPasswordReset(
      forgotPasswordRequestDto.email,
    );
  }

  //reset password confirm
  @Post('reset-password-conform')
  resetPasswordConfirm(@Body() resetPasswordConfirm: PasswordResetConfirmDto) {}
}
