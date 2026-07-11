import api from './api-client';
import { User } from '../types';

export const authService = {
  async login(credentials: any): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: any): Promise<void> {
    await api.post('/auth/register', data);
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};
