import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from '../common/dtos/comments.dto';
import { CommentEntity } from '../common/entities/comments.entity';

@Injectable()
export class CommentsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
    manager?: EntityManager,
  ) {
    const mg = manager ?? this.dataSource.manager;
    const parentId = dto.parentId ?? null;
    const comment = mg.create(CommentEntity, {
      content: dto.content,
      userId,
      postId,
      parentId: parentId,
    });
    return mg.save(CommentEntity, comment);
  }

  async update(
    userId: string,
    commentId: string,
    dto: UpdateCommentDto,
    manager?: EntityManager,
  ) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.update(
      CommentEntity,
      { id: commentId, userId },
      dto,
    );
    if (result.affected === 0) throw new NotFoundException('comment not found');
  }

  async softDelete(userId: string, commentId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.softDelete(CommentEntity, {
      id: commentId,
      userId,
    });
    if (result.affected === 0) throw new NotFoundException('comment not found');
  }

  async hardDelete(userId: string, commentId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.delete(CommentEntity, {
      id: commentId,
      userId,
    });
    if (result.affected === 0) throw new NotFoundException('comment not found');
  }

  async restore(userId: string, commentId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.restore(CommentEntity, {
      id: commentId,
      userId,
    });
    if (result.affected === 0) throw new NotFoundException('comment not found');
  }

  async getById(userId: string, commentId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const comment = await mg.findOne(CommentEntity, {
      where: { id: commentId, userId },
    });
    if (!comment) throw new NotFoundException('comment not found');
    return comment;
  }

  async getUserComments(userId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const [comments, count] = await mg.findAndCount(CommentEntity, {
      where: { userId },
    });
    return { comments, count };
  }
}
