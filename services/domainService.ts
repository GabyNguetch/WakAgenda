import { apiClient } from '@/lib/apiClient';
import type { DomainCreate, DomainResponse } from '@/types';

export const domainService = {
  async getDomains(): Promise<DomainResponse[]> {
    console.group('%c[DomainService] GET /api/v1/domains', 'color:#8B5CF6; font-weight:bold');
    console.log('%cRequête envoyée…', 'color:#94a3b8');
    try {
      const data = await apiClient.get<DomainResponse[]>('/api/v1/domains');
      console.log(
        `%c✅ ${data.length} domaine(s) reçu(s)`,
        'color:#22c55e; font-weight:bold',
        '\n',
        data.map((d) => `  • [${d.is_system ? 'système' : 'custom'}] ${d.name} (${d.id})`).join('\n')
      );
      console.groupEnd();
      return data;
    } catch (err) {
      console.error('%c❌ Erreur getDomains', 'color:#ef4444; font-weight:bold', err);
      console.groupEnd();
      throw err;
    }
  },

  async createDomain(data: DomainCreate): Promise<DomainResponse> {
    console.group('%c[DomainService] POST /api/v1/domains', 'color:#8B5CF6; font-weight:bold');
    console.log('%cPayload', 'color:#94a3b8', data);
    try {
      const result = await apiClient.post<DomainResponse>('/api/v1/domains', data);
      console.log('%c✅ Domaine créé', 'color:#22c55e; font-weight:bold', result);
      console.groupEnd();
      return result;
    } catch (err) {
      console.error('%c❌ Erreur createDomain', 'color:#ef4444; font-weight:bold', err);
      console.groupEnd();
      throw err;
    }
  },
};