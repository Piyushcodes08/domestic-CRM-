import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  User,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building,
  IndianRupee,
  Copy,
  Check,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Lead, User as UserType } from '../../types';

interface ManagerFollowUpsTabProps {
  leads: Lead[];
  agents: UserType[];
  selectedAgentFilter: string;
  onSelectAgentFilter: (agentId: string) => void;
  onUpdateLeadNotes?: (leadId: string, notes: string) => Promise<void>;
}

export const ManagerFollowUpsTab: React.FC<ManagerFollowUpsTabProps> = ({
  leads,
  agents,
  selectedAgentFilter,
  onSelectAgentFilter,
  onUpdateLeadNotes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming' | 'won'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [coachingLead, setCoachingLead] = useState<Lead | null>(null);
  const [coachingNote, setCoachingNote] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        lead.businessName.toLowerCase().includes(q) ||
        lead.contactPerson.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.agentName.toLowerCase().includes(q);

      const matchesAgent = selectedAgentFilter === 'all' || lead.agentId === selectedAgentFilter;

      const followUpDate = lead.nextFollowUpDate;
      const isToday = followUpDate === todayStr;
      const isOverdue = Boolean(followUpDate && followUpDate < todayStr && lead.status !== 'won' && lead.status !== 'lost');
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

  const handleSaveCoachingNote = async () => {
    if (!coachingLead || !onUpdateLeadNotes) return;
    try {
      const newNotes = coachingLead.notes
        ? `${coachingLead.notes}\n[Manager Instruction]: ${coachingNote}`
        : `[Manager Instruction]: ${coachingNote}`;
      await onUpdateLeadNotes(coachingLead.id, newNotes);
      setCoachingLead(null);
      setCoachingNote('');
    } catch {
      alert('Could not update note.');
    }
  };

  const todayCount = leads.filter((l) => l.nextFollowUpDate === todayStr).length;
  const overdueCount = leads.filter((l) => l.nextFollowUpDate && l.nextFollowUpDate < todayStr && l.status !== 'won' && l.status !== 'lost').length;

  return (
    <div className="space-y-6">
      {/* Overview Urgency Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <button
          type="button"
          onClick={() => setUrgencyFilter('all')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${urgencyFilter === 'all' ? 'bg-blue-50/70 border-blue-200 shadow-2xs' : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Active Pipeline</span>
          <p className="mt-1 text-2xl font-bold text-slate-900">{leads.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across all {agents.length} agents</p>
        </button>

        <button
          type="button"
          onClick={() => setUrgencyFilter('today')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${urgencyFilter === 'today' ? 'bg-amber-50/70 border-amber-200 shadow-2xs' : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Due Today</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-900">{todayCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">Priority callback appointments</p>
        </button>

        <button
          type="button"
          onClick={() => setUrgencyFilter('overdue')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${urgencyFilter === 'overdue' ? 'bg-red-50/70 border-red-200 shadow-2xs' : 'bg-white border-slate-200/90 shadow-2xs'
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
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${urgencyFilter === 'won' ? 'bg-emerald-50/70 border-emerald-200 shadow-2xs' : 'bg-white border-slate-200/90 shadow-2xs'
            }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Won Closures</span>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{leads.filter((l) => l.status === 'won').length}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">Successfully signed clients</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <User className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => onSelectAgentFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none"
            >
              <option value="all">All Sales Agents ({agents.length})</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
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
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Urgency Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'today', 'overdue', 'upcoming', 'won'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => setUrgencyFilter(filterKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer capitalize ${urgencyFilter === filterKey
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {filterKey === 'all'
                ? 'All Follow-ups'
                : filterKey === 'today'
                  ? 'Due Today'
                  : filterKey === 'overdue'
                    ? 'Overdue'
                    : filterKey === 'upcoming'
                      ? 'Upcoming'
                      : 'Won Closures'}
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
                <th className="py-3.5 pr-6 pl-4 text-right">Manager Coaching</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => {
                const isToday = lead.nextFollowUpDate === todayStr;
                const isOverdue = Boolean(
                  lead.nextFollowUpDate && lead.nextFollowUpDate < todayStr && lead.status !== 'won' && lead.status !== 'lost'
                );

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Business Name */}
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{lead.businessName}</p>
                        <p className="text-[11px] text-slate-500">{lead.contactPerson}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs border border-purple-150">
                        <User className="w-3 h-3 text-purple-600" />
                        {lead.agentName}
                      </span>
                    </td>

                    {/* Phone & City */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 font-mono text-[11px]">{lead.phone}</span>
                        <button
                          type="button"
                          onClick={() => copyPhone(lead.phone)}
                          className="hover:text-blue-600 p-0.5 text-slate-400"
                          title="Copy Phone"
                        >
                          {copiedPhone === lead.phone ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {lead.city} • {lead.leadSource}
                      </p>
                    </td>

                    {/* Service & Budget */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800 text-xs">{lead.serviceInterest}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Budget: ₹{(lead.estimatedBudgetINR || 0).toLocaleString('en-IN')}
                      </p>
                    </td>

                    {/* Follow-up Schedule */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${isOverdue
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isToday
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                                : 'text-slate-700'
                            }`}
                        >
                          {lead.nextFollowUpDate || 'No date set'}
                        </span>
                      </div>
                      {isToday && (
                        <p className="text-[10px] font-bold text-amber-700 mt-1 uppercase tracking-wider">
                          Due Today!
                        </p>
                      )}
                      {isOverdue && (
                        <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-wider">
                          Overdue!
                        </p>
                      )}
                      {lead.notes && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic max-w-xs">
                          "{lead.notes}"
                        </p>
                      )}
                    </td>

                    {/* Coaching Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCoachingLead(lead);
                          setCoachingNote('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-bold text-xs transition"
                        title="Add Manager Guidance Note"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Guidance</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No follow-ups found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No customer leads match your current agent or urgency filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coaching Modal */}
      {coachingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
              <span>Manager Coaching Note for {coachingLead.agentName}</span>
            </div>
            <p className="text-slate-600">
              Add a coaching directive for the lead <span className="font-bold text-slate-900">{coachingLead.businessName}</span> ({coachingLead.contactPerson}):
            </p>
            <textarea
              rows={3}
              value={coachingNote}
              onChange={(e) => setCoachingNote(e.target.value)}
              placeholder="e.g. Call this client at 4 PM sharp. Pitch the Dynamic CMS + WhatsApp bundle at ₹28k."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-purple-500 outline-none text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCoachingLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCoachingNote}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-extrabold hover:bg-purple-700 shadow-sm"
              >
                Attach Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
