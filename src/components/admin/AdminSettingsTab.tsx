import React, { useState } from 'react';
import {
  Download,
  Database
} from 'lucide-react';
import { ServiceItem, ObjectionItem } from '../../types';

interface AdminSettingsTabProps {
  aiModel?: string;
  currency: string;
  services: ServiceItem[];
  objections?: ObjectionItem[];
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  aiModel = 'gemini-3.8-flash',
  currency,
  services,
  objections = []
}) => {
  const [defaultLang] = useState('Hinglish');

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      exportType: 'Vahlay Digital CRM System Configuration',
      services,
      objections,
      systemSettings: {
        aiModel,
        currency,
        defaultLang
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vahlay-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Section 3: Data Backup & Export */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Database & Catalog Backup</h3>
              <p className="text-xs text-slate-500">
                Download a complete JSON snapshot of all 13 services, pricing packages, objection playbooks, and configs.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition shadow-2xs shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Catalog Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
