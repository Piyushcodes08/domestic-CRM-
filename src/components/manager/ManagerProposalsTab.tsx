import React, { useState, useMemo } from 'react';
import {
  Send,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  IndianRupee,
  ShieldCheck,
  FileText,
  User,
  AlertCircle,
  Building
} from 'lucide-react';
import { Proposal, User as UserType } from '../../types';

interface ManagerProposalsTabProps {
  proposals: Proposal[];
  agents: UserType[];
  selectedAgentFilter: string;
  onSelectAgentFilter: (agentId: string) => void;
  onApproveProposal: (proposalId: string, comments?: string) => Promise<void>;
  onRejectProposal: (proposalId: string, comments: string) => Promise<void>;
}

export const ManagerProposalsTab: React.FC<ManagerProposalsTabProps> = ({
  proposals,
  agents,
  selectedAgentFilter,
  onSelectAgentFilter,
  onApproveProposal,
  onRejectProposal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeProposalModal, setActiveProposalModal] = useState<Proposal | null>(null);
  const [rejectingProposal, setRejectingProposal] = useState<Proposal | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.proposalNumber.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientCompany.toLowerCase().includes(q) ||
        p.agentName.toLowerCase().includes(q);

      const matchesAgent = selectedAgentFilter === 'all' || p.agentId === selectedAgentFilter;
      const matchesStatus = statusFilter === 'all' || p.approvalStatus === statusFilter;

      return matchesSearch && matchesAgent && matchesStatus;
    });
  }, [proposals, searchQuery, selectedAgentFilter, statusFilter]);

  const handleApprove = async (p: Proposal) => {
    setProcessingId(p.id);
    try {
      await onApproveProposal(p.id, 'Approved by Sales Admin / Manager with validated profit margins');
      setToastMessage(`Proposal ${p.proposalNumber} for ${p.clientName} approved.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingProposal) return;
    setProcessingId(rejectingProposal.id);
    try {
      await onRejectProposal(rejectingProposal.id, rejectReason.trim() || 'Discount exceeds allowable margin. Re-pitch standard bundle.');
      setToastMessage(`Proposal ${rejectingProposal.proposalNumber} rejected.`);
      setTimeout(() => setToastMessage(null), 3000);
      setRejectingProposal(null);
      setRejectReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: Proposal['approvalStatus']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'pending_manager_approval':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'rejected':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'sent':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'declined':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Filter by Agent + Search + Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <User className="w-3.5 h-3.5 text-blue-600" />
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
              placeholder="Search by client, company, or proposal #..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'pending_manager_approval', 'approved', 'rejected', 'sent'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {st === 'all'
                ? 'All Proposals'
                : st === 'pending_manager_approval'
                  ? 'Pending Approval'
                  : st === 'approved'
                    ? 'Approved'
                    : st === 'rejected'
                      ? 'Rejected'
                      : 'Sent to Client'}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Proposal Info</th>
                <th className="py-3.5 px-4">Submitting Agent</th>
                <th className="py-3.5 px-4">Client & Scope</th>
                <th className="py-3.5 px-4">Commercial Value</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProposals.map((prop) => {
                const isProcessing = processingId === prop.id;
                const isPending = prop.approvalStatus === 'pending_manager_approval';

                return (
                  <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Proposal Number */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 font-mono text-xs">{prop.proposalNumber}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Created: {prop.createdAt}</p>
                        </div>
                      </div>
                    </td>

                    {/* Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-150">
                        <User className="w-3 h-3 text-blue-600" />
                        {prop.agentName}
                      </span>
                    </td>

                    {/* Client & Scope */}
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-slate-900 text-xs">{prop.clientName}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        {prop.clientCompany}
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {prop.serviceCategory}
                      </span>
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{prop.totalINR.toLocaleString('en-IN')}
                        </span>
                        {prop.discountPercentage > 0 && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {prop.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Subtotal: ₹{prop.subtotalINR.toLocaleString('en-IN')}</p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadge(
                          prop.approvalStatus
                        )}`}
                      >
                        {prop.approvalStatus.replace(/_/g, ' ')}
                      </span>
                      {prop.managerComments && (
                        <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                          "{prop.managerComments}"
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveProposalModal(prop)}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                          title="View Scope Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(prop)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-2xs flex items-center gap-1 disabled:opacity-60"
                              title="Approve this proposal"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => setRejectingProposal(prop)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition shadow-2xs flex items-center gap-1 disabled:opacity-60"
                              title="Reject proposal with feedback"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Send className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No proposals found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedAgentFilter !== 'all'
                        ? 'This agent has not created any matching proposals yet.'
                        : 'No proposals match your current search and status filter.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Proposal {rejectingProposal.proposalNumber}</span>
            </div>
            <p className="text-slate-600">
              Provide feedback for <span className="font-semibold text-slate-800">{rejectingProposal.agentName}</span> explaining why this proposal was rejected:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Discount is too high. Minimum price allowed for this scope is ₹22,000."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 outline-none text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingProposal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Scope Details Modal */}
      {activeProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{activeProposalModal.proposalNumber}</h3>
                <p className="text-[11px] text-slate-500">Agent: {activeProposalModal.agentName}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProposalModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Client</span>
                  <p className="font-bold text-slate-800">{activeProposalModal.clientName}</p>
                  <p className="text-slate-500">{activeProposalModal.clientCompany}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Commercial Total</span>
                  <p className="text-sm font-bold text-slate-900">₹{activeProposalModal.totalINR.toLocaleString('en-IN')}</p>
                  {activeProposalModal.discountPercentage > 0 && (
                    <p className="text-amber-700 font-bold text-[10px]">{activeProposalModal.discountPercentage}% Discount</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Scope of Work:</h4>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  {activeProposalModal.scopeOfWork?.map((s, i) => (
                    <li key={i}>{s}</li>
                  )) || <li>Complete service solution setup</li>}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">Deliverables:</h4>
                <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                  {activeProposalModal.deliverables?.map((d, i) => (
                    <li key={i}>{d}</li>
                  )) || <li>Delivery timeline: {activeProposalModal.timeline || '2-3 weeks'}</li>}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveProposalModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
