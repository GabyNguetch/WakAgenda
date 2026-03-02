'use client';

import { useState } from 'react';
import { useDomainList } from '@/hooks/useDomains';
import { DomainCreateModal } from './DomainCreateModal';
import type { DomainResponse } from '@/types';
import { cn } from '@/lib/utils';

interface DomainSelectProps {
  value: string;            // domain name (e.g. "Technique")
  onChange: (domainName: string) => void;
  label?: string;
  required?: boolean;
}

export function DomainSelect({ value, onChange, label, required }: DomainSelectProps) {
  const { domains, isLoading, refetch } = useDomainList();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const systemDomains = domains
    .filter((d) => d.is_system)
    .sort((a, b) => a.name.localeCompare(b.name));

  const customDomains = domains
    .filter((d) => !d.is_system)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__create__') {
      setIsCreateOpen(true);
    } else {
      onChange(val); // val = domain name (string)
    }
  };

  const handleCreated = (domain: DomainResponse) => {
    refetch(); // force re-fetch pour inclure le nouveau domaine
    onChange(domain.name);
  };

  const selectId = label?.toLowerCase().replace(/\s+/g, '-') ?? 'domain-select';

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-sabc-red ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          disabled={isLoading}
          className={cn(
            'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-gray-100',
            'px-4 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-sabc-red focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          required={required}
        >
          {isLoading ? (
            <option value="" disabled>Chargement des domaines...</option>
          ) : (
            <>
              <option value="" disabled>Sélectionner un domaine</option>

              {systemDomains.length > 0 && (
                <optgroup label="Domaines système">
                  {systemDomains.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              )}

              {customDomains.length > 0 && (
                <optgroup label="Domaines personnalisés">
                  {customDomains.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              )}

              <option value="__create__">＋ Créer un nouveau domaine</option>
            </>
          )}
        </select>

        {/* Affiche le domaine sélectionné s'il n'est pas dans la liste (cas hérité) */}
        {!isLoading && value && value !== '__create__' && !domains.find((d) => d.name === value) && (
          <p className="text-xs text-amber-500 mt-1">
            Domaine actuel : <strong>{value}</strong> (non trouvé dans la liste — il sera conservé)
          </p>
        )}
      </div>

      <DomainCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}