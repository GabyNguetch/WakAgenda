import { apiClient } from '@/lib/apiClient';

export const reportService = {
  async downloadPdf(dateFrom?: string, dateTo?: string): Promise<void> {
    const blob = await apiClient.getBlob('/api/v1/reports/technico-fonctionnel', { // ← ici
      date_from: dateFrom,
      date_to: dateTo,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_tf_wakagenda_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};