'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Index';
import { Input } from '@/components/ui/Input';
import { reportService } from '@/services/reportService';
import { FileDown, FileText, Info } from 'lucide-react';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    setSuccess(false);
    try {
      await reportService.downloadPdf(dateFrom || undefined, dateTo || undefined);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {} finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Génération de rapports">
      <div className=" mx-auto space-y-6 animate-fade-in">
        {/* Info card */}
        <Card className="p-5 border-l-4 border-l-sabc-orange">
          <div className="flex gap-3">
            <Info size={18} className="text-sabc-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Rapport d'activité PDF</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Générez un rapport complet de vos activités incluant une page de garde, 
                la liste chronologique de vos tâches et des statistiques récapitulatives.
              </p>
            </div>
          </div>
        </Card>

        {/* Options */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <FileText size={16} className="text-sabc-red" />
            Période du rapport (optionnel)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date de début"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              label="Date de fin"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <p className="text-xs text-gray-400">
            Si aucune date n'est spécifiée, le rapport couvrira du début de votre stage jusqu'à aujourd'hui.
          </p>

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl text-sm animate-slide-up">
              ✅ Rapport téléchargé avec succès !
            </div>
          )}

          <Button onClick={handleDownload} isLoading={isLoading} size="lg" className="w-full">
            <FileDown size={18} />
            {isLoading ? 'Génération en cours...' : 'Générer et télécharger le PDF'}
          </Button>
        </Card>

        {/* What's included */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Le rapport contient :</p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {[
              '📄 Page de garde avec vos informations et le logo SABC',
              '📊 Statistiques récapitulatives (total, répartition par catégorie et statut)',
              '📋 Liste chronologique de toutes vos tâches',
              '📅 Date de génération du rapport',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">{item}</li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}