/**
 * LeadPipelineTable
 * Renders the KPI strip, search/filter bar, and the main leads table.
 * Handles two table modes: the general pipeline table and the follow-ups table.
 * Emits callbacks to the parent (LeadManagement) for actions that need state changes.
 */

import React, { useState } from 'react';
import { Lead } from '../../types';
import {
  Users2, Plus, Search, Phone, Calendar, Clock, CheckCircle2, Building2,
  Flame, FileText, BadgePercent, Laptop, ChevronRight, Sparkles, Copy, Check,
  TrendingUp, RotateCcw,
} from 'lucide-react';
import { CUSTOMER_REQUIREMENTS, CALLBACK_TIME_SLOTS } from './leadConstants';

// ── Metric strip data ───────────────────────────────────────────────────────

interface Metrics {
  totalCount: number;
  detailsNeededCount: number;
  demoReqCount: number;
  negotiationCount: number;
  callbacksCount: number;
  dueTodayCount: number;
  wonCount: number;
  quotationNeededCount: number;
  totalPipelineValue: number;
}

interface FollowUpCounts {
  total: number;
  activeTotal: number;
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
}

interface LeadPipelineTableProps {
  view: 'leads' | 'pipeline' | 'follow-ups' | 'deals' | 'clients' | 'add-lead';
  filteredLeads: Lead[];
  metrics: Metrics;
  followUpCounts: FollowUpCounts;

  // Filter state (lifted to parent)
  search: string;
  setSearch: (v: string) => void;
  selectedStageFilter: string;
  setSelectedStageFilter: (v: string) => void;
  selectedReqFilter: string;
  setSelectedReqFilter: (v: string) => void;
  showOnlyActionNeeded: boolean;
  setShowOnlyActionNeeded: (v: boolean) => void;
  followUpFilter: 'all' | 'due_today' | 'overdue' | 'upcoming' | 'completed';
  setFollowUpFilter: (v: 'all' | 'due_today' | 'overdue' | 'upcoming' | 'completed') => void;

  updatingLeadId: string | null;

  // Row actions
  onViewLead: (lead: Lead) => void;
  onOpenAddLead: () => void;
  onQuickDone: (lead: Lead, e: React.MouseEvent) => void;
  onQuickReschedule: (lead: Lead, daysAhead: number, slot?: string, date?: string, e?: React.MouseEvent) => void;

  onNavigate?: (path: string) => void;

  // Date helpers (passed from parent to avoid re-implementation)
  isFollowUpOverdue: (dateStr?: string, status?: string) => boolean;
  isFollowUpToday: (dateStr?: string) => boolean;
  formatCallbackDate: (dateStr?: string) => { label: string; full: string };
}

export const LeadPipelineTable: React.FC<LeadPipelineTableProps> = ({
  view,
  filteredLeads,
  metrics,
  followUpCounts,
  search, setSearch,
  selectedStageFilter, setSelectedStageFilter,
  selectedReqFilter, setSelectedReqFilter,
  showOnlyActionNeeded, setShowOnlyActionNeeded,
  followUpFilter, setFollowUpFilter,
  updatingLeadId,
  onViewLead,
  onOpenAddLead,
  onQuickDone,
  onQuickReschedule,
  onNavigate,
  isFollowUpOverdue,
  isFollowUpToday,
  formatCallbackDate,
}) => {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [openRescheduleLeadId, setOpenRescheduleLeadId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('02:00 PM - 03:00 PM');

  const handleCopyPhone = (phoneNumber: string, leadId: string) => {
    if (!phoneNumber) return;
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhoneId(leadId);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const pageTitle =
    view === 'follow-ups' ? 'Scheduled Follow-ups & Callbacks'
    : view === 'deals'    ? 'Closed Deals & Revenue Performance'
    : view === 'clients'  ? 'Active Clients Directory'
    :                       'Sales Calling Table & Pipeline';

  const pageSubtitle =
    view === 'follow-ups' ? 'Timely callbacks convert 3x more prospects. Stay on top of your schedule.'
    : view === 'deals'    ? 'Track confirmed client acquisitions, commercial contracts, and closed revenue.'
    : view === 'clients'  ? 'Comprehensive directory of retained accounts, active projects, and stakeholders.'
    :                       'Accelerate deal velocity across qualification, quotations, and negotiations.';

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-12 w-full">

      {/* ── Top Header Banner ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
        <div className="absolute right-0 bottom-0 pointer-events-none w-full h-full overflow-hidden">
          <svg className="absolute right-0 bottom-0 w-[550px] h-[110px] opacity-35" viewBox="0 0 550 110" fill="none">
            <path d="M0 110 L100 65 L180 88 L290 35 L400 75 L490 20 L550 45 L550 110 Z" fill="#0A3C4D" />
            <path d="M50 110 L160 72 L260 92 L360 48 L450 72 L530 38 L550 55 L550 110 Z" fill="#00D4DD" opacity="0.35" />
          </svg>
          <div className="absolute right-1/4 top-0 w-[260px] h-[130px] bg-[#00D4DD]/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 shrink-0">
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white">{pageTitle}</h1>
            <p className="text-xs text-slate-300 font-medium">{pageSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/proposals')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>New Quote</span>
              </button>
            )}
            <button
              onClick={onOpenAddLead}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00BCD4] hover:bg-[#00ADC5] text-white font-bold text-xs shadow-md shadow-cyan-950/40 transition active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Strip ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {/* Total Leads */}
        <button type="button"
          onClick={() => { setSelectedStageFilter('all'); setSelectedReqFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedStageFilter === 'all' && selectedReqFilter === 'all' && !showOnlyActionNeeded ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-slate-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#1677FF] text-white flex items-center justify-center shadow-2xs">
                <Users2 className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Total Leads</p>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">{metrics.totalCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-slate-600 mt-1.5 font-medium truncate pt-1 border-t border-slate-200">
            ₹{metrics.totalPipelineValue.toLocaleString('en-IN')} Pipeline
          </div>
        </button>

        {/* Brochures Due */}
        <button type="button"
          onClick={() => { setSelectedReqFilter(selectedReqFilter === 'share_details' ? 'all' : 'share_details'); setSelectedStageFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedReqFilter === 'share_details' ? 'bg-gradient-to-b from-cyan-50 to-white border-2 border-cyan-500 shadow-sm ring-1 ring-cyan-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-cyan-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#00BCD4] text-white flex items-center justify-center shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Brochures Due</p>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">{metrics.detailsNeededCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-cyan-700 mt-1.5 font-semibold truncate pt-1 border-t border-slate-200">WhatsApp Collateral</div>
        </button>

        {/* Demo Requests */}
        <button type="button"
          onClick={() => { setSelectedReqFilter(selectedReqFilter === 'demo_requested' ? 'all' : 'demo_requested'); setSelectedStageFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedReqFilter === 'demo_requested' ? 'bg-gradient-to-b from-purple-50 to-white border-2 border-purple-500 shadow-sm ring-1 ring-purple-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-purple-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#7848FF] text-white flex items-center justify-center shadow-2xs">
                <Laptop className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Demo Requests</p>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">{metrics.demoReqCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-purple-700 mt-1.5 font-semibold truncate pt-1 border-t border-slate-200">Portfolio Walkthrough</div>
        </button>

        {/* Negotiation */}
        <button type="button"
          onClick={() => { setSelectedReqFilter(selectedReqFilter === 'rate_negotiation' ? 'all' : 'rate_negotiation'); setSelectedStageFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedReqFilter === 'rate_negotiation' ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-500 shadow-sm ring-1 ring-amber-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-amber-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-2xs">
                <BadgePercent className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Negotiation</p>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">{metrics.negotiationCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-amber-700 mt-1.5 font-semibold truncate pt-1 border-t border-slate-200">Discount Approval</div>
        </button>

        {/* Callbacks Due */}
        <button type="button"
          onClick={() => { setSelectedReqFilter(selectedReqFilter === 'callback' ? 'all' : 'callback'); setSelectedStageFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedReqFilter === 'callback' ? 'bg-gradient-to-b from-orange-50 to-white border-2 border-orange-500 shadow-sm ring-1 ring-orange-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-orange-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#FFA000] text-white flex items-center justify-center shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Callbacks Due</p>
            <div className="text-lg sm:text-xl font-bold text-[#FFA000] tracking-tight mt-0.5">{metrics.callbacksCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-orange-700 mt-1.5 font-bold truncate pt-1 border-t border-slate-200">
            {metrics.dueTodayCount > 0 ? `${metrics.dueTodayCount} Due Today` : 'Follow-up Calls'}
          </div>
        </button>

        {/* Quote Needed */}
        <button type="button"
          onClick={() => { setSelectedReqFilter(selectedReqFilter === 'quotation_needed' ? 'all' : 'quotation_needed'); setSelectedStageFilter('all'); setShowOnlyActionNeeded(false); }}
          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${selectedReqFilter === 'quotation_needed' ? 'bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20' : 'bg-white border border-slate-300 shadow-xs hover:border-emerald-400 hover:shadow-sm'}`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-6.5 h-6.5 rounded-full bg-[#00BA88] text-white flex items-center justify-center shadow-2xs">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <p className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Quote Needed</p>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">{metrics.quotationNeededCount}</div>
          </div>
          <div className="text-[10px] sm:text-[10.5px] text-emerald-700 mt-1.5 font-bold truncate pt-1 border-t border-slate-200">Pricing & Scope Due</div>
        </button>
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-[0_4px_20px_rgba(15,23,42,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, contact person, phone, notes..."
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 transition cursor-pointer">✕</button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {view !== 'follow-ups' && (
              <button
                type="button"
                onClick={() => { setShowOnlyActionNeeded(!showOnlyActionNeeded); if (!showOnlyActionNeeded) setSelectedReqFilter('all'); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${showOnlyActionNeeded ? 'bg-amber-500 text-white border-amber-600 shadow-sm' : 'bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400 shadow-2xs'}`}
              >
                <Flame className={`w-3.5 h-3.5 ${showOnlyActionNeeded ? 'text-white' : 'text-amber-500'}`} />
                <span>Today's Priority ({metrics.dueTodayCount})</span>
              </button>
            )}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-600 font-semibold select-none shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Active Leads:</span>
              <strong className="text-slate-900 font-mono font-bold">{filteredLeads.length}</strong>
            </div>
          </div>
        </div>

        {/* Follow-ups queue tabs */}
        {view === 'follow-ups' && (
          <div className="pt-3 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />Calling Queue
            </span>
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-300 shadow-inner gap-1 flex-wrap">
              {([
                { id: 'all',       label: 'All Scheduled', count: followUpCounts.total,     activeColor: 'bg-slate-900 text-white',      inactiveColor: 'bg-slate-200/90 text-slate-700' },
                { id: 'due_today', label: 'Due Today',     count: followUpCounts.today,     activeColor: 'bg-amber-500 text-white',      inactiveColor: 'bg-amber-100 text-amber-800'   },
                { id: 'overdue',   label: 'Overdue',       count: followUpCounts.overdue,   activeColor: 'bg-rose-500 text-white',       inactiveColor: 'bg-rose-100 text-rose-800'     },
                { id: 'upcoming',  label: 'Upcoming',      count: followUpCounts.upcoming,  activeColor: 'bg-blue-600 text-white',       inactiveColor: 'bg-blue-100 text-blue-800'     },
                { id: 'completed', label: 'Completed',     count: followUpCounts.completed, activeColor: 'bg-emerald-600 text-white',    inactiveColor: 'bg-emerald-100 text-emerald-800'},
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFollowUpFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${followUpFilter === tab.id ? 'bg-white font-bold shadow-xs border border-slate-300' : 'text-slate-600 hover:bg-white/60'}`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${followUpFilter === tab.id ? tab.activeColor : tab.inactiveColor}`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Table ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-300 shadow-[0_8px_30px_rgba(15,23,42,0.07)] overflow-hidden">

        {view === 'follow-ups' ? (
          /* Follow-ups table */
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-slate-300 text-slate-700 font-bold uppercase text-[10.5px] tracking-wider select-none">
                <th className="py-3.5 px-4 text-left w-[20%]">Lead & Business</th>
                <th className="py-3.5 px-3 text-left w-[19%]">Scheduled Callback</th>
                <th className="py-3.5 px-2.5 text-left w-[16%]">Phone Number</th>
                <th className="py-3 px-3 text-left w-[18%]">Requirement</th>
                <th className="py-3 px-4 text-right w-[27%]">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {filteredLeads.map((l) => {
                const reqMeta     = CUSTOMER_REQUIREMENTS.find((r) => r.id === l.customerRequirement);
                const isPhoneCopied = copiedPhoneId === l.id;
                const isOverdue   = isFollowUpOverdue(l.nextFollowUpDate, l.followUpStatus);
                const isToday     = isFollowUpToday(l.nextFollowUpDate);
                const isCompleted = l.followUpStatus === 'completed';
                const dateInfo    = formatCallbackDate(l.nextFollowUpDate);

                return (
                  <tr
                    key={l.id}
                    onClick={() => onViewLead(l)}
                    className={`hover:bg-slate-50/80 cursor-pointer text-slate-800 transition group border-b border-slate-200 last:border-b-0 ${isCompleted ? 'bg-slate-50/40 opacity-75' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-[13px] tracking-tight group-hover:text-blue-600 transition-colors truncate flex items-center gap-1.5">
                          <span className="truncate">{l.contactPerson || 'Decision Maker'}</span>
                          {l.isHighPriority && <span className="inline-flex items-center gap-0.5 px-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80 text-[9px] font-bold uppercase shrink-0"><Flame className="w-2.5 h-2.5" /><span>Hot</span></span>}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-600">{l.businessName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Completed</span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />Overdue</span>
                          ) : isToday ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />Today</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />{dateInfo.label}</span>
                          )}
                          {dateInfo.label !== dateInfo.full && dateInfo.full && (
                            <span className="text-[11px] font-mono text-slate-400">({dateInfo.full})</span>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md w-fit shadow-2xs">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{l.callbackTimeSlot || '02:00 PM - 03:00 PM'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/80 border border-slate-300 hover:border-blue-300 transition-all group/phone shrink-0">
                        <Phone className="w-3 h-3 text-slate-400 group-hover/phone:text-blue-600 shrink-0" />
                        <a href={`tel:${l.phone}`} className="font-mono font-bold text-slate-800 text-xs group-hover/phone:text-blue-700 tracking-tight transition whitespace-nowrap" title="Click to dial">{l.phone}</a>
                        <button type="button" onClick={() => handleCopyPhone(l.phone, l.id)}
                          className={`p-0.5 rounded transition cursor-pointer shrink-0 ${isPhoneCopied ? 'text-emerald-600 bg-emerald-100/80' : 'text-slate-400 hover:text-slate-700 hover:bg-white'}`}
                          title={isPhoneCopied ? 'Copied!' : 'Copy phone'}>
                          {isPhoneCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {reqMeta ? (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap shadow-2xs ${reqMeta.badge}`}>
                          <reqMeta.icon className="w-3 h-3 shrink-0 opacity-80" />
                          <span>{reqMeta.shortLabel}</span>
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* Done */}
                        <button type="button"
                          onClick={(e) => onQuickDone(l, e)}
                          disabled={isCompleted || updatingLeadId === l.id}
                          className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default opacity-85' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/15 active:scale-95'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Done</span>
                        </button>

                        {/* Reschedule */}
                        <div className="relative shrink-0">
                          <button type="button"
                            onClick={(e) => { e.stopPropagation(); setOpenRescheduleLeadId(openRescheduleLeadId === l.id ? null : l.id); setRescheduleDate(l.nextFollowUpDate || ''); setRescheduleSlot(l.callbackTimeSlot || '02:00 PM - 03:00 PM'); }}
                            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 whitespace-nowrap transition-all shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-400" />
                            <span>Reschedule</span>
                          </button>

                          {openRescheduleLeadId === l.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenRescheduleLeadId(null)} />
                              <div className="absolute right-0 top-full mt-2 z-50 w-72 p-3.5 bg-white rounded-2xl shadow-2xl border border-slate-300 space-y-3 text-left animate-in fade-in zoom-in-95 duration-100">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />Quick Reschedule
                                  </span>
                                  <button type="button" onClick={() => setOpenRescheduleLeadId(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5 rounded-md hover:bg-slate-100">✕</button>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                                  {[
                                    { label: 'Tomorrow 11 AM', days: 1, slot: '11:00 AM - 12:00 PM' },
                                    { label: 'Tomorrow 2 PM',  days: 1, slot: '02:00 PM - 03:00 PM' },
                                    { label: '+2 Days (2 PM)', days: 2, slot: '02:00 PM - 03:00 PM' },
                                    { label: '+1 Week (2 PM)', days: 7, slot: '02:00 PM - 03:00 PM' },
                                  ].map((p) => (
                                    <button key={p.label} type="button"
                                      onClick={(e) => { setOpenRescheduleLeadId(null); onQuickReschedule(l, p.days, p.slot, undefined, e); }}
                                      className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-200 text-slate-700 font-semibold border border-slate-200/70 transition-all cursor-pointer text-left shadow-2xs"
                                    >{p.label}</button>
                                  ))}
                                </div>
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Custom Date & Slot:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    <select value={rescheduleSlot} onChange={(e) => setRescheduleSlot(e.target.value)} className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-800 truncate focus:outline-none focus:ring-1 focus:ring-blue-500">
                                      {CALLBACK_TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                  <button type="button"
                                    onClick={(e) => { setOpenRescheduleLeadId(null); onQuickReschedule(l, 0, rescheduleSlot, rescheduleDate, e); }}
                                    disabled={!rescheduleDate}
                                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                                  >Confirm Reschedule</button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* View */}
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); onViewLead(l); }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
                          title="View full lead details"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr><td colSpan={5} className="py-14 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No scheduled callbacks in this queue</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Select another tab or schedule callbacks from your leads table.</p>
                </td></tr>
              )}
            </tbody>
          </table>

        ) : (

          /* General pipeline table */
          <table className="w-full text-left text-xs table-fixed">
            <thead>
              <tr className="bg-[#F1F5F9] border-b border-slate-300 text-slate-700 font-bold uppercase text-[10.5px] tracking-wider select-none">
                <th className="py-3.5 px-4 text-left w-[29%]">Lead & Business</th>
                <th className="py-3.5 px-3 text-left w-[20%]">Client Requirement</th>
                <th className="py-3.5 px-3 text-left w-[17%]">Phone Number</th>
                <th className="py-3.5 px-3 text-left w-[17%]">Service Interest</th>
                <th className="py-3.5 px-2 text-center w-[8%]">Support</th>
                <th className="py-3.5 px-4 text-right w-[9%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium bg-white">
              {filteredLeads.map((l) => {
                const reqMeta       = CUSTOMER_REQUIREMENTS.find((r) => r.id === l.customerRequirement);
                const hasSupportUpd = Boolean(l.supportNotes || (l.supportStatus && l.supportStatus !== 'pending_support'));
                const isPhoneCopied = copiedPhoneId === l.id;

                return (
                  <tr key={l.id} onClick={() => onViewLead(l)} className="hover:bg-blue-50/50 cursor-pointer text-slate-800 transition-colors group border-b border-slate-200 last:border-b-0">
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-[13px] tracking-tight group-hover:text-blue-600 transition-colors truncate flex items-center gap-1.5">
                          <span className="truncate">{l.contactPerson || 'Decision Maker'}</span>
                          {l.isHighPriority && <span className="inline-flex items-center gap-0.5 px-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80 text-[9px] font-bold uppercase shrink-0"><Flame className="w-2.5 h-2.5" /><span>Hot</span></span>}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-600">{l.businessName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {reqMeta ? (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border truncate max-w-full shadow-2xs ${reqMeta.badge}`}>
                          <reqMeta.icon className="w-3 h-3 shrink-0 opacity-80" />
                          <span className="truncate">{reqMeta.shortLabel}</span>
                        </span>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>

                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50/80 border border-slate-300 hover:border-blue-300 transition-all group/phone max-w-full shadow-2xs">
                        <Phone className="w-3 h-3 text-slate-500 group-hover/phone:text-blue-600 shrink-0" />
                        <a href={`tel:${l.phone}`} className="font-mono font-bold text-slate-800 text-xs group-hover/phone:text-blue-700 tracking-tight transition truncate">{l.phone}</a>
                        <button type="button" onClick={() => handleCopyPhone(l.phone, l.id)}
                          className={`p-0.5 rounded transition cursor-pointer shrink-0 ${isPhoneCopied ? 'text-emerald-600 bg-emerald-100/80' : 'text-slate-400 hover:text-slate-700 hover:bg-white'}`}>
                          {isPhoneCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-700 truncate">{l.serviceInterest || 'General Service'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      {hasSupportUpd ? (
                        <div className="relative inline-flex items-center justify-center group/sup">
                          <button type="button" onClick={() => onViewLead(l)}
                            className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/90 shadow-2xs hover:bg-indigo-600 hover:text-white transition cursor-pointer font-bold text-[10px]"
                            title={l.supportNotes || 'Support updated this lead'}>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                            </span>
                            <span>Note</span>
                          </button>
                          {l.supportNotes && (
                            <div className="absolute right-0 top-full mt-1.5 hidden group-hover/sup:block z-30 w-60 p-2.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl border border-slate-800 pointer-events-none text-left">
                              <div className="font-bold text-indigo-300 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-indigo-400" />Support Update:
                              </div>
                              <p className="line-clamp-3 text-slate-200 font-normal leading-relaxed">{l.supportNotes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-300">
                          <Clock className="w-2.5 h-2.5 text-slate-400" /><span>Pending</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); onViewLead(l); }}
                        className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr><td colSpan={6} className="py-14 text-center text-slate-400 text-xs">
                  <Users2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No leads found in this view</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or search keywords.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
