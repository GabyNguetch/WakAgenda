'use client';

import { useCallback, useEffect, useState } from 'react';
import { commentService } from '@/services/commentService';
import type { TaskCommentResponse } from '@/types';

export function useGetComment(taskId: string) {
  const [comment, setComment] = useState<TaskCommentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    commentService.getComment(taskId).then((data) => {
      if (!cancelled) {
        setComment(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [taskId]);

  return { comment, isLoading };
}

export function useSubmitComment(taskId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (content: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      await commentService.createComment(taskId, content);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  return { submit, isLoading, isSuccess, error };
}