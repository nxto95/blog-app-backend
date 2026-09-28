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
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => PostEntity, (post) => post.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  post: PostEntity;
  @Column({ type: 'uuid' })
  postId: string;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent: CommentEntity | null;
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];
}
