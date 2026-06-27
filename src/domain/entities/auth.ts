export type UserRole = 'student' | 'admin' | string;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  phone: string;
  name?: string;
  role: UserRole;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}
