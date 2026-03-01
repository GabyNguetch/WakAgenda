'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Card, Modal } from '@/components/ui/Index';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import { authService } from '@/services/authService';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { User, Camera, Building2, UserCheck, Calendar, Mail, Trash2, LogOut } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, setUser, logout, refreshUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPicLoading, setIsPicLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    department: user?.department || '',
    supervisor_name: user?.supervisor_name || '',
    internship_start_date: user?.internship_start_date || '',
  });

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      const updated = await userService.updateMe(form);
      setUser(updated);
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPicLoading(true);
    try {
      const updated = await userService.uploadPicture(file);
      setUser(updated);
    } catch {} finally {
      setIsPicLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteMe();
      authService.removeToken();
      setUser(null);
      router.push('/auth');
    } catch {} finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  const avatarUrl = resolveMediaUrl(user.profile_picture_url);

  return (
    <DashboardLayout title="Mon Profil">
      <div className="mx-auto space-y-5 animate-fade-in">
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm animate-slide-up">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Avatar card */}
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-sabc-red to-sabc-orange flex items-center justify-center">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={user.first_name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isPicLoading}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                {isPicLoading ? (
                  <div className="w-3 h-3 border border-sabc-red border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={12} className="text-gray-500" />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.department}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Mail size={11} /> {user.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Info card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Informations du stage</h3>
            {!isEditing ? (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Modifier</Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Annuler</Button>
                <Button size="sm" onClick={handleSave} isLoading={isLoading}>Sauvegarder</Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: User,      label: 'Prénom',          value: user.first_name },
                { icon: User,      label: 'Nom',             value: user.last_name },
                { icon: Building2, label: 'Département',     value: user.department },
                { icon: UserCheck, label: 'Encadrant',       value: user.supervisor_name },
                { icon: Calendar,  label: 'Début du stage',  value: formatDate(user.internship_start_date) },
                { icon: Mail,      label: 'E-mail',          value: user.email },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                    <Icon size={11} /> {label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
                <Input label="Nom" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </div>
              <Input label="Département" value={form.department} onChange={(e) => set('department', e.target.value)} />
              <Input label="Encadrant" value={form.supervisor_name} onChange={(e) => set('supervisor_name', e.target.value)} />
              <Input label="Début du stage" type="date" value={form.internship_start_date} onChange={(e) => set('internship_start_date', e.target.value)} />
            </div>
          )}
        </Card>

        {/* Danger zone */}
        <Card className="p-6 border-red-100 dark:border-red-900/30">
          <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={16} /> Zone dangereuse
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Supprimer mon compte</p>
              <p className="text-xs text-gray-500 mt-0.5">Cette action est définitive et irréversible.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>Supprimer</Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirmer la suppression" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cette action supprimera définitivement votre compte et toutes vos données. Voulez-vous continuer ?
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="flex-1">Annuler</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
              Supprimer mon compte
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}