export interface CreateRefreshTokenInput {
  userId: string;
  familyId: string;
  jti: string;
  token: string;
  expiresAt: Date;
  replacedBy?: string | null;
  userAgent?: string;
}
