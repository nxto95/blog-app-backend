import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { INVALID_CREDENTIALS } from '../common/types/constants';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.getByEmail(email);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch) throw new UnauthorizedException(INVALID_CREDENTIALS);
    return { id: user.id, role: user.role, isBlocked: user.isBlocked };
  }

  async createRefreshTokenRecord() {}
}
