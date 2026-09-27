import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreatePostDto, UpdatePostDto } from '../common/dtos/posts.dto';
import { PostEntity } from '../common/entities/posts.entity';

@Injectable()
export class PostsService {
  constructor(private readonly dataSource: DataSource) {}

  async create(userId: string, dto: CreatePostDto, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const post = mg.create(PostEntity, { ...dto, user: { id: userId } });
    return mg.save(PostEntity, post);
  }

  async update(
    userId: string,
    postId: string,
    dto: UpdatePostDto,
    manager?: EntityManager,
  ) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.update(
      PostEntity,
      { id: postId, user: { id: userId } },
      dto,
    );
    if (result.affected === 0) throw new NotFoundException('post not found');
  }

  async softDelete(userId: string, postId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.softDelete(PostEntity, {
      id: postId,
      user: { id: userId },
    });
    if (result.affected === 0) throw new NotFoundException('post not found');
  }

  async hardDelete(userId: string, postId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.delete(PostEntity, {
      id: postId,
      user: { id: userId },
    });
    if (result.affected === 0) throw new NotFoundException('post not found');
  }

  async restore(userId: string, postId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const result = await mg.restore(PostEntity, {
      id: postId,
      user: { id: userId },
    });
    if (result.affected === 0) throw new NotFoundException('post not found');
  }

  async getById(userId: string, postId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const post = await mg.findOne(PostEntity, {
      where: { id: postId, user: { id: userId } },
    });
    if (!post) throw new NotFoundException('post not found');
    return post;
  }

  async getUserPosts(userId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const post = await mg.find(PostEntity, {
      where: { user: { id: userId } },
    });
    return post;
  }
}
