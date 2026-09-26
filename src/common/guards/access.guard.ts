import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACCESS_KEY } from '../types/constants';

@Injectable()
export class AccessAuthGuard extends AuthGuard(ACCESS_KEY) {}
