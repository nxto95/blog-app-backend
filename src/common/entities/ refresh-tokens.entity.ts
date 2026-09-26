import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from './common.entity';
import { UserEntity } from './users.entity';

@Entity('refresh_tokens')
@Index(['user', 'familyId'])
export class RefreshTokenEntity extends CommonEntity {
  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'uuid',
  })
  familyId: string;

  @Index({ unique: true })
  @Column({
    type: 'uuid',
  })
  jti: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  hash: string;

  @Column({
    type: 'timestamptz',
  })
  expiresAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt: Date | null;
}
