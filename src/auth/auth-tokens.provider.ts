import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateRefreshTokenInput } from '../common/dtos/auth.dto';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { RefreshTokenEntity } from '../common/entities/ refresh-tokens.entity';
import { UserEntity } from '../common/entities/users.entity';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../common/types/interfaces';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthTokensProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async createRefreshToken(
    input: CreateRefreshTokenInput,
    manager?: EntityManager,
  ) {
    const mg = manager ?? this.dataSource.manager;
    const hash = await argon2.hash(input.token, {
      type: argon2.argon2id,
    });

    const refreshToken = mg.create(RefreshTokenEntity, {
      userId: input.userId,
      familyId: input.familyId,
      jti: input.jti,
      hash,
      expiresAt: input.expiresAt,
      revokedAt: null,
      replacedBy: input.replacedBy ?? null,
      userAgent: input.userAgent,
    });

    return mg.save(RefreshTokenEntity, refreshToken);
  }

  async issueAccessToken(user: UserEntity) {
    const payload: IAccessTokenPayload = {
      sub: user.id,
      role: user.role,
      jti: randomUUID(),
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<number>('JWT_ACCESS_EXPIRES_IN'),
    });
    return accessToken;
  }

  async issueRefreshToken(userId: string) {
    const jti = randomUUID();
    const payload: IRefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN'),
    });
    const expiresIn = this.config.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN');
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      refreshToken,
      jti,
      expiresAt,
    };
  }

  async revokeByJti(jti: string): Promise<void> {
    await this.dataSource
      .getRepository(RefreshTokenEntity)
      .update({ jti, revokedAt: IsNull() }, { revokedAt: new Date() });
  }
  async revokeFamily(familyId: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    await mg.update(
      RefreshTokenEntity,
      {
        familyId,
      },
      { revokedAt: new Date() },
    );
  }

  async getRefreshTokenByJtiWithLock(jti: string, manager?: EntityManager) {
    const mg = manager ?? this.dataSource.manager;
    const refreshTokenRecord = await mg.findOne(RefreshTokenEntity, {
      where: {
        jti,
      },
      lock: {
        mode: 'pessimistic_write',
      },
    });
    return refreshTokenRecord;
  }
}
