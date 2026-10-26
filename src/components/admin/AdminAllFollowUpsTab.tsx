import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  User,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Building,
  IndianRupee,
  Copy,
  Check,
  MessageSquare,
  ArrowRight,
  Eye,
  RefreshCw,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { Lead, User as UserType } from '../../types';
import { LeadDetailPanel } from '../leads/LeadDetailPanel';

interface AdminAllFollowUpsTabProps {
  leads: Lead[];
  agents: UserType[];
  onUpdateLeadNotes?: (leadId: string, notes: string) => Promise<void>;
  onUpdateLeadStatus?: (leadId: string, status: Lead['status']) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onLeadUpdated?: (lead: Lead) => void;
}

export const AdminAllFollowUpsTab: React.FC<AdminAllFollowUpsTabProps> = ({
  leads,
  agents,
  onUpdateLeadNotes,
  onUpdateLeadStatus,
  onRefresh,
  isRefreshing,
  onLeadUpdated
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'won'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [instructionLead, setInstructionLead] = useState<Lead | null>(null);
  const [instructionNote, setInstructionNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        lead.businessName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.agentName.toLowerCase().includes(q) ||
        (lead.serviceInterest && lead.serviceInterest.toLowerCase().includes(q));

      const matchesAgent = selectedAgentFilter === 'all' || lead.agentId === selectedAgentFilter;

      const followUpDate = lead.nextFollowUpDate;
      const isToday = followUpDate === todayStr;
      const isOverdue = Boolean(
        followUpDate && followUpDate < todayStr && lead.status !== 'won' && lead.status !== 'lost'
      );
      const isUpcoming = Boolean(followUpDate && followUpDate > todayStr);
      const isWon = lead.status === 'won';

      let matchesUrgency = true;
      if (urgencyFilter === 'today') matchesUrgency = isToday;
      if (urgencyFilter === 'overdue') matchesUrgency = isOverdue;
      if (urgencyFilter === 'upcoming') matchesUrgency = isUpcoming;
      if (urgencyFilter === 'won') matchesUrgency = isWon;

      return matchesSearch && matchesAgent && matchesUrgency;
    });
  }, [leads, searchQuery, selectedAgentFilter, urgencyFilter, todayStr]);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleSaveInstruction = async () => {
    if (!instructionLead || !onUpdateLeadNotes) return;
    setIsSavingNote(true);
    try {
      const timeStamp = new Date().toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const newNotes = instructionLead.notes
        ? `${instructionLead.notes}\n[Admin Instruction - ${timeStamp}]: ${instructionNote.trim()}`
        : `[Admin Instruction - ${timeStamp}]: ${instructionNote.trim()}`;
      await onUpdateLeadNotes(instructionLead.id, newNotes);
      setFeedback(`Instruction logged for lead "${instructionLead.businessName}".`);
      setTimeout(() => setFeedback(null), 3000);
      setInstructionLead(null);
      setInstructionNote('');
    } catch {
      alert('Could not update instruction notes.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const todayCount = leads.filter((l) => l.nextFollowUpDate === todayStr).length;
  const overdueCount = leads.filter(
    (l) => l.nextFollowUpDate && l.nextFollowUpDate < todayStr && l.status !== 'won' && l.status !== 'lost'
  ).length;
  const upcomingCount = leads.filter((l) => l.nextFollowUpDate && l.nextFollowUpDate > todayStr).length;
  const wonCount = leads.filter((l) => l.status === 'won').length;

  const editingLead = leads.find((lead) => lead.id === editingLeadId);

  if (editingLead) {
    return (
      <LeadDetailPanel
        lead={editingLead}
        onBack={() => setEditingLeadId(null)}
        onLeadUpdated={(updated) => {
          onLeadUpdated?.(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Urgency Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setUrgencyFilter('all')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            urgencyFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
              : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">All Pipeline Leads</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{leads.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all {agents.length} sales agents</p>
        </button>

        <button
          type="button"
          onClick={() => setUrgencyFilter('today')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            urgencyFilter === 'today'
              ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
              : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Due Today</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-900">{todayCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Scheduled callbacks today</p>
        </button>

        <button
          type="button"
          onClick={() => setUrgencyFilter('overdue')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            urgencyFilter === 'overdue'
              ? 'bg-red-50/70 border-red-300 shadow-2xs'
              : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">Overdue Follow-ups</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <p className="mt-1 text-2xl font-bold text-red-900">{overdueCount}</p>
          <p className="text-[11px] text-red-700 font-semibold mt-1">Requires supervisor follow-up</p>
        </button>

        <button
          type="button"
          onClick={() => setUrgencyFilter('won')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            urgencyFilter === 'won'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
              : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Won Closures</span>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{wonCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Successfully signed clients</p>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <User className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Sales Agents ({agents.length})</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({leads.filter((l) => l.agentId === agent.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business, contact person, phone, or city..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={() => void onRefresh()}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>

        {/* Urgency Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'today', 'overdue', 'upcoming', 'won'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setUrgencyFilter(filterKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer capitalize ${
                urgencyFilter === filterKey
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filterKey === 'all'
                ? `All (${leads.length})`
                : filterKey === 'today'
                ? `Due Today (${todayCount})`
                : filterKey === 'overdue'
                ? `Overdue (${overdueCount})`
                : filterKey === 'upcoming'
                ? `Upcoming (${upcomingCount})`
                : `Won (${wonCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-ups Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Business & Client</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-4">Phone & City</th>
                <th className="py-3.5 px-4">Service & Budget</th>
                <th className="py-3.5 px-4">Follow-up Schedule</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Admin Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => {
                const isToday = lead.nextFollowUpDate === todayStr;
                const isOverdue = Boolean(
                  lead.nextFollowUpDate &&
                  lead.nextFollowUpDate < todayStr &&
                  lead.status !== 'won' &&
                  lead.status !== 'lost'
                );

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Business Name */}
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{lead.businessName}</p>
                        <p className="text-[11px] text-slate-500">{lead.contactPerson || 'No contact name'}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200">
                        <User className="w-3 h-3 text-purple-600" />
                        {lead.agentName}
                      </span>
                    </td>

                    {/* Phone & City */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-mono font-bold text-slate-800 hover:text-blue-600"
                        >
                          {lead.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copyPhone(lead.phone)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                          title="Copy Phone"
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

                    {/* Service & Budget */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{lead.serviceInterest || 'Custom Solutions'}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                        ₹{(lead.estimatedBudgetINR || 0).toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Follow-up Schedule */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              isOverdue
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : isToday
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {lead.nextFollowUpDate || 'No date scheduled'}
                          </span>
                        </div>
                        {lead.callbackTimeSlot && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            <span>{lead.callbackTimeSlot}</span>
                          </div>
                        )}
                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic max-w-xs mt-1">
                            "{lead.notes.split('\n').pop()}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Admin Guidance / Coaching */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setInstructionLead(lead);
                            setInstructionNote('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition cursor-pointer"
                          title="Add instruction or coaching note"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>+ Instruction</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingLeadId(lead.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          title="View complete lead profile"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No scheduled follow-ups match your filter</p>
                    <p className="text-[11px] text-slate-400 mt-1">Select another urgency filter or sales agent.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Instruction Modal */}
      {instructionLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Admin Direction & Coaching</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  For: {instructionLead.businessName} ({instructionLead.agentName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInstructionLead(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Direct Instruction for Sales Agent:
              </label>
              <textarea
                value={instructionNote}
                onChange={(e) => setInstructionNote(e.target.value)}
                placeholder="E.g., Offer 10% discount if closed by 5 PM. Emphasize WhatsApp automation deliverables."
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50"
              />
              <p className="text-[11px] text-slate-400">
                This note will be logged into the lead's history with an [Admin Instruction] tag for the sales executive to act upon.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setInstructionLead(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInstruction}
                disabled={!instructionNote.trim() || isSavingNote}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 shadow-xs cursor-pointer"
              >
                {isSavingNote ? 'Saving...' : 'Save Instruction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
