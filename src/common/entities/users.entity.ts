// users.entity.ts

import { Exclude } from 'class-transformer';
import { Column, Entity, Index, OneToMany } from 'typeorm';

import { CommonEntity } from './common.entity';
import { PostEntity } from './posts.entity';
import { CommentEntity } from './comments.entity';

import { UserRole } from '../types/enums';
import { UNIQUE_EMAIL, UNIQUE_USERNAME } from '../types/constants';

@Entity('users')
export class UserEntity extends CommonEntity {
  @Index(UNIQUE_USERNAME, { unique: true })
  @Column({
    type: 'varchar',
    length: 55,
  })
  username: string;

  @Index(UNIQUE_EMAIL, { unique: true })
  @Column({
    type: 'citext',
  })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];
}
