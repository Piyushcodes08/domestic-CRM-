import React, { useState, useMemo } from 'react';
import {
  Users2,
  User,
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Eye,
  RefreshCw,
  AlertCircle,
  Building,
  Phone,
  IndianRupee,
  Copy,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Lead, User as UserType } from '../../types';
import { LeadDetailPanel } from '../leads/LeadDetailPanel';

interface AdminAllLeadsTabProps {
  leads: Lead[];
  agents: UserType[];
  onUpdateLead: (id: string, status: Lead['status']) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  loadError: string | null;
  onLeadUpdated: (lead: Lead) => void;
}

export const AdminAllLeadsTab: React.FC<AdminAllLeadsTabProps> = ({
  leads,
  agents,
  onUpdateLead,
  onDeleteLead,
  onRefresh,
  isRefreshing,
  loadError,
  onLeadUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Visible leads based on agent filter
  const visibleLeads = agentFilter === 'all' ? leads : leads.filter((lead) => lead.agentId === agentFilter);
  const wonCount = visibleLeads.filter((l) => l.status === 'won').length;
  const inPipelineCount = visibleLeads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;
  const totalBudgetValue = visibleLeads.reduce((sum, l) => sum + (Number(l.estimatedBudgetINR) || 0), 0);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.agentName.toLowerCase().includes(q) ||
        (l.serviceInterest && l.serviceInterest.toLowerCase().includes(q));

      const matchesAgent = agentFilter === 'all' || l.agentId === agentFilter;
      const matchesStage = stageFilter === 'all' || l.status === stageFilter;

      return matchesSearch && matchesAgent && matchesStage;
    });
  }, [leads, searchQuery, agentFilter, stageFilter]);

  const handleStatusUpdate = async (leadId: string, status: Lead['status']) => {
    setUpdatingRecordId(leadId);
    setErrorFeedback(null);
    try {
      await onUpdateLead(leadId, status);
      setFeedback(`Lead stage updated to "${status.replace(/_/g, ' ')}"`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to update lead status:', error);
      setErrorFeedback(error instanceof Error ? error.message : 'Could not update lead status.');
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const handleDeleteLeadClick = async (lead: Lead) => {
    if (!window.confirm(`Permanently delete lead "${lead.businessName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await onDeleteLead(lead.id);
      setFeedback(`Lead "${lead.businessName}" permanently deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not delete lead. Check permissions.');
    }
  };

  const handlePurgeMockLeads = async () => {
    if (!window.confirm('Are you sure you want to delete all leads in the database? This cannot be undone.')) {
      return;
    }
    setIsPurging(true);
    try {
      for (const l of leads) {
        await onDeleteLead(l.id);
      }
      setFeedback('Successfully purged all leads from Firestore.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to purge leads:', err);
      alert('Could not purge leads: ' + (err?.message || 'Check permissions'));
    } finally {
      setIsPurging(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const editingLead = leads.find((lead) => lead.id === editingLeadId);

  if (editingLead) {
    return (
      <LeadDetailPanel
        lead={editingLead}
        onBack={() => setEditingLeadId(null)}
        onLeadUpdated={onLeadUpdated}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">All Agents Leads</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Users2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">{visibleLeads.length}</p>
          <p className="mt-1 text-[10px] text-slate-400">
            {agentFilter === 'all' ? `Across all ${agents.length} sales agents` : agents.find((a) => a.id === agentFilter)?.name}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Won Clients</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{wonCount}</p>
          <p className="mt-1 text-[10px] text-slate-400">Successfully closed business</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Pipeline</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{inPipelineCount}</p>
          <p className="mt-1 text-[10px] text-slate-400">In qualification & proposal</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Budget</span>
            <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-700">₹{totalBudgetValue.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-slate-400">Cumulative potential revenue</p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          Could not load leads: {loadError}
        </div>
      )}

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}
      {errorFeedback && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          {errorFeedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Sales Agents ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({leads.filter((l) => l.agentId === a.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Pipeline Stages</option>
              {['new', 'contacted', 'interested', 'qualified', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'].map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by business, contact, phone, city, or agent..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            title="Refresh leads list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 self-end md:self-center">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      {/* All Agents Leads Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Business & Client</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-4">Phone & City</th>
                <th className="py-3.5 px-4">Budget & Interest</th>
                <th className="py-3.5 px-4">Next Callback</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => {
                const isOverdue = Boolean(
                  lead.nextFollowUpDate &&
                  lead.nextFollowUpDate < todayStr &&
                  lead.status !== 'won' &&
                  lead.status !== 'lost'
                );
                const isToday = lead.nextFollowUpDate === todayStr;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Business & Client */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{lead.businessName}</p>
                          <p className="text-[11px] text-slate-500">{lead.contactPerson || 'No contact name'}</p>
                          {lead.isHighPriority && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              🔥 Urgent Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200">
                        <User className="w-3 h-3 text-purple-500" />
                        {lead.agentName}
                      </span>
                    </td>

                    {/* Phone & City */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{lead.phone}</span>
                        <button
                          type="button"
                          onClick={() => copyPhone(lead.phone)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedPhone === lead.phone ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{lead.city || 'Pan India'}</p>
                    </td>

                    {/* Budget & Interest */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{lead.serviceInterest || 'General Inbound'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        ₹{(lead.estimatedBudgetINR || 0).toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Next Callback */}
                    <td className="py-4 px-4">
                      {lead.nextFollowUpDate ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isToday
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          {lead.nextFollowUpDate}
                          {isOverdue && ' (Overdue)'}
                          {isToday && ' (Today)'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not scheduled</span>
                      )}
                    </td>

                    {/* Pipeline Stage */}
                    <td className="py-4 px-4">
                      <select
                        aria-label={`Update lead status for ${lead.businessName}`}
                        value={lead.status}
                        disabled={updatingRecordId === lead.id}
                        onChange={(event) => {
                          const status = event.target.value as Lead['status'];
                          void handleStatusUpdate(lead.id, status);
                        }}
                        className={`max-w-36 rounded-lg border px-2 py-1.5 text-[10px] font-bold capitalize outline-none cursor-pointer ${
                          lead.status === 'won'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : lead.status === 'lost'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {[
                          'new',
                          'contacted',
                          'interested',
                          'qualified',
                          'demo_scheduled',
                          'proposal_sent',
                          'negotiation',
                          'won',
                          'lost'
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Admin Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingLeadId(lead.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 cursor-pointer"
                          title="View and edit lead details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteLeadClick(lead)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 cursor-pointer"
                          title="Permanently Delete Lead from CRM"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No customer leads found matching your filters</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your agent, stage, or search query.</p>
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
