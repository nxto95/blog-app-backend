import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { REFRESH_KEY } from '../types/constants';

@Injectable()
export class RefreshAuthGuard extends AuthGuard(REFRESH_KEY) {}
