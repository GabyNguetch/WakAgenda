'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { domainService } from '@/services/domainService';
import type { DomainCreate, DomainResponse } from '@/types';

// ── Cache module-level (partagé entre toutes les instances) ────────────────
// null = pas encore chargé / invalidé
let cache: { data: DomainResponse[]; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 secondes

export function invalidateDomainCache() {
  console.log('%c[useDomains] Cache invalidé', 'color:#f97316; font-weight:bold');
  cache = null;
}

// ── Hook: liste de domaines ────────────────────────────────────────────────
export function useDomainList() {
  const [domains, setDomains] = useState<DomainResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true); // toujours true au départ
  const fetchedOnce = useRef(false);

  const fetchDomains = useCallback(async (force = false) => {
    // Utilise le cache uniquement s'il est valide et qu'on ne force pas
    if (!force && cache && Date.now() - cache.timestamp < CACHE_TTL) {
      console.log(
        `%c[useDomains] Cache hit — ${cache.data.length} domaine(s) (âge: ${Math.round((Date.now() - cache.timestamp) / 1000)}s)`,
        'color:#3b82f6; font-weight:bold'
      );
      setDomains(cache.data);
      setIsLoading(false);
      return;
    }

    console.log(
      `%c[useDomains] Fetch réseau${force ? ' (forcé)' : ''}…`,
      'color:#8B5CF6; font-weight:bold'
    );
    setIsLoading(true);
    try {
      const data = await domainService.getDomains();
      cache = { data, timestamp: Date.now() };
      setDomains(data);
      console.log(
        `%c[useDomains] State mis à jour — ${data.length} domaine(s)`,
        'color:#22c55e; font-weight:bold',
        data
      );
    } catch (err) {
      console.error('%c[useDomains] ❌ Impossible de charger les domaines', 'color:#ef4444', err);
      // On garde l'état précédent
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement initial — toujours au premier montage
  useEffect(() => {
    if (!fetchedOnce.current) {
      fetchedOnce.current = true;
      fetchDomains();
    }
  }, [fetchDomains]);

  // refetch() = invalide le cache + force réseau
  const refetch = useCallback(() => {
    invalidateDomainCache();
    fetchDomains(true);
  }, [fetchDomains]);

  return { domains, isLoading, refetch };
}

// ── Hook: créer un domaine ─────────────────────────────────────────────────
export function useCreateDomain() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: DomainCreate): Promise<DomainResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const domain = await domainService.createDomain(data);
      // Invalide le cache pour que le prochain useDomainList() refetch
      invalidateDomainCache();
      return domain;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue';
      const friendly =
        msg.includes('409') || msg.toLowerCase().includes('exist')
          ? 'Ce domaine existe déjà'
          : msg;
      setError(friendly);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}