import { authRepository } from '@/infrastructure/repositories/authRepositoryImpl';
import { tokenStorage } from '@/infrastructure/storage/tokenStorage';
import type { LoginCredentials, User } from '@/domain/entities/auth';

export const authService = {
  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccess());
  },

  logout(): void {
    tokenStorage.clear();
  },

  async login(credentials: LoginCredentials): Promise<User> {
    await authRepository.login(credentials);
    return authRepository.getMe(tokenStorage.getAccess() ?? '');
  },

  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) return null;
    return authRepository.getMe(tokenStorage.getAccess() ?? '');
  },
};
