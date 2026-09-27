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

  async register(dto: CreateUserDto, response: Response, userAgent: string) {
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
          replacedBy: null,
          userAgent,
        },
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      const accessToken = await this.tokensProvider.issueAccessToken(user);
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

  async login(
    user: IAuthUser | UserEntity,
    response: Response,
    userAgent: string,
  ) {
    const newFamilyId = randomUUID();
    const { refreshToken, jti, expiresAt } =
      await this.tokensProvider.issueRefreshToken(user.id);
    await this.tokensProvider.createRefreshToken({
      userId: user.id,
      familyId: newFamilyId,
      jti,
      token: refreshToken,
      expiresAt,
      userAgent,
    });
    this.cookiesProvider.setRefreshToken(response, refreshToken);

    const accessToken = await this.tokensProvider.issueAccessToken(
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

    if (payload.type !== 'refresh')
      throw new UnauthorizedException('wrong token type');

    const user = await this.usersService.getById(payload.sub);
    if (!user || user.isBlocked)
      throw new UnauthorizedException('invalid credentials');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const oldTokensRecord =
        await this.tokensProvider.getRefreshTokenByJtiWithLock(
          payload.jti,
          queryRunner.manager,
        );

      if (!oldTokensRecord || oldTokensRecord.userId !== user.id)
        throw new UnauthorizedException('invalid credentials');

      if (oldTokensRecord.revokedAt) {
        await this.tokensProvider.revokeFamily(
          oldTokensRecord.familyId,
          queryRunner.manager,
        );

        await queryRunner.commitTransaction();
        this.cookiesProvider.clearRefreshToken(response);
        throw new UnauthorizedException('reused tokens detection');
      }

      if (oldTokensRecord.expiresAt <= new Date()) {
        throw new UnauthorizedException('refresh token expired');
      }

      const isTokenMatch = await argon2.verify(
        oldTokensRecord.hash,
        refreshToken,
      );

      if (!isTokenMatch) throw new UnauthorizedException('invalid tokens ');

      const {
        refreshToken: newToken,
        jti,
        expiresAt,
      } = await this.tokensProvider.issueRefreshToken(user.id);

      oldTokensRecord.revokedAt = new Date();
      oldTokensRecord.replacedBy = jti;

      await queryRunner.manager.save(RefreshTokenEntity, oldTokensRecord);

      await this.tokensProvider.createRefreshToken(
        {
          userId: user.id,
          familyId: oldTokensRecord.familyId,
          jti,
          token: newToken,
          expiresAt,
          replacedBy: null,
        },
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      const accessToken = await this.tokensProvider.issueAccessToken(user);
      this.cookiesProvider.setRefreshToken(response, newToken);
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
}
