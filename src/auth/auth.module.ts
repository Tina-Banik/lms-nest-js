import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from './constant';

@Module({
  imports: [UserModule, JwtModule.register({
    global:true,
    secret:jwtConstant.secret,
    signOptions:{expiresIn:'1m'}
  })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
