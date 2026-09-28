import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { RequestWithPostId } from '../types/interfaces';

export const CurrentPost = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithPostId>();
    const postId = request.body?.postId;
    if (!postId) throw new BadRequestException('missing post id');
    return postId;
  },
);
