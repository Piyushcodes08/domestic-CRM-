import React, { useState, useMemo } from 'react';
import {
  Trophy,
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
  Sparkles,
  TrendingUp,
  XCircle,
  BadgePercent
} from 'lucide-react';
import { Lead, User as UserType } from '../../types';
import { LeadDetailPanel } from '../leads/LeadDetailPanel';

interface AdminAllDealsTabProps {
  leads: Lead[];
  agents: UserType[];
  onUpdateLead: (id: string, status: Lead['status']) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  loadError: string | null;
  onLeadUpdated: (lead: Lead) => void;
}

export const AdminAllDealsTab: React.FC<AdminAllDealsTabProps> = ({
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
  const [dealFilter, setDealFilter] = useState<'all' | 'won' | 'negotiation' | 'proposal_sent' | 'lost'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Deals are leads that have reached closing stages: won, negotiation, proposal_sent, demo_scheduled, or lost
  const dealsPool = useMemo(() => {
    return leads.filter(
      (l) =>
        l.status === 'won' ||
        l.status === 'negotiation' ||
        l.status === 'proposal_sent' ||
        l.status === 'demo_scheduled' ||
        l.status === 'lost' ||
        (l.estimatedBudgetINR && l.estimatedBudgetINR > 0)
    );
  }, [leads]);

  // Visible deals based on agent filter
  const visibleDeals = agentFilter === 'all' ? dealsPool : dealsPool.filter((d) => d.agentId === agentFilter);

  // Metrics
  const wonDeals = visibleDeals.filter((d) => d.status === 'won');
  const lostDeals = visibleDeals.filter((d) => d.status === 'lost');
  const negotiationDeals = visibleDeals.filter((d) => d.status === 'negotiation');
  const wonRevenueTotal = wonDeals.reduce(
    (sum, d) => sum + (Number(d.quotationINR) || Number(d.estimatedBudgetINR) || 0),
    0
  );
  const totalDecided = wonDeals.length + lostDeals.length;
  const winRate = totalDecided > 0 ? Math.round((wonDeals.length / totalDecided) * 100) : 0;
  const avgDealSize = wonDeals.length > 0 ? Math.round(wonRevenueTotal / wonDeals.length) : 0;

  // Filtered Deals
  const filteredDeals = useMemo(() => {
    return dealsPool.filter((deal) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        deal.businessName.toLowerCase().includes(q) ||
        deal.contactPerson.toLowerCase().includes(q) ||
        deal.phone.includes(q) ||
        deal.city.toLowerCase().includes(q) ||
        deal.agentName.toLowerCase().includes(q) ||
        (deal.serviceInterest && deal.serviceInterest.toLowerCase().includes(q));

      const matchesAgent = agentFilter === 'all' || deal.agentId === agentFilter;

      let matchesDealFilter = true;
      if (dealFilter === 'won') matchesDealFilter = deal.status === 'won';
      else if (dealFilter === 'negotiation') matchesDealFilter = deal.status === 'negotiation';
      else if (dealFilter === 'proposal_sent') matchesDealFilter = deal.status === 'proposal_sent';
      else if (dealFilter === 'lost') matchesDealFilter = deal.status === 'lost';

      return matchesSearch && matchesAgent && matchesDealFilter;
    });
  }, [dealsPool, searchQuery, agentFilter, dealFilter]);

  const handleStatusUpdate = async (dealId: string, status: Lead['status']) => {
    setUpdatingRecordId(dealId);
    setErrorFeedback(null);
    try {
      await onUpdateLead(dealId, status);
      setFeedback(`Deal stage updated to "${status.replace(/_/g, ' ').toUpperCase()}"`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error('Failed to update deal status:', error);
      setErrorFeedback(error instanceof Error ? error.message : 'Could not update deal stage.');
    } finally {
      setUpdatingRecordId(null);
    }
  };

  const handleQuickMarkWon = async (deal: Lead) => {
    await handleStatusUpdate(deal.id, 'won');
  };

  const handleDeleteDealClick = async (deal: Lead) => {
    if (!window.confirm(`Permanently delete deal record "${deal.businessName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await onDeleteLead(deal.id);
      setFeedback(`Deal "${deal.businessName}" permanently removed.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      alert('Could not delete deal.');
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
        onLeadUpdated={(updated) => {
          onLeadUpdated?.(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {/* Card 1: Total Won Deals */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Won Client Deals</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Trophy className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{wonDeals.length}</p>
          <p className="mt-1 text-[10px] text-slate-400">
            {agentFilter === 'all' ? `Across all ${agents.length} sales agents` : agents.find((a) => a.id === agentFilter)?.name}
          </p>
        </div>

        {/* Card 2: Won Revenue Closed */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Closed Deal Revenue</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">₹{wonRevenueTotal.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[10px] text-slate-400">Total verified contract revenue</p>
        </div>

        {/* Card 3: Deals in Negotiation */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Deals in Negotiation</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <BadgePercent className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{negotiationDeals.length}</p>
          <p className="mt-1 text-[10px] text-slate-400">Pending final discount / closing</p>
        </div>

        {/* Card 4: Win Rate & Avg Size */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Win Rate / Avg Size</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-700">{winRate}%</p>
          <p className="mt-1 text-[10px] text-slate-400">
            Avg deal size: ₹{avgDealSize.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
          Could not load deals: {loadError}
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
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
                  {a.name} ({dealsPool.filter((d) => d.agentId === a.id).length} deals)
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
              placeholder="Search deals by business, client, phone, city, or agent..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            title="Refresh deals list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Deal Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { key: 'all', label: `All Deals (${dealsPool.length})` },
              { key: 'won', label: `Won Closures (${wonDeals.length})` },
              { key: 'negotiation', label: `Negotiation (${negotiationDeals.length})` },
              { key: 'proposal_sent', label: 'Proposal Sent' },
              { key: 'lost', label: `Lost (${lostDeals.length})` }
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setDealFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                dealFilter === item.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* All Agents Deals Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Business & Client</th>
                <th className="py-3.5 px-4">Closing Agent</th>
                <th className="py-3.5 px-4">Phone & City</th>
                <th className="py-3.5 px-4">Deal Value (₹)</th>
                <th className="py-3.5 px-4">Service Package</th>
                <th className="py-3.5 px-4">Deal Stage</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Deal Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDeals.map((deal) => {
                const dealValue = Number(deal.quotationINR) || Number(deal.estimatedBudgetINR) || 0;
                const isWon = deal.status === 'won';
                const isLost = deal.status === 'lost';
                const isNegotiation = deal.status === 'negotiation';

                return (
                  <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Business & Client */}
                    <td className="py-4 pl-6 pr-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 text-xs">{deal.businessName}</p>
                          {isWon && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Trophy className="w-2.5 h-2.5" /> Won
                            </span>
                          )}
                          {isLost && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-2.5 h-2.5" /> Lost
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{deal.contactPerson || 'N/A'}</p>
                        {deal.wonAt && (
                          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Closed: {new Date(deal.wonAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Closing Agent */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200">
                        <User className="w-3 h-3 text-purple-500" />
                        {deal.agentName}
                      </span>
                    </td>

                    {/* Phone & City */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">{deal.phone}</span>
                        <button
                          type="button"
                          onClick={() => copyPhone(deal.phone)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedPhone === deal.phone ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{deal.city || 'Pan India'}</p>
                    </td>

                    {/* Deal Value */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 text-sm">
                        ₹{dealValue.toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {deal.quotationINR ? 'Contract Quoted' : 'Estimated Budget'}
                      </span>
                    </td>

                    {/* Service Package */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-slate-800">{deal.serviceInterest || 'Custom Digital'}</p>
                      <span className="text-[10px] text-slate-400">{deal.industry || 'Domestic SME'}</span>
                    </td>

                    {/* Deal Stage */}
                    <td className="py-4 px-4">
                      <select
                        aria-label={`Update deal stage for ${deal.businessName}`}
                        value={deal.status}
                        disabled={updatingRecordId === deal.id}
                        onChange={(event) => {
                          const status = event.target.value as Lead['status'];
                          void handleStatusUpdate(deal.id, status);
                        }}
                        className={`max-w-36 rounded-lg border px-2 py-1.5 text-[10px] font-bold capitalize outline-none cursor-pointer ${
                          isWon
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isLost
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : isNegotiation
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
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
                        {!isWon && (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkWon(deal)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200 transition cursor-pointer"
                            title="Mark as Won Closure"
                          >
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            <span>Mark Won</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingLeadId(deal.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 cursor-pointer"
                          title="View complete deal & client details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDealClick(deal)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 cursor-pointer"
                          title="Permanently Delete Deal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredDeals.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No deals match your filter criteria</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try selecting another deal stage or sales agent.</p>
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
