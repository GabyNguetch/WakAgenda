'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { taskService } from '@/services/taskService';
import type { TaskFilters, TaskResponse } from '@/types';

const POLLING_INTERVAL = 30_000;

export function useTaskList(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.listTasks(filtersRef.current);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des tâches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [refetch]);

  return { tasks, isLoading, error, refetch };
}