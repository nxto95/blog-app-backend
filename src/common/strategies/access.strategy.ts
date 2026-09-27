import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_KEY } from '../types/constants';
import { IAccessTokenPayload, IAuthUser } from '../types/interfaces';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, ACCESS_KEY) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: IAccessTokenPayload): IAuthUser {
    return {
      id: payload.sub,
      role: payload.role,
    };
  }
}
