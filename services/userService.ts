import { apiClient } from '@/lib/apiClient';
import type { UserResponse, UserUpdate } from '@/types';

export const userService = {
  async getMe(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/api/v1/users/me');
  },

  async updateMe(data: UserUpdate): Promise<UserResponse> {
    return apiClient.patch<UserResponse>('/api/v1/users/me', data);
  },

  async deleteMe(): Promise<void> {
    return apiClient.delete('/api/v1/users/me');
  },

  async getUserById(userId: string): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/api/v1/users/${userId}`);
  },

  async uploadPicture(file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData<UserResponse>('/api/v1/users/me/picture', formData);
  },
};