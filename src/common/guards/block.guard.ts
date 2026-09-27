import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../../users/users.service';
import { INVALID_CREDENTIALS } from '../types/constants';
import { IAuthenticatedRequest } from '../types/interfaces';

@Injectable()
export class BlockedUserGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();

    if (!request.user) return true;

    const { id } = request.user;

    if (!id) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const user = await this.usersService.getById(id);

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked');
    }

    return true;
  }
}
