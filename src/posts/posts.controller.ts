import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type IAuthUser } from '../common/types/interfaces';
import { CreatePostDto, UpdatePostDto } from '../common/dtos/posts.dto';

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

  @Get()
  async getUserPosts(@CurrentUser() user: IAuthUser) {
    const { posts, count } = await this.postsService.getUserPosts(user.id);
    return {
      message: 'user posts retrieved successfully',
      meta: {
        count,
      },
      data: posts,
    };
  }

  @Get(':postId')
  async getById(
    @CurrentUser() user: IAuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    const post = await this.postsService.getById(user.id, postId);
    return {
      message: 'user post retrieved successfully',
      data: post,
    };
  }

  @Patch(':postId')
  async update(
    @CurrentUser() user: IAuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: UpdatePostDto,
  ) {
    await this.postsService.update(user.id, postId, dto);
    return {
      message: 'user post updated successfully',
    };
  }

  @Post(':postId/restore')
  async restore(
    @CurrentUser() user: IAuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    await this.postsService.restore(user.id, postId);
    return {
      message: 'user post restored successfully',
    };
  }

  @Delete(':postId')
  async softDelete(
    @CurrentUser() user: IAuthUser,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    await this.postsService.softDelete(user.id, postId);
    return {
      message: 'user post deleted successfully',
    };
  }
}
