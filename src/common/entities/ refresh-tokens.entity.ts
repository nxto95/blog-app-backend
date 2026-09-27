import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './users.entity';
import { CommonEntity } from './common.entity';
import { UNIQUE_JTI } from '../types/constants';

@Entity('refresh_tokens')
@Index(['userId', 'familyId'])
export class RefreshTokenEntity extends CommonEntity {
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  familyId: string;

  @Index(UNIQUE_JTI, { unique: true })
  @Column({ type: 'uuid' })
  jti: string;

  @Column({ type: 'text' })
  hash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  replacedBy: string | null;

  @Column({ type: 'varchar' })
  userAgent: string;
}
