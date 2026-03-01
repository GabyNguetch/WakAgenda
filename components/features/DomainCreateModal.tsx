'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Index';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateDomain } from '@/hooks/useDomains';
import type { DomainResponse } from '@/types';

interface DomainCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (domain: DomainResponse) => void;
}

export function DomainCreateModal({ isOpen, onClose, onCreated }: DomainCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState(false);
  const { create, isLoading, error } = useCreateDomain();

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setToast(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const domain = await create({ name: name.trim(), description: description.trim() || undefined });
    if (domain) {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      onClose();
      onCreated(domain);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un domaine" size="sm">
      {/* ⚠️ Using div instead of form to avoid nested <form> inside TaskForm */}
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        {toast && (
          <div className="animate-slide-up p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm">
            ✅ Domaine créé avec succès !
          </div>
        )}

        <div>
          <Input
            label="Nom du domaine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marketing, R&D..."
            required
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>

        <Input
          label="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brève description du domaine"
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!name.trim()}
            className="flex-1"
          >
            Créer
          </Button>
        </div>
      </div>
    </Modal>
  );
}