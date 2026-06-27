import type { AuthTokens, LoginCredentials, User } from '../entities/auth';

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthTokens>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  getMe(accessToken: string): Promise<User>;
}
