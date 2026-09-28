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
import { CommentsService } from './comments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { IAuthUser } from '../common/types/interfaces';
import { AccessAuthGuard } from '../common/guards/access.guard';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '../common/dtos/comments.dto';
import { CurrentPost } from '../common/decorators/current-post.decorator';

@UseGuards(AccessAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @CurrentPost() postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.create(user.id, postId, dto);
    return {
      message: 'post created successfully',
      data: comment,
    };
  }

  @Get()
  async getUserComments(@CurrentUser() user: IAuthUser) {
    const { comments, count } = await this.commentsService.getUserComments(
      user.id,
    );
    return {
      message: 'user posts retrieved successfully',
      meta: {
        count,
      },
      data: comments,
    };
  }

  @Get(':commentId')
  async getById(
    @CurrentUser() user: IAuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    const post = await this.commentsService.getById(user.id, commentId);
    return {
      message: 'user post retrieved successfully',
      data: post,
    };
  }

  @Patch(':commentId')
  async update(
    @CurrentUser() user: IAuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    await this.commentsService.update(user.id, commentId, dto);
    return {
      message: 'user post updated successfully',
    };
  }

  @Post(':commentId/restore')
  async restore(
    @CurrentUser() user: IAuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    await this.commentsService.restore(user.id, commentId);
    return {
      message: 'user post restored successfully',
    };
  }

  @Delete(':commentId/soft-delete')
  async softDelete(
    @CurrentUser() user: IAuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    await this.commentsService.softDelete(user.id, commentId);
    return {
      message: 'user post deleted successfully',
    };
  }

  @Delete(':commentId/hard-delete')
  async hardDelete(
    @CurrentUser() user: IAuthUser,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    await this.commentsService.hardDelete(user.id, commentId);
    return {
      message: 'user post deleted successfully',
    };
  }
}
