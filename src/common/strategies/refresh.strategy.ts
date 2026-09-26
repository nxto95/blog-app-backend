import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJWTPayload, IRequestWithCookies } from '../types/interfaces';
import { REFRESH_TOKEN_KEY } from '../types/constants';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(configService: ConfigService) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: IRequestWithCookies): string | null => {
          const refreshToken = request.cookies?.[REFRESH_TOKEN_KEY];
          return typeof refreshToken === 'string' ? refreshToken : null;
        },
      ]),
    });
  }

  validate(request: IRequestWithCookies, payload: Partial<IJWTPayload>) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_KEY];

    if (typeof refreshToken !== 'string') {
      return null;
    }

    return {
      id: payload.sub,
      jti: payload.jti,
      type: payload.type,
      refreshToken,
    };
  }
}
