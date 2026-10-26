import React, { useState, useMemo } from 'react';
import {
  Send,
  User,
  Search,
  Filter,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  IndianRupee,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Proposal, User as UserType } from '../../types';
import { QuotationPreviewModal, getQuotationWhatsAppLink } from '../quotations/QuotationPreviewModal';
import { WhatsAppIcon } from '../../pages/TechnicalSupport';

interface AdminAllQuotationsTabProps {
  proposals: Proposal[];
  agents: UserType[];
  onDeleteProposal: (id: string) => Promise<void>;
  onOverrideProposalStatus: (id: string, status: Proposal['approvalStatus']) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  loadError: string | null;
}

export const AdminAllQuotationsTab: React.FC<AdminAllQuotationsTabProps> = ({
  proposals,
  agents,
  onDeleteProposal,
  onOverrideProposalStatus,
  onRefresh,
  isRefreshing,
  loadError
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [activePreviewProposal, setActivePreviewProposal] = useState<Proposal | null>(null);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  // Visible proposals based on agent filter
  const visibleProposals = agentFilter === 'all' ? proposals : proposals.filter((p) => p.agentId === agentFilter);
  const pendingApprovalsCount = visibleProposals.filter(
    (p) => p.approvalStatus === 'pending_manager_approval' || p.approvalStatus === 'pending_support_dispatch'
  ).length;
  const sentCount = visibleProposals.filter(
    (p) => p.approvalStatus === 'sent_to_client' || p.approvalStatus === 'sent'
  ).length;
  const totalValueINR = visibleProposals.reduce((sum, p) => sum + (Number(p.totalINR) || 0), 0);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.proposalNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientCompany.toLowerCase().includes(q) ||
        p.agentName.toLowerCase().includes(q) ||
        (p.serviceCategory && p.serviceCategory.toLowerCase().includes(q));

      const matchesAgent = agentFilter === 'all' || p.agentId === agentFilter;
      const matchesStatus = statusFilter === 'all' || p.approvalStatus === statusFilter;

      return matchesSearch && matchesAgent && matchesStatus;
    });
  }, [proposals, searchQuery, agentFilter, statusFilter]);

  const handleStatusOverride = async (proposalId: string, status: Proposal['approvalStatus']) => {
    setUpdatingRecordId(proposalId);
    setErrorFeedback(null);
    try {
      await onOverrideProposalStatus(proposalId, status);
      setFeedback(`Proposal status updated to "${status.replace(/_/g, ' ')}"`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to override proposal status:', error);
      setErrorFeedback(error instanceof Error ? error.message : 'Could not update status.');
    } finally {
      setUpdatingRecordId(null);
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

  const handleDeletePropClick = async (prop: Proposal) => {
    if (!window.confirm(`Permanently delete proposal "${prop.proposalNumber}" for client "${prop.clientName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await onDeleteProposal(prop.id);
      setFeedback(`Proposal ${prop.proposalNumber} permanently deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not delete proposal.');
    }
  };

  const handlePurgeMockProposals = async () => {
    if (!window.confirm('Are you sure you want to delete all proposals in the database? This cannot be undone.')) {
      return;
    }
    setIsPurging(true);
    try {
      for (const p of proposals) {
        await onDeleteProposal(p.id);
      }
      setFeedback('Successfully purged all proposals from Firestore.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to purge proposals:', err);
      alert('Could not purge proposals: ' + (err?.message || 'Check permissions'));
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Quotation Requests</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">{visibleProposals.length}</p>
          <p className="mt-1 text-[10px] text-slate-400">
            {agentFilter === 'all' ? `Generated by ${agents.length} sales agents` : agents.find((a) => a.id === agentFilter)?.name}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{pendingApprovalsCount}</p>
          <p className="mt-1 text-[10px] text-slate-400">Awaiting manager/support review</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dispatched Quotations</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{sentCount}</p>
          <p className="mt-1 text-[10px] text-slate-400">Delivered to client on WhatsApp</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Quoted Value</span>
            <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-700">₹{totalValueINR.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-slate-400">Commercial contract value</p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          Could not load proposals: {loadError}
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
                  {a.name} ({proposals.filter((p) => p.agentId === a.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Approval Statuses</option>
              {[
                'pending_support_dispatch',
                'pending_manager_approval',
                'approved',
                'sent_to_client',
                'accepted',
                'rejected',
                'draft',
                'declined'
              ].map((s) => (
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
              placeholder="Search by proposal #, client, company, or agent..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            title="Refresh quotations list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-slate-500 self-end md:self-center">
          Showing {filteredProposals.length} of {proposals.length} requests
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Proposal</th>
                <th className="py-3.5 px-4">Origin Agent</th>
                <th className="py-3.5 px-4">Client & Scope</th>
                <th className="py-3.5 px-4">Value (₹)</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Super Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProposals.map((prop) => {
                const whatsappUrl = getQuotationWhatsAppLink(prop);

                return (
                  <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Proposal & Created Date */}
                    <td className="py-4 pl-6 pr-4">
                      <button
                        type="button"
                        onClick={() => setActivePreviewProposal(prop)}
                        className="text-left group cursor-pointer"
                      >
                        <p className="font-mono font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                          {prop.proposalNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{prop.createdAt}</p>
                      </button>
                    </td>

                    {/* Origin Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                        <User className="w-3 h-3 text-blue-500" />
                        {prop.agentName}
                      </span>
                    </td>

                    {/* Client & Scope */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{prop.clientName}</p>
                      <p className="text-[11px] text-slate-500">{prop.clientCompany}</p>
                      <span className="text-[10px] text-slate-400">{prop.serviceCategory}</span>
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">₹{prop.totalINR.toLocaleString('en-IN')}</p>
                      {prop.discountPercentage > 0 && (
                        <span className="inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {prop.discountPercentage}% Discount
                        </span>
                      )}
                    </td>

                    {/* Approval Status */}
                    <td className="py-4 px-4">
                      <select
                        aria-label={`Update proposal status ${prop.proposalNumber}`}
                        value={prop.approvalStatus}
                        disabled={updatingRecordId === prop.id}
                        onChange={(event) => {
                          const status = event.target.value as Proposal['approvalStatus'];
                          void handleStatusOverride(prop.id, status);
                        }}
                        className={`max-w-44 rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase outline-none cursor-pointer ${
                          prop.approvalStatus === 'approved' || prop.approvalStatus === 'accepted'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : prop.approvalStatus === 'sent_to_client' || prop.approvalStatus === 'sent'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : prop.approvalStatus === 'rejected' || prop.approvalStatus === 'declined'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        {[
                          'draft',
                          'pending_support_dispatch',
                          'pending_manager_approval',
                          'approved',
                          'sent_to_client',
                          'rejected',
                          'sent',
                          'accepted',
                          'declined'
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
                          onClick={() => setActivePreviewProposal(prop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          title="Preview full proposal PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition cursor-pointer"
                          title="Share quote to client WhatsApp"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>

                        {prop.approvalStatus !== 'approved' && prop.approvalStatus !== 'sent_to_client' && (
                          <button
                            type="button"
                            onClick={() => handleForceApprove(prop)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition cursor-pointer"
                            title="Force approve proposal"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeletePropClick(prop)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 cursor-pointer"
                          title="Permanently Delete Proposal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <Send className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No quotation requests found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try selecting a different sales agent or status filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Quotation PDF Preview Modal */}
      {activePreviewProposal && (
        <QuotationPreviewModal
          proposal={activePreviewProposal}
          onClose={() => setActivePreviewProposal(null)}
          onDispatch={(proposalId) => {
            void handleStatusOverride(proposalId, 'sent_to_client');
            setActivePreviewProposal(null);
          }}
          isSupportView={true}
        />
      )}
    </div>
  );
};
