import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LOCAL_KEY } from '../types/constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL_KEY) {}
