// updateService.ts
// ============================================================
// NOUVELLES ROUTES AJOUTÉES — 2026-03-14
// Ce fichier centralise tous les appels aux routes ajoutées
// lors de la mise à jour du backend WakAgenda.
// ============================================================

import { apiClient } from '@/lib/apiClient';
import type { UserResponse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export type BroadcastResult = {
  sent: number;
  failed: number;
  recipients: string[];
};

// ─── Helpers internes ─────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── 1. Emploi du temps hebdomadaire (PDF paysage) ───────────────────────────
/**
 * GET /api/v1/reports/weekly-schedule?week_start=YYYY-MM-DD
 * Génère et télécharge un PDF paysage de l'emploi du temps de la semaine.
 * @param weekStart  Lundi de la semaine souhaitée (format YYYY-MM-DD).
 *                   Si omis, le backend utilise la semaine courante.
 */
export async function downloadWeeklySchedule(weekStart?: string): Promise<void> {
  const params: Record<string, string | undefined> = {};
  if (weekStart) params.week_start = weekStart;

  const blob = await apiClient.getBlob('/api/v1/reports/weekly-schedule', params);
  const datePart = weekStart ?? todayIso();
  triggerDownload(blob, `emploi_du_temps_${datePart}.pdf`);
}

// ─── 2. Rapport technico-fonctionnel Word (.docx) ─────────────────────────────
/**
 * GET /api/v1/reports/technico-fonctionnel-docx?date_from=...&date_to=...
 * Génère et télécharge le rapport TF au format Word.
 * @param dateFrom  Date de début (YYYY-MM-DD). Optionnel.
 * @param dateTo    Date de fin   (YYYY-MM-DD). Optionnel.
 */
export async function downloadTechnicoFonctionnelDocx(
  dateFrom?: string,
  dateTo?: string,
): Promise<void> {
  const params: Record<string, string | undefined> = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo)   params.date_to   = dateTo;

  const blob = await apiClient.getBlob('/api/v1/reports/technico-fonctionnel-docx', params);
  triggerDownload(blob, `rapport_tf_wakagenda_${todayIso()}.docx`);
}

// ─── 3. Liste de tous les utilisateurs ───────────────────────────────────────
/**
 * GET /api/v1/users
 * Retourne la liste de tous les utilisateurs enregistrés.
 * Accessible à tout utilisateur authentifié.
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  return apiClient.get<UserResponse[]>('/api/v1/users');
}

// ─── 4. Export CSV de l'activité ─────────────────────────────────────────────
/**
 * GET /api/v1/export/csv
 * Génère et télécharge un fichier CSV UTF-8 BOM de toutes les tâches.
 * Colonnes : id, title, date, start_time, end_time, category, domain, status,
 *            reminder, notification_enabled, description, comment_content,
 *            created_at, updated_at.
 */
export async function exportActivityCsv(): Promise<void> {
  const blob = await apiClient.getBlob('/api/v1/export/csv');
  triggerDownload(blob, `wakagenda_export_${todayIso()}.csv`);
}

// ─── 5. Import CSV de l'activité ─────────────────────────────────────────────
/**
 * POST /api/v1/import/csv  (multipart/form-data, champ "file")
 * Restaure les tâches depuis un CSV exporté par /export/csv.
 * - Les tâches existantes (même id) sont ignorées (skip).
 * - Les nouvelles tâches sont créées avec un nouvel id auto-généré.
 * - Les commentaires non vides sont insérés/mis à jour via upsert.
 * @returns { imported, skipped, errors }
 */
export async function importActivityCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.postFormData<ImportResult>('/api/v1/import/csv', formData);
}

// ─── 6. Broadcast notification email ─────────────────────────────────────────
/**
 * POST /api/v1/notifications/broadcast
 * Envoie un email à tous les utilisateurs actifs.
 * @param subject  Sujet de l'email.
 * @param message  Corps du message (HTML ou texte).
 * @returns { sent, failed, recipients }
 */
export async function broadcastNotification(
  subject: string,
  message: string,
): Promise<BroadcastResult> {
  return apiClient.post<BroadcastResult>('/api/v1/notifications/broadcast', {
    subject,
    message,
  });
}