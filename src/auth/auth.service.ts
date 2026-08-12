import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PinoLogger } from 'nestjs-pino';
import { ErrorCode } from '../common/exceptions/err-codes';
import { comparePassword } from '../shared/utils/password/password';
import { JwtService } from '@nestjs/jwt';

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
  constructor(
    private readonly userService: UserService,
    private readonly logger: PinoLogger,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerDto: RegisterDto) {
    console.log('The register dto is =>', registerDto);

    const slatRounds = 10;
    const hash = await bcrypt.hash(registerDto.password, slatRounds);
    console.log('The password is =>', hash);

    return this.userService.createUser({ ...registerDto, password: hash });
  }

  //login
  async loginUser(loginDto: LoginDto) {
    console.log('The login dto is =>', loginDto);
    this.logger.info('Login method is called');
    /**
     * 1.get user exists
     * 2.match the passwords with the hash password
     * 3.find role
     * 4.jwt token
     * 5.return jwt token
     */
    const user = await this.userService.getUserByEmail(loginDto.email);
    console.log('The login dto =>', user);

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Email and password are incorrect',
      });
    }

    const matchedPassword = await comparePassword(
      loginDto.password,
      user.password,
    );
    console.log('The matched password =>', matchedPassword);

    if (!matchedPassword) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Email or password is incorrect',
      });
    }

    const roles = user.userRoles.map((userRoles) => userRoles.role.name);
    console.log('The role name is =>', roles);

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    console.log('The payload =>', payload);

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
       user:{
        id: user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
        phone:user.phone,
        pincode:user.pincode,
        state:user.state,
        city:user.city,
        roles
       }
    }
  }
}
