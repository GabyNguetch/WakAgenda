import { apiClient } from '@/lib/apiClient';
import type { DomainCreate, DomainResponse } from '@/types';

export const domainService = {
  async getDomains(): Promise<DomainResponse[]> {
    return apiClient.get<DomainResponse[]>('/api/v1/domains');
  },

  async createDomain(data: DomainCreate): Promise<DomainResponse> {
    return apiClient.post<DomainResponse>('/api/v1/domains', data);
  },
};