import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayLoad {
  sub: string;
  email: string;
  roles?: string[];
  role?: string;
  instituteId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayLoad) {
    console.log('JWT validate payload :', payload);

    if (!payload.sub) {
      throw new UnauthorizedException('JWT does not contain a user id');
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      role: payload.role ?? null,
      instituteId: payload.instituteId ?? null,
    };
  }
}
