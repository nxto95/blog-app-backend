// posts.entity.ts

import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { CommonEntity } from './common.entity';
import { UserEntity } from './users.entity';
import { CommentEntity } from './comments.entity';

@Entity('posts')
export class PostEntity extends CommonEntity {
  @Column({
    type: 'varchar',
    length: 256,
  })
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];
}
