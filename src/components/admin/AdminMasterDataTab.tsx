import React, { useState, useMemo } from 'react';
import {
  Send,
  Users2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ShieldAlert,
  AlertCircle,
  Eye,
  IndianRupee,
  FileText,
  User,
  Building,
  Phone,
  RefreshCw
} from 'lucide-react';
import { Proposal, Lead, User as UserType } from '../../types';
import { LeadDetailPanel } from '../leads/LeadDetailPanel';

interface AdminMasterDataTabProps {
  proposals: Proposal[];
  leads: Lead[];
  agents: UserType[];
  onUpdateLead: (id: string, status: Lead['status']) => Promise<void>;
  onDeleteProposal: (id: string) => Promise<void>;
  onOverrideProposalStatus: (id: string, status: Proposal['approvalStatus']) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  loadError: string | null;
  onLeadUpdated: (lead: Lead) => void;
}

export const AdminMasterDataTab: React.FC<AdminMasterDataTabProps> = ({
  proposals,
  leads,
  agents,
  onUpdateLead,
  onDeleteProposal,
  onOverrideProposalStatus,
  onDeleteLead,
  onRefresh,
  isRefreshing,
  loadError,
  onLeadUpdated
}) => {
  const [subSection, setSubSection] = useState<'proposals' | 'leads'>('proposals');
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

  const visibleLeads = agentFilter === 'all' ? leads : leads.filter((lead) => lead.agentId === agentFilter);
  const visibleProposals = agentFilter === 'all' ? proposals : proposals.filter((proposal) => proposal.agentId === agentFilter);
  const wonClientCount = visibleLeads.filter((lead) => lead.status === 'won').length;
  const quotationsSentCount = visibleProposals.filter((proposal) =>
    proposal.approvalStatus === 'sent_to_client' || proposal.approvalStatus === 'sent'
  ).length;

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.proposalNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientCompany.toLowerCase().includes(q) ||
        p.agentName.toLowerCase().includes(q);
      const matchesAgent = agentFilter === 'all' || p.agentId === agentFilter;
      return matchesSearch && matchesAgent;
    });
  }, [proposals, searchQuery, agentFilter]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        l.businessName.toLowerCase().includes(q) ||
        l.contactPerson.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.agentName.toLowerCase().includes(q);
      const matchesAgent = agentFilter === 'all' || l.agentId === agentFilter;
      return matchesSearch && matchesAgent;
    });
  }, [leads, searchQuery, agentFilter]);

  const [isPurging, setIsPurging] = useState(false);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const editingLead = leads.find((lead) => lead.id === editingLeadId);

  const handleStatusUpdate = async (recordId: string, update: () => Promise<void>) => {
    setUpdatingRecordId(recordId);
    setErrorFeedback(null);
    try {
      await update();
    } catch (error) {
      console.error('Failed to update master CRM record status:', error);
      setErrorFeedback(error instanceof Error ? error.message : 'Could not update the record status. Please try again.');
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const handlePurgeAllMockData = async () => {
    setIsPurging(true);
    try {
      for (const p of proposals) {
        await onDeleteProposal(p.id);
      }
      for (const l of leads) {
        await onDeleteLead(l.id);
      }
      setFeedback('Successfully deleted all mock records from Firestore!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to purge mock data:', err);
      alert('Could not purge records: ' + (err?.message || 'Check permissions'));
    } finally {
      setIsPurging(false);
    }
  };

  const handleDeleteProp = async (prop: Proposal) => {
    try {
      await onDeleteProposal(prop.id);
      setFeedback(`Proposal ${prop.proposalNumber} permanently deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not delete proposal.');
    }
  };

  const handleForceApprove = async (prop: Proposal) => {
    try {
      await onOverrideProposalStatus(prop.id, 'approved');
      setFeedback(`Proposal ${prop.proposalNumber} status overridden to Approved.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not override status.');
    }
  };

  const handleDeleteLd = async (lead: Lead) => {
    try {
      await onDeleteLead(lead.id);
      setFeedback(`Lead ${lead.businessName} permanently deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not delete lead.');
    }
  };

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
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'All leads', value: visibleLeads.length, color: 'text-blue-700' },
          { label: 'Won clients', value: wonClientCount, color: 'text-emerald-700' },
          { label: 'Quotations sent', value: quotationsSentCount, color: 'text-violet-700' },
          { label: 'Quotation requests', value: visibleProposals.length, color: 'text-amber-700' },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{metric.label}</p>
            <p className={`mt-2 text-2xl font-bold ${metric.color}`}>{metric.value}</p>
            <p className="mt-1 text-[10px] text-slate-400">{agentFilter === 'all' ? 'All agents' : agents.find((agent) => agent.id === agentFilter)?.name}</p>
          </div>
        ))}
      </div>
      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          Could not load all CRM records: {loadError} Use Refresh CRM to try again.
        </div>
      )}

      {/* Super Admin Notice */}
      <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 text-red-950 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-red-900">Super Admin Master Data Authority</p>
          <p className="text-red-800 leading-relaxed">
            As Super Admin, you have unrestricted master authority to permanently delete proposals, delete customer leads, or override proposal statuses across all sales agents.
          </p>
        </div>
      </div>

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

      {/* Sub-Tabs: Proposals vs Leads */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSubSection('proposals');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${subSection === 'proposals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Send className="w-4 h-4" />
            <span>Master Proposals ({proposals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubSection('leads');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${subSection === 'leads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Master Leads ({leads.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh CRM
          </button>
          <button
            id="purge-mock-data-btn"
            type="button"
            onClick={handlePurgeAllMockData}
            disabled={isPurging || (proposals.length === 0 && leads.length === 0)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isPurging ? 'Purging All Mock Data...' : 'Purge All Mock Data'}</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              <option value="all">All Sales Agents ({agents.length})</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                subSection === 'proposals'
                  ? 'Search proposals by client, company, or ID...'
                  : 'Search leads by business, phone, or city...'
              }
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-red-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 1. MASTER PROPOSALS TABLE */}
      {subSection === 'proposals' && (
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 pl-6 pr-4">Proposal</th>
                  <th className="py-3.5 px-4">Origin Agent</th>
                  <th className="py-3.5 px-4">Client & Scope</th>
                  <th className="py-3.5 px-4">Value (₹)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pr-6 pl-4 text-right">Super Admin Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <p className="font-mono font-bold text-slate-900 text-xs">{prop.proposalNumber}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{prop.createdAt}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                        {prop.agentName}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{prop.clientName}</p>
                      <p className="text-[11px] text-slate-500">{prop.clientCompany}</p>
                      <span className="text-[10px] text-slate-400">{prop.serviceCategory}</span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">₹{prop.totalINR.toLocaleString('en-IN')}</p>
                      {prop.discountPercentage > 0 && (
                        <p className="text-[10px] text-amber-700 font-bold">{prop.discountPercentage}% Discount</p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <select
                        aria-label={`Update proposal status ${prop.proposalNumber}`}
                        value={prop.approvalStatus}
                        disabled={updatingRecordId === prop.id}
                        onChange={(event) => {
                          const status = event.target.value as Proposal['approvalStatus'];
                          void handleStatusUpdate(prop.id, () => onOverrideProposalStatus(prop.id, status));
                        }}
                        className="max-w-40 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold uppercase text-slate-700"
                      >
                        {['draft', 'pending_support_dispatch', 'pending_manager_approval', 'approved', 'sent_to_client', 'rejected', 'sent', 'accepted', 'declined'].map((status) => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {prop.approvalStatus !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleForceApprove(prop)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200"
                            title="Force approve proposal"
                          >
                            Force Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteProp(prop)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200"
                          title="Permanently Delete Proposal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No proposals match filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. MASTER LEADS TABLE */}
      {subSection === 'leads' && (
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
                  <th className="py-3.5 pr-6 pl-4 text-right">Manage Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 pl-6 pr-4">
                      <p className="font-bold text-slate-900">{lead.businessName}</p>
                      <p className="text-[11px] text-slate-500">{lead.contactPerson}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-800 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200">
                        {lead.agentName}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-mono font-bold text-slate-800">{lead.phone}</p>
                      <p className="text-[10px] text-slate-400">{lead.city}</p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{lead.serviceInterest}</p>
                      <p className="text-[10px] text-slate-400">₹{(lead.estimatedBudgetINR || 0).toLocaleString('en-IN')}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {lead.nextFollowUpDate || 'Not set'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        aria-label={`Update lead status for ${lead.businessName}`}
                        value={lead.status}
                        disabled={updatingRecordId === lead.id}
                        onChange={(event) => {
                          const status = event.target.value as Lead['status'];
                          void handleStatusUpdate(lead.id, () => onUpdateLead(lead.id, status));
                        }}
                        className="max-w-40 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-700"
                      >
                        {['new', 'contacted', 'interested', 'qualified', 'demo_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'].map((status) => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingLeadId(lead.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          title="View and edit lead details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLd(lead)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200"
                          title="Permanently Delete Lead from CRM"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No leads match filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
