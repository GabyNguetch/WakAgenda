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
import { exportActivityCsv, importActivityCsv } from '@/services/updateService';
import type { ImportResult } from '@/services/updateService';
import {
  User, Camera, Building2, UserCheck, Calendar, Mail, Trash2,
  Download, Upload, CloudDownload, AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ─── Backup section ───────────────────────────────────────────────────────────

function BackupSection() {
  const today = new Date();
  const isBackupDay = today.getDate() === 10;

  const importFileRef                   = useRef<HTMLInputElement>(null);
  const [isExporting,    setIsExporting]    = useState(false);
  const [exportError,    setExportError]    = useState<string | null>(null);

  const [pendingFile,    setPendingFile]    = useState<File | null>(null);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
  const [isImporting,    setIsImporting]    = useState(false);
  const [importResult,   setImportResult]   = useState<ImportResult | null>(null);
  const [importError,    setImportError]    = useState<string | null>(null);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      await exportActivityCsv();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Erreur lors de l\'export.');
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // ── Import — file selection ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportResult(null);
    setImportError(null);
    setIsImportConfirmOpen(true);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  // ── Import — confirm ────────────────────────────────────────────────────────
  const handleImportConfirm = async () => {
    if (!pendingFile) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const result = await importActivityCsv(pendingFile);
      setImportResult(result);
      setIsImportConfirmOpen(false);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import.');
    } finally {
      setIsImporting(false);
      setPendingFile(null);
    }
  };

  const handleImportCancel = () => {
    setPendingFile(null);
    setIsImportConfirmOpen(false);
  };

  // ── Styles conditionnels (zone rouge le 10) ─────────────────────────────────
  const sectionBg    = isBackupDay
    ? 'bg-red-50 dark:bg-red-900/10 border-2 border-sabc-red'
    : 'bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700';

  const titleColor   = isBackupDay
    ? 'text-sabc-red'
    : 'text-gray-800 dark:text-white';

  const exportBtnCls = isBackupDay
    ? 'animate-pulse'
    : '';

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={importFileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className={`rounded-2xl p-6 space-y-4 transition-all duration-300 ${sectionBg}`}>

        {/* Bannière d'alerte (uniquement le jour 10) */}
        {isBackupDay && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-sabc-red text-white rounded-xl text-sm font-semibold animate-slide-up">
            <AlertCircle size={16} className="flex-shrink-0" />
            🔴 Rappel mensuel : pensez à sauvegarder votre activité aujourd'hui !
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
            isBackupDay
              ? 'bg-sabc-red/10 text-sabc-red'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            <CloudDownload size={18} />
          </div>
          <div>
            <h3 className={`font-bold text-base ${titleColor}`}>
              Sauvegarde de l'activité
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              Exportez toutes vos tâches et restaurez-les à tout moment.
              <br />
              Utile pour conserver votre historique ou changer de compte.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Export */}
          <div className="flex flex-col gap-1 flex-1">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`
                flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                border-2 border-sabc-red text-sabc-red hover:bg-sabc-red hover:text-white
                active:scale-[0.98]
                ${exportBtnCls}
              `}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Export en cours...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Exporter mes données (.csv)
                </>
              )}
            </button>
            {exportError && (
              <p className="text-xs text-red-500 animate-slide-up">⚠️ {exportError}</p>
            )}
          </div>

          {/* Import */}
          <div className="flex flex-col gap-1 flex-1">
            <button
              onClick={() => importFileRef.current?.click()}
              disabled={isImporting}
              className="
                flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300 hover:border-sabc-red hover:text-sabc-red
                active:scale-[0.98]
              "
            >
              <Upload size={15} />
              Restaurer depuis un fichier
            </button>
          </div>
        </div>

        {/* Import result summary */}
        {importResult && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm animate-slide-up">
            <p className="font-semibold text-green-700 dark:text-green-400">
              ✅ {importResult.imported} tâche{importResult.imported > 1 ? 's' : ''} importée{importResult.imported > 1 ? 's' : ''},&nbsp;
              {importResult.skipped} ignorée{importResult.skipped > 1 ? 's' : ''}
            </p>
            {importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-red-600 dark:text-red-400">
                {importResult.errors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ── Confirmation modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isImportConfirmOpen}
        onClose={handleImportCancel}
        title="Confirmer l'import"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Cette action va importer vos tâches depuis le fichier sélectionné.
            Les tâches déjà existantes ne seront pas écrasées.
          </p>

          {pendingFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300">
              <Upload size={13} className="text-sabc-red flex-shrink-0" />
              <span className="truncate font-medium">{pendingFile.name}</span>
            </div>
          )}

          {importError && (
            <p className="text-xs text-red-500 animate-slide-up">⚠️ {importError}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleImportCancel}
              disabled={isImporting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleImportConfirm}
              isLoading={isImporting}
              className="flex-1"
            >
              Importer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isEditing,    setIsEditing]    = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [isPicLoading, setIsPicLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting,   setIsDeleting]   = useState(false);
  const [success,      setSuccess]      = useState('');
  const [error,        setError]        = useState('');

  const [form, setForm] = useState({
    first_name:           user?.first_name           || '',
    last_name:            user?.last_name            || '',
    department:           user?.department           || '',
    supervisor_name:      user?.supervisor_name      || '',
    internship_start_date: user?.internship_start_date || '',
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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

        {/* Toasts */}
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

        {/* ── Avatar card ─────────────────────────────────────────────────── */}
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

        {/* ── Info card ────────────────────────────────────────────────────── */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Informations du stage
            </h3>
            {!isEditing ? (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} isLoading={isLoading}>
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: User,      label: 'Prénom',         value: user.first_name },
                { icon: User,      label: 'Nom',            value: user.last_name },
                { icon: Building2, label: 'Département',    value: user.department },
                { icon: UserCheck, label: 'Encadrant',      value: user.supervisor_name },
                { icon: Calendar,  label: 'Début du stage', value: formatDate(user.internship_start_date) },
                { icon: Mail,      label: 'E-mail',         value: user.email },
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
                <Input
                  label="Prénom"
                  value={form.first_name}
                  onChange={(e) => set('first_name', e.target.value)}
                />
                <Input
                  label="Nom"
                  value={form.last_name}
                  onChange={(e) => set('last_name', e.target.value)}
                />
              </div>
              <Input
                label="Département"
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
              />
              <Input
                label="Encadrant"
                value={form.supervisor_name}
                onChange={(e) => set('supervisor_name', e.target.value)}
              />
              <Input
                label="Début du stage"
                type="date"
                value={form.internship_start_date}
                onChange={(e) => set('internship_start_date', e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* ── Sauvegarde de l'activité ────────────────────────────────────── */}
        <BackupSection />

        {/* ── Danger zone ──────────────────────────────────────────────────── */}
        <Card className="p-6 border-red-100 dark:border-red-900/30">
          <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
            <Trash2 size={16} /> Zone dangereuse
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Supprimer mon compte
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Cette action est définitive et irréversible.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)}>
              Supprimer
            </Button>
          </div>
        </Card>

      </div>

      {/* ── Delete account modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cette action supprimera définitivement votre compte et toutes vos données.
            Voulez-vous continuer ?
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              className="flex-1"
            >
              Supprimer mon compte
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}