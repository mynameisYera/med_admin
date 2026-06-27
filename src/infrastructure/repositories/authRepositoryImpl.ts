import type { AuthRepository } from '@/domain/repositories/auth.repository';
import type {
  AuthTokens,
  LoginCredentials,
  User,
} from '@/domain/entities/auth';
import { env } from '@/shared/config/env';
import { ApiError, parseErrorResponse } from '../http/apiError';
import { httpClient } from '../http/httpClient';
import { tokenStorage } from '../storage/tokenStorage';

interface LoginResponse {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
}

function mapTokens(data: LoginResponse): AuthTokens {
  const accessToken = data.access ?? data.access_token;
  const refreshToken = data.refresh ?? data.refresh_token;

  if (!accessToken || !refreshToken) {
    throw new ApiError('Неверный ответ сервера при авторизации', 500);
  }

  return { accessToken, refreshToken };
}

export class AuthRepositoryImpl implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await fetch(`${env.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const detail = await parseErrorResponse(response);
      throw new ApiError(detail, response.status, detail);
    }

    const tokens = mapTokens((await response.json()) as LoginResponse);
    tokenStorage.save(tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const data = await httpClient<LoginResponse>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const tokens = mapTokens(data);
    tokenStorage.save(tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  async getMe(_accessToken: string): Promise<User> {
    try {
      return await httpClient<User>('/auth/me');
    } catch {
      return { phone: '', role: 'student' };
    }
  }
}

export const authRepository = new AuthRepositoryImpl();
