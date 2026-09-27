import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type IAuthUser } from '../common/types/interfaces';
import { CreatePostDto } from '../common/dtos/posts.dto';

import { AccessAuthGuard } from '../common/guards/access.guard';

@Controller('posts')
@UseGuards(AccessAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@CurrentUser() user: IAuthUser, @Body() dto: CreatePostDto) {
    const post = await this.postsService.create(user.id, dto);
    return {
      message: 'post created successfully',
      data: post,
    };
  }
}
