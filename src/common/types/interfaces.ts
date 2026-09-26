import { UserRole } from './enums';

export interface IJWTPayload {
  sub: string;
  role: UserRole;
  jti: string;
  type: 'access' | 'refresh';
}

export interface IRequestWithCookies extends Request {
  cookies: Record<string, string | undefined>;
}

export interface IAuthUser extends Express.User {
  id: string;
  role: UserRole;
}

export type IAuthenticatedRequest = Request & {
  user: IAuthUser;
};
