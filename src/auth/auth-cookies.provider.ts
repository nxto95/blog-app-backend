import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { REFRESH_TOKEN_KEY } from '../common/types/constants';

@Injectable()
export class AuthCookiesProvider {
  constructor(private readonly config: ConfigService) {}

  setRefreshToken(response: Response, refreshToken: string): void {
    const isProduction =
      this.config.getOrThrow<string>('NODE_ENV') === 'production';
    const expiresIn = this.config.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN');

    response.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
      maxAge: expiresIn * 1000,
    });
  }

  clearRefreshToken(response: Response): void {
    const isProduction =
      this.config.getOrThrow<string>('NODE_ENV') === 'production';
    response.clearCookie(REFRESH_TOKEN_KEY, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
    });
  }
}
