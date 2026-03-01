'use client';

import { useTabContext } from '@/contexts/TabContext';
import { FileText, X, CheckCircle2 } from 'lucide-react';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabContext();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer
              border-t-2 transition-all duration-150 min-w-0 flex-shrink-0 max-w-[200px]
              ${isActive
                ? 'bg-white dark:bg-gray-950 text-sabc-red border-t-sabc-red border-x border-x-gray-100 dark:border-x-gray-800 -mb-px'
                : 'text-gray-500 dark:text-gray-400 border-t-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <FileText size={13} className="flex-shrink-0 opacity-70" />
            <span className="truncate flex-1 min-w-0">{tab.taskTitle}</span>
            {tab.isCommented && (
              <CheckCircle2 size={13} className="flex-shrink-0 text-green-500" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              className={`
                flex-shrink-0 p-0.5 rounded transition-colors
                ${isActive
                  ? 'text-sabc-red/60 hover:text-sabc-red hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              aria-label="Fermer l'onglet"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}