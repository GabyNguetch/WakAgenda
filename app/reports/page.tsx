'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/Dashboardlayout';
import { Card } from '@/components/ui/Index';
import { Input } from '@/components/ui/Input';
import { DownloadDropdown } from '@/components/ui/DownloadDropdown';
import { reportService } from '@/services/reportService';
import { downloadTechnicoFonctionnelDocx } from '@/services/updateService';
import { FileDown, FileText, File, Info } from 'lucide-react';

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // Build download option handlers that pick up the current date range values
  const handleDownloadPdf = async () => {
    await reportService.downloadPdf(dateFrom || undefined, dateTo || undefined);
  };

  const handleDownloadDocx = async () => {
    await downloadTechnicoFonctionnelDocx(dateFrom || undefined, dateTo || undefined);
  };

  return (
    <DashboardLayout title="Génération de rapports">
      <div className="mx-auto space-y-6 animate-fade-in">

        {/* Info card */}
        <Card className="p-5 border-l-4 border-l-sabc-orange">
          <div className="flex gap-3">
            <Info size={18} className="text-sabc-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Rapport technico-fonctionnel
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Générez votre rapport complet incluant une page de garde, la liste chronologique
                de vos tâches organisées par domaine, vos compte-rendus et des statistiques
                récapitulatives. Disponible en PDF ou en Word (.docx).
              </p>
            </div>
          </div>
        </Card>

        {/* Options + download */}
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
            Si aucune date n'est spécifiée, le rapport couvrira du début de votre stage jusqu'à
            aujourd'hui.
          </p>

          {/* Download dropdown — replaces the old single button */}
          <div className="flex justify-end">
            <DownloadDropdown
              buttonLabel="Télécharger le rapport"
              buttonClassName="border-2 border-sabc-red text-sabc-red hover:bg-sabc-red hover:text-white inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sabc-red disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] px-5 py-2.5 text-sm shadow-md hover:shadow-lg"
              options={[
                {
                  label: 'Télécharger en PDF',
                  icon: <FileDown size={15} />,
                  onClick: handleDownloadPdf,
                },
                {
                  label: 'Télécharger en Word (.docx)',
                  icon: <File size={15} />,
                  onClick: handleDownloadDocx,
                },
              ]}
            />
          </div>
        </Card>

        {/* What's included */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Le rapport contient :
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {[
              '📄 Page de garde avec vos informations et le logo SABC',
              '📑 Table des matières générée automatiquement',
              '📂 Chapitres par domaine, sections par tâche',
              '📊 Statistiques récapitulatives (total, répartition par catégorie et statut)',
              '📋 Compte-rendus rédigés avec images intégrées',
              '📅 Date de génération du rapport',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            💡 Le format <strong>Word (.docx)</strong> vous permet de modifier le rapport avant de
            le soumettre à votre encadrant.
          </p>
        </Card>

      </div>
    </DashboardLayout>
  );
}