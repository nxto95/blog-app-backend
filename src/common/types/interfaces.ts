import { UserRole } from './enums';

export interface IRequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

export interface IAuthUser extends Express.User {
  id: string;
  role: UserRole;
}
export interface IRefreshAuthUser {
  id: string;
  jti: string;
  refreshToken: string;
}

export type IAuthenticatedRequest = Request & {
  user: IAuthUser;
};

export interface IAccessTokenPayload {
  sub: string;
  role: UserRole;
  jti: string;
  type: 'access';
}

export interface IRefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}
