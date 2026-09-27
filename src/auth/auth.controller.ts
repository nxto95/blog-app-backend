import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCookiesProvider } from './auth-cookies.provider';
import { CreateUserDto } from '../common/dtos/users.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../common/guards/local.guard';
import { RefreshAuthGuard } from '../common/guards/refresh.guard';
import {
  type IRequestWithCookies,
  type IAuthUser,
  type IRefreshAuthUser,
} from '../common/types/interfaces';
import { UserAgent } from '../common/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesProvider: AuthCookiesProvider,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: CreateUserDto,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken } = await this.authService.register(
      dto,
      response,
      userAgent,
    );
    console.log(userAgent, 'controller');

    return {
      message: 'new user registered',
      data: { accessToken },
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUser() user: IAuthUser,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response, userAgent);
  }

  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: IRefreshAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!user.refreshToken) {
      this.cookiesProvider.clearRefreshToken(response);

      throw new UnauthorizedException('Missing refresh token');
    }

    return this.authService.refresh(user.refreshToken, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: IRequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken, response);
    }

    this.cookiesProvider.clearRefreshToken(response);
  }
}
