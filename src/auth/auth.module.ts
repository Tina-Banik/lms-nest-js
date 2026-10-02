import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from './constant';
import { MailService } from '../mail/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [UserModule, JwtModule.register({
    global:true,
    secret:jwtConstant.secret,
    signOptions:{expiresIn:'1m'}
  }),PassportModule],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy],
  exports:[JwtStrategy]
})
export class AuthModule {}
