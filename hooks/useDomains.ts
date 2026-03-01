'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { domainService } from '@/services/domainService';
import type { DomainCreate, DomainResponse } from '@/types';

const CACHE_TTL = 60_000; // 60 seconds

let cache: { data: DomainResponse[]; timestamp: number } | null = null;

export function useDomainList() {
  const [domains, setDomains] = useState<DomainResponse[]>(cache?.data ?? []);
  const [isLoading, setIsLoading] = useState(!cache || Date.now() - cache.timestamp > CACHE_TTL);

  const refetch = useCallback(async (force = false) => {
    if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
      setDomains(cache.data);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await domainService.getDomains();
      cache = { data, timestamp: Date.now() };
      setDomains(data);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { domains, isLoading, refetch: () => refetch(true) };
}

export function useCreateDomain() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refetchRef = useRef<(() => void) | null>(null);

  const create = useCallback(async (data: DomainCreate): Promise<DomainResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const domain = await domainService.createDomain(data);
      // Invalidate cache
      cache = null;
      return domain;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(msg.includes('409') || msg.toLowerCase().includes('exist') ? 'Ce domaine existe déjà' : msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}