import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { PinoLogger } from 'nestjs-pino';
import { ErrorCode } from '../common/exceptions/err-codes';
import { comparePassword } from '../shared/utils/password/password';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { jwtConstant } from './constant';

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
    private readonly configService: ConfigService,
  ) {}

  async registerUser(registerDto: RegisterDto) {
    console.log('The register dto is =>', registerDto);

    const slatRounds = 10;
    const hash = await bcrypt.hash(registerDto.password, slatRounds);
    console.log('The password is =>', hash);

    return this.userService.createUser({ ...registerDto, password: hash });
  }

  //login
  async loginUser(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
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

    //----------------------------------
    //1.Access token
    //----------------------------------
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    console.log('The payload =>', payload);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: '1m',
    });
    console.log('The access token =>', accessToken);

    const sessionId = randomUUID();

    //----------------------------------
    //2.refresh token
    //---------------------------------
    const refreshTokenPayload = {
      sub: user.id,
      email: user.email,
      jti: sessionId,
    };

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: refreshSecret,
      expiresIn: '2m',
    });
    console.log('the refresh token are =>', refreshToken);

    const sessionExpiry = new Date(Date.now() + 60 * 1000);

    await this.userService.sessionCreate(
      sessionId,
      user.id,
      refreshToken,
      userAgent,
      ipAddress,
      sessionExpiry,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        pincode: user.pincode,
        state: user.state,
        city: user.city,
        roles,
      },
    };
  }

  //logout
  async logout(refreshToken: string) {
    console.log('The logout end point hits');
    this.logger.info('The logout method id called');

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    // console.log('The refresh secret=>', refreshSecret);

    let payload: {
      sub: string;
      email: string;
      jti: string;
    };

    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        jti: string;
      }>(refreshToken, { secret: refreshSecret, ignoreExpiration: true });
    } catch (error) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    if (!payload.sub || !payload.jti) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    const result = await this.userService.deleteSingleDevice(
      payload.jti,
      payload.sub,
      // refreshToken,
    );

    if (result.count === 0) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Session is already logged out',
      });
    }

    return {
      message: 'The user is logout successfully',
    };
  }

  //refresh access token
  async refreshAccessToken(refreshToken: string) {
    this.logger.info('the refresh access token is hit');

    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'); //present on .env

    let payload: {
      sub: string;
      email: string;
      jti: string;
    };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'invalid or expired refresh token',
      });
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'invalid or expired refresh token',
      });
    }

    //find the active session
    const session = await this.userService.getSessionById(
      payload.jti,
      payload.sub,
      refreshToken,
    );

    console.log("The active user's session =>", session);

    if (!session) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'session is invalid or already logged out',
      });
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'session expired',
      });
    }
    //get the user
    const user = await this.userService.getUserById(payload.sub);
    console.log('The existing user is =>', user);

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: 'user npt found',
      });
    }

    //get user's role
    const userRoles = user.userRoles.map((userRole) => userRole.role.name);

    const accessPayload = {
      sub: user.id,
      email: user.email,
      userRoles,
    };
    console.log('the access pay load=>', accessPayload);

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      // expiresIn: '1m',
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_SECRET_EXPIRES',
      ) as any,
    });

    console.log('the access token is =>', accessToken);

    return {
      accessToken,
    };
  }

  //request-password-reset
  async requestPasswordReset(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      //Do not reveal whether the email exists
      throw new UnauthorizedException({
        code: ErrorCode.CONFLICT_ERROR,
        message:
          'If an account exists with this email, a password request reset link has been sent',
      });
    }

    //generate random token
    const resetToken = randomBytes(32).toString('hex');

    //hsh token before saving this
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');

    //Token valid for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    //remove the old password reset tokens
  }
}
