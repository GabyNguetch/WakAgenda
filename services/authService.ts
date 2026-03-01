import { apiClient } from '@/lib/apiClient';
import type { LoginRequest, TokenResponse, UserCreate } from '@/types';

export const authService = {
  async register(data: UserCreate): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/register', data, false);
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>('/api/v1/auth/login', data, false);
  },

  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  removeToken(): void {
    localStorage.removeItem('access_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};