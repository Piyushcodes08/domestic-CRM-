import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building,
  Shield,
  Calendar,
  IndianRupee,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  Flame,
  Zap,
  Briefcase,
  Copy,
  Check,
  Pencil,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  MessageSquare
} from 'lucide-react';
import { User as AppUser, Lead, Proposal } from '../../types';
import { INITIAL_BADGES } from '../../data/initialData';

interface AgentDetailModalProps {
  isOpen: boolean;
  agent: AppUser | null;
  leads: Lead[];
  proposals: Proposal[];
  onClose: () => void;
  onEditAgent: (agent: AppUser) => void;
}

type TabKey = 'overview' | 'leads' | 'quotations' | 'academy';

const ROLE_META: Record<string, { label: string; color: string }> = {
  sales_agent: { label: 'Sales Agent', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  sales_manager: { label: 'Sales Manager', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  technical_support: { label: 'Technical Support', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  super_admin: { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' }
};

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  interested: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  demo_scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  proposal_sent: 'bg-orange-50 text-orange-700 border-orange-200',
  negotiation: 'bg-pink-50 text-pink-700 border-pink-200',
  won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200'
};

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  isOpen,
  agent,
  leads,
  proposals,
  onClose,
  onEditAgent
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');

  if (!isOpen || !agent) return null;

  // Filter leads & proposals for this agent
  const agentLeads = leads.filter(
    (l) => l.agentId === agent.id || (l.agentName && l.agentName.toLowerCase() === agent.name.toLowerCase())
  );
  const wonLeads = agentLeads.filter((l) => l.status === 'won');
  const activePipelineLeads = agentLeads.filter((l) => l.status !== 'won' && l.status !== 'lost');

  // Revenue & Target calculations
  const calculatedWonRevenue = wonLeads.reduce(
    (sum, l) => sum + (l.quotationINR || l.estimatedBudgetINR || 0),
    0
  );
  const totalRevenue = calculatedWonRevenue || agent.revenueGenerated || 0;
  const target = agent.assignedTargetRevenueINR || 0;
  const targetAchievement = target > 0 ? Math.min(Math.round((totalRevenue / target) * 100), 100) : 0;
  const totalPipelineValue = agentLeads.reduce(
    (sum, l) => sum + (l.quotationINR || l.estimatedBudgetINR || 0),
    0
  );

  const agentProposals = proposals.filter(
    (p) => p.agentId === agent.id || (p.agentName && p.agentName.toLowerCase() === agent.name.toLowerCase())
  );

  const filteredLeads = agentLeads.filter((l) => {
    if (!leadSearch.trim()) return true;
    const q = leadSearch.toLowerCase();
    return (
      l.businessName.toLowerCase().includes(q) ||
      l.contactPerson.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  });

  const copyText = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Readiness level description
  const readiness = agent.readinessScore || 85;
  const readinessStatus =
    readiness >= 90
      ? { text: 'Audit & Deal Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
      : readiness >= 75
      ? { text: 'Field Operational', color: 'text-blue-700 bg-blue-50 border-blue-200' }
      : { text: 'In Training', color: 'text-amber-700 bg-amber-50 border-amber-200' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {agent.avatar ? (
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white/20 shadow-md">
                    {getInitials(agent.name)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-xs" title="Active" />
              </div>

              {/* Title & Name */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">{agent.name}</h2>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      ROLE_META[agent.role]?.color || 'bg-slate-700 text-slate-200 border-slate-600'
                    }`}
                  >
                    {ROLE_META[agent.role]?.label || agent.role}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${readinessStatus.color}`}>
                    {readinessStatus.text}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-200">{agent.title || 'Sales Agent'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Building className="w-3 h-3 text-slate-400" />
                    {agent.department || 'Domestic Inside Sales'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3 h-3" />
                    Joined {agent.joinedDate || '2026-10-01'}
                  </span>
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditAgent(agent);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monthly Target</p>
              <p className="text-base font-extrabold text-white mt-0.5">₹{target.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Assigned quota</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Won Revenue</p>
              <p className="text-base font-extrabold text-emerald-400 mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{wonLeads.length} deals closed</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Target Achieved</p>
              <p className="text-base font-extrabold text-blue-400 mt-0.5">{targetAchievement}%</p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${targetAchievement}%` }} />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Pipeline</p>
              <p className="text-base font-extrabold text-amber-400 mt-0.5">{activePipelineLeads.length} Leads</p>
              <p className="text-[10px] text-slate-400 mt-0.5">₹{totalPipelineValue.toLocaleString('en-IN')} potential</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50/70 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Profile & Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Assigned Leads ({agentLeads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quotations')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'quotations'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Quotations & Deals ({agentProposals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academy')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'academy'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Academy & Badges</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Profile & Performance */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact & Account Card */}
              <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Account & Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {/* Email */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <a
                        href={`mailto:${agent.email}`}
                        className="font-bold text-slate-900 truncate hover:text-blue-600"
                        title={agent.email}
                      >
                        {agent.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyText(agent.email, 'email')}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                        title="Copy email"
                      >
                        {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <a
                        href={`tel:${agent.phone || '+918347930515'}`}
                        className="font-bold text-slate-900 hover:text-blue-600"
                      >
                        {agent.phone || '+91 83479 30515'}
                      </a>
                      <div className="flex items-center gap-1">
                        <a
                          href={`https://wa.me/${(agent.phone || '918347930515').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                          title="Open WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => copyText(agent.phone || '+91 83479 30515', 'phone')}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="Copy phone"
                        >
                          {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account UID */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Agent UID</p>
                    <p className="font-mono text-xs text-slate-700 font-bold mt-1 truncate" title={agent.id}>
                      {agent.id}
                    </p>
                  </div>

                  {/* Role */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">System Role</p>
                    <p className="font-bold text-slate-900 mt-1 capitalize">{agent.role.replace(/_/g, ' ')}</p>
                  </div>

                  {/* Department */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Department</p>
                    <p className="font-bold text-slate-900 mt-1">{agent.department || 'Domestic Inside Sales'}</p>
                  </div>

                  {/* Onboarded Date */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Joined Date</p>
                    <p className="font-bold text-slate-900 mt-1">{agent.joinedDate || '2026-10-01'}</p>
                  </div>
                </div>
              </div>

              {/* Target & Sales Conversion Deep Dive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Progress Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>Quota & Target Attainment</span>
                    </h4>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {targetAchievement}% Done
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Revenue Achieved:</span>
                      <span className="text-emerald-700 font-bold">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Monthly Assigned Target:</span>
                      <span className="text-slate-800 font-bold">₹{target.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${targetAchievement}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Remaining: ₹{Math.max(0, target - totalRevenue).toLocaleString('en-IN')}</span>
                      <span>Target ₹{target.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Pipeline Health Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Pipeline Conversion Breakdown</span>
                  </h4>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total Leads</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-1">{agentLeads.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <p className="text-[10px] text-amber-700 font-bold uppercase">Active</p>
                      <p className="text-lg font-extrabold text-amber-700 mt-1">{activePipelineLeads.length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[10px] text-emerald-700 font-bold uppercase">Won Deals</p>
                      <p className="text-lg font-extrabold text-emerald-700 mt-1">{wonLeads.length}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Conversion Rate:{' '}
                    <strong className="text-slate-800">
                      {agentLeads.length > 0 ? ((wonLeads.length / agentLeads.length) * 100).toFixed(1) : '0'}%
                    </strong>{' '}
                    • Average Deal Size:{' '}
                    <strong className="text-slate-800">
                      ₹
                      {wonLeads.length > 0
                        ? Math.round(totalRevenue / wonLeads.length).toLocaleString('en-IN')
                        : '0'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Assigned Leads */}
          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    placeholder="Search by client, city, phone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Showing <strong>{filteredLeads.length}</strong> of <strong>{agentLeads.length}</strong> leads
                </p>
              </div>

              {filteredLeads.length > 0 ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Business / Client</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">Est. Budget</th>
                        <th className="py-3 px-4">Next Follow-up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{lead.businessName}</p>
                            <p className="text-[10px] text-slate-400">{lead.city || 'India'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-800">{lead.contactPerson || '—'}</p>
                            <p className="text-[10px] text-slate-400">{lead.phone}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] border capitalize ${
                                STAGE_COLORS[lead.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {lead.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            ₹{(lead.quotationINR || lead.estimatedBudgetINR || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            {lead.nextFollowUpDate || 'Not scheduled'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600 text-xs">No leads assigned</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    {leadSearch
                      ? `No leads matched "${leadSearch}". Clear search to view all.`
                      : 'No customer leads are currently mapped to this agent. You can assign leads from the All Agents Leads tab.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Quotations & Deals */}
          {activeTab === 'quotations' && (
            <div className="space-y-4">
              {agentProposals.length > 0 ? (
                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Quotation #</th>
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Approval Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {agentProposals.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            {prop.proposalNumber || prop.id}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{prop.clientName}</td>
                          <td className="py-3 px-4 text-slate-600">{prop.serviceCategory}</td>
                          <td className="py-3 px-4 font-bold text-emerald-800">
                            ₹{(prop.totalINR || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                              {prop.approvalStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-600 text-xs">No quotation requests</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    This agent hasn't generated any official quotation proposals yet. When they create a proposal, it will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Academy & Enablement */}
          {activeTab === 'academy' && (
            <div className="space-y-6">
              {/* Enablement Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{readiness}/100</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Readiness Score</p>
                  <p className="text-[10px] text-slate-400 mt-1">Evaluated across mock calls & quiz mastery</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                    <Flame className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{agent.streakDays || 7} Days</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Discipline Streak</p>
                  <p className="text-[10px] text-slate-400 mt-1">Consecutive days active in academy & CRM</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{(agent.learningXp || 2500).toLocaleString()} XP</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">Sales XP Earned</p>
                  <p className="text-[10px] text-slate-400 mt-1">Accumulated through completed lessons</p>
                </div>
              </div>

              {/* Badges Earned */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Academy Badges & Honors</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {INITIAL_BADGES.map((badge) => {
                    const isEarned = (agent.badges || []).includes(badge.id) || badge.id === 'badge-fast-starter';
                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-xl border transition flex items-start gap-3 ${
                          isEarned
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-slate-50 border-slate-200/60 opacity-50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            isEarned ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{badge.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{badge.description}</p>
                          <span
                            className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider ${
                              isEarned ? 'text-amber-700' : 'text-slate-400'
                            }`}
                          >
                            {isEarned ? '✓ Earned' : 'Locked'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 font-medium">
            Viewing profile for <strong className="text-slate-800">{agent.name}</strong> ({agent.email})
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditAgent(agent);
              }}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Edit Target / Profile
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
