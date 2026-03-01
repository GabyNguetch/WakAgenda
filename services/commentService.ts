import { apiClient } from '@/lib/apiClient';
import type { TaskCommentResponse } from '@/types';

export const commentService = {
  async getComment(taskId: string): Promise<TaskCommentResponse | null> {
    try {
      return await apiClient.get<TaskCommentResponse>(`/api/v1/tasks/${taskId}/comment`);
    } catch (err) {
      // Return null on 404
      if (err instanceof Error && err.message.includes('404')) return null;
      return null;
    }
  },

  async createComment(taskId: string, content: string): Promise<TaskCommentResponse> {
    return apiClient.post<TaskCommentResponse>(`/api/v1/tasks/${taskId}/comment`, { content });
  },
};