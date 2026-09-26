import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthCookiesProvider } from './auth-cookies.provider';
import { LocalStrategy } from '../common/strategies/local.strategy';
import { AccessStrategy } from '../common/strategies/access.strategy';
import { RefreshStrategy } from '../common/strategies/refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthTokensProvider } from './auth-tokens.provider';
import { RefreshTokenEntity } from '../common/entities/ refresh-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UsersModule,
    JwtModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    AuthCookiesProvider,
    AuthTokensProvider,
    LocalStrategy,
    AccessStrategy,
    RefreshStrategy,
  ],
})
export class AuthModule {}
