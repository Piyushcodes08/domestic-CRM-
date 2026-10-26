import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Building,
  Check,
  MessageSquare
} from 'lucide-react';
import { EscalationTicket } from '../../types';

interface ManagerEscalationsTabProps {
  escalations: EscalationTicket[];
  onUpdateEscalationStatus: (id: string, status: EscalationTicket['status'], resolution?: string) => Promise<void>;
}

export const ManagerEscalationsTab: React.FC<ManagerEscalationsTabProps> = ({
  escalations,
  onUpdateEscalationStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolvingTicket, setResolvingTicket] = useState<EscalationTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const filtered = useMemo(() => {
    return escalations.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        t.ticketNumber.toLowerCase().includes(q) ||
        t.clientOrLeadName.toLowerCase().includes(q) ||
        t.agentName.toLowerCase().includes(q) ||
        t.question.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [escalations, searchQuery, statusFilter]);

  const handleResolve = async () => {
    if (!resolvingTicket) return;
    try {
      await onUpdateEscalationStatus(resolvingTicket.id, 'resolved', resolutionText.trim() || 'Approved by Sales Manager with verified commercial feasibility.');
      setResolvingTicket(null);
      setResolutionText('');
    } catch {
      alert('Could not resolve ticket.');
    }
  };

  const getPriorityBadge = (p: EscalationTicket['priority']) => {
    switch (p) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by number, agent, client, or question..."
            className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'open', 'in_review', 'resolved'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'All Tickets' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Ticket</th>
                <th className="py-3.5 px-4">Submitting Agent</th>
                <th className="py-3.5 px-4">Client & Type</th>
                <th className="py-3.5 px-4">Priority & SLA</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pl-6 pr-4">
                    <p className="font-mono font-bold text-slate-900 text-xs">{ticket.ticketNumber}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ticket.createdAt.slice(0, 10)}</p>
                  </td>

                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                      <User className="w-3 h-3" />
                      {ticket.agentName}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-800 text-xs">{ticket.clientOrLeadName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ticket.question}</p>
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">SLA: {ticket.slaTargetHours}h</p>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ticket.status === 'open'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-4 pr-6 pl-4 text-right">
                    {ticket.status !== 'resolved' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setResolvingTicket(ticket);
                          setResolutionText('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 shadow-2xs"
                      >
                        Resolve Ticket
                      </button>
                    ) : (
                      <span className="text-emerald-700 text-xs font-semibold flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No escalation tickets found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-semibold text-sm text-slate-900">Resolve Ticket {resolvingTicket.ticketNumber}</h3>
            <p className="text-slate-600">Provide resolution instructions for {resolvingTicket.agentName}:</p>
            <textarea
              rows={3}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="e.g. Approved 5% special discount on condition of 100% advance payment."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
