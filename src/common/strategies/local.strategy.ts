import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { LOCAL_KEY } from '../types/constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_KEY) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    return this.authService.validateLocalUser(email, password);
  }
}
