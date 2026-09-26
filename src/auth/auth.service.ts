import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { INVALID_CREDENTIALS } from '../common/types/constants';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../common/dtos/users.dto';

import { randomUUID } from 'crypto';
import { AuthCookiesProvider } from './auth-cookies.provider';
import { Response } from 'express';
import { AuthTokensProvider } from './auth-tokens.provider';
import { IAuthUser, IRefreshTokenPayload } from '../common/types/interfaces';
import { UserEntity } from '../common/entities/users.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenEntity } from '../common/entities/ refresh-tokens.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly cookiesProvider: AuthCookiesProvider,
    private readonly tokensProvider: AuthTokensProvider,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateLocalUser(email: string, password: string) {
    const user = await this.usersService.getByEmail(email);
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch) throw new UnauthorizedException(INVALID_CREDENTIALS);
    return { id: user.id, role: user.role, isBlocked: user.isBlocked };
  }

  async register(dto: CreateUserDto, response: Response) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.create(dto, queryRunner.manager);
      const { refreshToken, jti, expiresAt } =
        await this.tokensProvider.issueRefreshToken(user.id);
      const newFamilyId = randomUUID();
      await this.tokensProvider.createRefreshToken(
        {
          userId: user.id,
          familyId: newFamilyId,
          jti,
          token: refreshToken,
          expiresAt,
        },
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      const { accessToken } = await this.tokensProvider.issueAccessToken(user);
      this.cookiesProvider.setRefreshToken(response, refreshToken);
      return { accessToken };
    } catch (error) {
      if (queryRunner.isTransactionActive)
        await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(user: IAuthUser | UserEntity, response: Response) {
    const newFamilyId = randomUUID();
    const { refreshToken, jti, expiresAt } =
      await this.tokensProvider.issueRefreshToken(user.id);
    await this.tokensProvider.createRefreshToken({
      userId: user.id,
      familyId: newFamilyId,
      jti,
      token: refreshToken,
      expiresAt,
    });
    this.cookiesProvider.setRefreshToken(response, refreshToken);

    const { accessToken } = await this.tokensProvider.issueAccessToken(
      user as UserEntity,
    );
    return { accessToken };
  }

  async logout(refreshToken: string, response: Response) {
    const payload = await this.jwtService.verifyAsync<IRefreshTokenPayload>(
      refreshToken,
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );
    await this.tokensProvider.revokeByJti(payload.jti);
    this.cookiesProvider.clearRefreshToken(response);
  }

  async refresh(refreshToken: string, response: Response) {
    const payload = await this.jwtService.verifyAsync<IRefreshTokenPayload>(
      refreshToken,
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      },
    );

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.getById(payload.sub);

    if (!user || user.isBlocked) {
      throw new UnauthorizedException();
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldRefreshTokenRecord =
        await this.tokensProvider.getRefreshTokenByJtiForUpdate(
          payload.jti,
          queryRunner.manager,
        );

      if (!oldRefreshTokenRecord) {
        throw new UnauthorizedException('Missing refresh token');
      }

      if (oldRefreshTokenRecord.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (oldRefreshTokenRecord.revokedAt) {
        throw new UnauthorizedException('Refresh token already used');
      }

      if (oldRefreshTokenRecord.expiresAt <= new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const isValid = await argon2.verify(
        oldRefreshTokenRecord.hash,
        refreshToken,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const {
        refreshToken: newRefreshToken,
        jti,
        expiresAt,
      } = await this.tokensProvider.issueRefreshToken(
        oldRefreshTokenRecord.userId,
        oldRefreshTokenRecord.familyId,
      );

      const newRefreshTokenRecord =
        await this.tokensProvider.createRefreshToken(
          {
            userId: oldRefreshTokenRecord.userId,
            familyId: oldRefreshTokenRecord.familyId,
            jti,
            token: newRefreshToken,
            expiresAt,
          },
          queryRunner.manager,
        );

      oldRefreshTokenRecord.revokedAt = new Date();
      oldRefreshTokenRecord.replacedBy = newRefreshTokenRecord.jti;

      await queryRunner.manager.save(RefreshTokenEntity, oldRefreshTokenRecord);

      await queryRunner.commitTransaction();

      const { accessToken } = await this.tokensProvider.issueAccessToken(user);

      this.cookiesProvider.setRefreshToken(response, newRefreshToken);

      return { accessToken };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  // async refresh(refreshToken: string, response: Response) {
  //   const { type } = await this.jwtService.verifyAsync<IRefreshTokenPayload>(
  //     refreshToken,
  //     {
  //       secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
  //     },
  //   );
  //   if (type !== 'refresh') {
  //     throw new UnauthorizedException('invalid refresh tokens');
  //   }

  //   const refreshEntity = await this.refreshTokensService.findByJti(
  //     payload.jti,
  //   );

  //   if (!refreshEntity) {
  //     throw new UnauthorizedException();
  //   }

  //   if (refreshEntity.userId !== payload.sub) {
  //     throw new UnauthorizedException();
  //   }

  //   if (refreshEntity.revokedAt) {
  //     throw new UnauthorizedException();
  //   }

  //   if (refreshEntity.expiresAt <= new Date()) {
  //     throw new UnauthorizedException();
  //   }

  //   const isValid = await argon2.verify(refreshEntity.hash, refreshToken);

  //   if (!isValid) {
  //     throw new UnauthorizedException();
  //   }

  //   const user = await this.usersService.getById(refreshEntity.userId);

  //   if (!user || user.isBlocked) {
  //     throw new UnauthorizedException();
  //   }

  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const oldToken = await this.refreshTokensService.findByJtiForUpdate(
  //       payload.jti,
  //       queryRunner.manager,
  //     );

  //     if (!oldToken || oldToken.revokedAt) {
  //       throw new UnauthorizedException();
  //     }

  //     const newRefresh = await this.issueRefreshToken(
  //       user.id,
  //       oldToken.familyId,
  //     );

  //     await this.refreshTokensService.revoke(
  //       oldToken,
  //       newRefresh.jti,
  //       queryRunner.manager,
  //     );

  //     await this.refreshTokensService.create(
  //       {
  //         userId: user.id,
  //         familyId: oldToken.familyId,
  //         jti: newRefresh.jti,
  //         token: newRefresh.refreshToken,
  //         expiresAt: newRefresh.expiresAt,
  //       },
  //       queryRunner.manager,
  //     );

  //     await queryRunner.commitTransaction();

  //     const accessToken = await this.issueAccessToken(user);

  //     this.cookiesProvider.setRefreshToken(response, newRefresh.refreshToken);

  //     return { accessToken };
  //   } catch (error) {
  //     if (queryRunner.isTransactionActive) {
  //       await queryRunner.rollbackTransaction();
  //     }

  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
