import { apiClient } from '@/lib/apiClient';
import type { TaskCreate, TaskFilters, TaskResponse, TaskStats, TaskUpdate } from '@/types';

export const taskService = {
  async createTask(data: TaskCreate): Promise<TaskResponse> {
    return apiClient.post<TaskResponse>('/api/v1/tasks', data);
  },

  async listTasks(filters?: TaskFilters): Promise<TaskResponse[]> {
    return apiClient.get<TaskResponse[]>('/api/v1/tasks', filters as Record<string, string | number | boolean | undefined>);
  },

  async getTodayTasks(): Promise<TaskResponse[]> {
    return apiClient.get<TaskResponse[]>('/api/v1/tasks/today');
  },

  async getUpcomingTasks(limit = 5): Promise<TaskResponse[]> {
    return apiClient.get<TaskResponse[]>('/api/v1/tasks/upcoming', { limit });
  },

  async getStats(): Promise<TaskStats> {
    return apiClient.get<TaskStats>('/api/v1/tasks/stats');
  },

  async getTask(taskId: string): Promise<TaskResponse> {
    return apiClient.get<TaskResponse>(`/api/v1/tasks/${taskId}`);
  },

  async updateTask(taskId: string, data: TaskUpdate): Promise<TaskResponse> {
    return apiClient.patch<TaskResponse>(`/api/v1/tasks/${taskId}`, data);
  },

  async deleteTask(taskId: string): Promise<void> {
    return apiClient.delete(`/api/v1/tasks/${taskId}`);
  },
};