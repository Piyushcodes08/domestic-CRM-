import React, { useState, useMemo } from 'react';
import { History, Search, Filter, Download, Shield, RefreshCw, UserCheck, CheckCircle2 } from 'lucide-react';

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  category?: 'Pricing' | 'Proposal' | 'Escalation' | 'Targets' | 'Security';
}

interface AdminAuditTabProps {
  auditLogs: AuditLogEntry[];
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actorFilter, setActorFilter] = useState('All');

  const actors = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((log) => {
      const nameOnly = log.user.split('(')[0].trim();
      set.add(nameOnly);
    });
    return ['All', ...Array.from(set)];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.timestamp.includes(q);
      const matchesActor = actorFilter === 'All' || log.user.includes(actorFilter);
      return matchesSearch && matchesActor;
    });
  }, [auditLogs, searchQuery, actorFilter]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.user.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vahlay-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRoleBadge = (user: string) => {
    if (user.includes('Super Admin')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (user.includes('Sales Manager')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (user.includes('Tech Lead')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by action or user..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Actor filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-blue-500"
            >
              {actors.map((act) => (
                <option key={act} value={act}>
                  {act === 'All' ? 'All Actors' : act}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition shadow-2xs shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Timestamp</th>
                <th className="py-3.5 px-4">Authorized User / Actor</th>
                <th className="py-3.5 pr-6 pl-4">Governance Event Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pl-6 pr-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.user.split('(')[0].trim()}</span>
                      {log.user.includes('(') && (
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold uppercase tracking-wide ${getRoleBadge(
                            log.user
                          )}`}
                        >
                          {log.user.match(/\((.*?)\)/)?.[1] || 'Staff'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 pr-6 pl-4 text-slate-800 leading-relaxed">
                    {log.action}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No audit events match your filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
