import apiClient from './client';
import { ApiResponse, User } from '@/types';

export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data!.user;
  },
};
