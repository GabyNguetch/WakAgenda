import { apiClient } from '@/lib/apiClient';
import type { NotificationResponse, UnreadCountResponse } from '@/types';

export const notificationService = {
  async getAll(skip = 0, limit = 50): Promise<NotificationResponse[]> {
    return apiClient.get<NotificationResponse[]>('/api/v1/notifications', { skip, limit });
  },

  async getUnread(): Promise<NotificationResponse[]> {
    return apiClient.get<NotificationResponse[]>('/api/v1/notifications/unread');
  },

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>('/api/v1/notifications/unread/count');
  },

  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return apiClient.patch<NotificationResponse>(`/api/v1/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/v1/notifications/read-all');
  },

  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(`/api/v1/notifications/${notificationId}`);
  },
};