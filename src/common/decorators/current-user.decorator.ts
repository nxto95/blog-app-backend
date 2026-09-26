import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IAuthUser } from '../types/interfaces';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): IAuthUser => {
    const request = context.switchToHttp().getRequest<{ user: IAuthUser }>();
    return request.user;
  },
);
