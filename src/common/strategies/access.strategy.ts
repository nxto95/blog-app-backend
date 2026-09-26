import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_KEY } from '../types/constants';
import { ConfigService } from '@nestjs/config';
import { IJWTPayload } from '../types/interfaces';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, ACCESS_KEY) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: Partial<IJWTPayload>) {
    if (
      !payload ||
      typeof payload !== 'object' ||
      !payload.sub ||
      !payload.jti ||
      !payload.role ||
      !payload.type
    ) {
      throw new UnauthorizedException('Invalid access token payload');
    }
    return { id: payload.sub, role: payload.role };
  }
}
