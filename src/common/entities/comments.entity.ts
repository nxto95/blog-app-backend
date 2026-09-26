import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { CommonEntity } from './common.entity';
import { UserEntity } from './users.entity';
import { PostEntity } from './posts.entity';

@Entity('comments')
export class CommentEntity extends CommonEntity {
  @Column({
    type: 'text',
  })
  content: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  post: PostEntity;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: CommentEntity | null;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];
}
