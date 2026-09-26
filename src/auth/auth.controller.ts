import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../common/dtos/users.dto';
import { type Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  type IRequestWithCookies,
  type IAuthUser,
} from '../common/types/interfaces';
import { LocalAuthGuard } from '../common/guards/local.guard';
import { AuthCookiesProvider } from './auth-cookies.provider';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesProvider: AuthCookiesProvider,
  ) {}

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(dto, response);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: IAuthUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
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
