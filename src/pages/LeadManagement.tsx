/**
 * LeadManagement — Orchestrator Page
 *
 * Responsibilities:
 *  - Load and sync leads from Firestore (initial load + real-time subscription)
 *  - Hold shared state: leads array, filters, active lead, view mode
 *  - Decide which child component to render based on current state:
 *      - LeadAddForm      → when adding a new lead
 *      - LeadDetailPanel  → when a lead row is clicked ("View")
 *      - LeadPipelineTable → default: the KPI strip + search bar + table
 *
 * All UI is delegated to components/leads/*.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lead } from '../types';

import { LeadPipelineTable } from '../components/leads/LeadPipelineTable';
import { LeadDetailPanel }   from '../components/leads/LeadDetailPanel';
import { LeadAddForm }       from '../components/leads/LeadAddForm';

// ── Types ────────────────────────────────────────────────────────────────────

type LeadManagementView = 'leads' | 'pipeline' | 'follow-ups' | 'deals' | 'clients' | 'add-lead';

interface LeadManagementProps {
  view?: LeadManagementView;
  onNavigate?: (path: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const LeadManagement: React.FC<LeadManagementProps> = ({ view = 'pipeline', onNavigate }) => {
  const { currentUser } = useAuth();

  // ── Data ──────────────────────────────────────────────────────────────────
  const [leads,         setLeads]         = useState<Lead[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [leadLoadError, setLeadLoadError] = useState('');
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState('');

  // ── UI state ─────────────────────────────────────────────────────────────
  const [activeLead,    setActiveLead]    = useState<Lead | null>(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // ── Filter state (lifted so LeadPipelineTable can read & write them) ──────
  const [search,                 setSearch]                 = useState('');
  const [selectedStageFilter,    setSelectedStageFilter]    = useState<string>('all');
  const [selectedReqFilter,      setSelectedReqFilter]      = useState<string>('all');
  const [showOnlyActionNeeded,   setShowOnlyActionNeeded]   = useState(false);
  const [followUpFilter, setFollowUpFilter] = useState<'all' | 'due_today' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [openRescheduleLeadId,   setOpenRescheduleLeadId]   = useState<string | null>(null);

  // ── Reschedule inline state ───────────────────────────────────────────────
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('02:00 PM - 03:00 PM');

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res = await api.getLeads();
      const seen = new Set<string>();
      const deduped = (res.leads || []).filter((l) => {
        if (!l?.id || seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });
      setLeads(deduped);
      setLeadLoadError('');
    } catch (err) {
      setLeadLoadError(err instanceof Error ? err.message : 'Could not load CRM leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLeads();

    // Real-time subscription — syncs Support updates & new leads instantly
    const unsubscribe = api.subscribeLeads((updatedLeads) => {
      setLeads((prev) => {
        if (updatedLeads.length > 1) {
          const seen = new Set<string>();
          return updatedLeads.filter((l) => {
            if (!l?.id || seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          });
        }
        if (updatedLeads.length === 1) {
          const single = updatedLeads[0];
          const exists = prev.some((l) => l.id === single.id);
          return exists ? prev.map((l) => (l.id === single.id ? { ...l, ...single } : l)) : [single, ...prev];
        }
        return prev;
      });
      // Keep open detail panel in sync
      setActiveLead((current) => {
        if (!current) return null;
        const matching = updatedLeads.find((l) => l.id === current.id);
        return matching ? { ...current, ...matching } : current;
      });
      setLeadLoadError('');
    });

    return () => { unsubscribe(); };
  }, []);

  // Escape key closes detail panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeLead) setActiveLead(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLead]);

  // ── Date helpers ──────────────────────────────────────────────────────────

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const isFollowUpOverdue = (dateStr?: string, status?: string) => {
    if (!dateStr || status === 'completed') return false;
    return dateStr < getLocalDateString();
  };

  const isFollowUpToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr === getLocalDateString();
  };

  const isFollowUpUpcoming = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr > getLocalDateString();
  };

  const isFollowUpDueOrOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr <= getLocalDateString();
  };

  const formatCallbackDate = (dateStr?: string): { label: string; full: string } => {
    if (!dateStr) return { label: 'No date set', full: '' };
    const today = getLocalDateString();
    if (dateStr === today) return { label: 'Today', full: dateStr };
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const [ty, tm, td] = today.split('-').map(Number);
      const diff = Math.round((new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000);
      if (diff === 1)  return { label: 'Tomorrow',  full: dateStr };
      if (diff === -1) return { label: 'Yesterday', full: dateStr };
      const formatted = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(y !== ty && { year: 'numeric' }) });
      return { label: formatted, full: dateStr };
    } catch { return { label: dateStr, full: dateStr }; }
  };

  const parseTimeSlotOrder = (slot?: string): number => {
    if (!slot) return 14 * 60;
    const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 14 * 60;
    let hour = parseInt(match[1], 10);
    const min  = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + min;
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleQuickStatusChange = async (leadId: string, newStatus: Lead['status'], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingLeadId(leadId);
      const today = new Date().toISOString().slice(0, 10);
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus, lastContactDate: today } : l));
      if (activeLead?.id === leadId) setActiveLead((prev) => prev ? { ...prev, status: newStatus } : null);
      await api.updateLead(leadId, { status: newStatus, lastContactDate: today });
    } catch (err) {
      void loadLeads();
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleQuickDoneFollowUp = async (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingLeadId(lead.id);
      const today = getLocalDateString();
      const updated: Lead = { ...lead, followUpStatus: 'completed', lastContactDate: today };
      setLeads((prev) => prev.map((l) => l.id === lead.id ? updated : l));
      if (activeLead?.id === lead.id) setActiveLead(updated);
      await api.updateLead(lead.id, { followUpStatus: 'completed', lastContactDate: today });
      setSubmissionSuccessMsg(`✓ Call completed for "${lead.businessName}". Queue updated!`);
      setTimeout(() => setSubmissionSuccessMsg(''), 4000);
    } catch { void loadLeads(); }
    finally { setUpdatingLeadId(null); }
  };

  const handleQuickReschedule = async (
    lead: Lead,
    daysAhead: number,
    customSlot?: string,
    customDate?: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      setUpdatingLeadId(lead.id);
      setOpenRescheduleLeadId(null);
      let dateStr = customDate;
      if (!dateStr) {
        const t = new Date(Date.now() + daysAhead * 86400000);
        dateStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
      }
      const slot = customSlot || lead.callbackTimeSlot || '02:00 PM - 03:00 PM';
      const updated: Lead = { ...lead, nextFollowUpDate: dateStr, callbackTimeSlot: slot, followUpStatus: 'rescheduled' };
      setLeads((prev) => prev.map((l) => l.id === lead.id ? updated : l));
      if (activeLead?.id === lead.id) setActiveLead(updated);
      await api.updateLead(lead.id, { nextFollowUpDate: dateStr, callbackTimeSlot: slot, followUpStatus: 'rescheduled' });
      setSubmissionSuccessMsg(`Rescheduled callback for "${lead.businessName}" to ${dateStr} (${slot})`);
      setTimeout(() => setSubmissionSuccessMsg(''), 4000);
    } catch { void loadLeads(); }
    finally { setUpdatingLeadId(null); }
  };

  // ── Derived / filtered data ───────────────────────────────────────────────

  // Deduplicate all leads by ID so identical leads are never rendered twice
  const uniqueLeads = useMemo(() => {
    const seen = new Set<string>();
    return leads.filter((lead) => {
      if (!lead?.id || seen.has(lead.id)) return false;
      seen.add(lead.id);
      return true;
    });
  }, [leads]);

  const viewLeads = useMemo(() => uniqueLeads.filter((lead) => {
    if (view === 'follow-ups') return lead.status !== 'won' && lead.status !== 'lost' && Boolean(lead.nextFollowUpDate);
    if (view === 'deals')      return lead.status === 'won' || lead.status === 'lost';
    if (view === 'clients')    return lead.status === 'won';
    return true;
  }), [uniqueLeads, view]);

  const followUpCounts = useMemo(() => {
    const raw      = uniqueLeads.filter((l) => l.status !== 'won' && l.status !== 'lost' && Boolean(l.nextFollowUpDate));
    const overdue  = raw.filter((l) => isFollowUpOverdue(l.nextFollowUpDate, l.followUpStatus)).length;
    const today    = raw.filter((l) => isFollowUpToday(l.nextFollowUpDate) && l.followUpStatus !== 'completed').length;
    const upcoming = raw.filter((l) => isFollowUpUpcoming(l.nextFollowUpDate) && l.followUpStatus !== 'completed').length;
    const completed = raw.filter((l) => l.followUpStatus === 'completed').length;
    return { total: raw.length, activeTotal: overdue + today + upcoming, overdue, today, upcoming, completed };
  }, [uniqueLeads]);

  const metrics = useMemo(() => {
    const totalPipelineValue = viewLeads
      .filter((l) => l.status !== 'lost')
      .reduce((sum, l) => sum + (l.quotationINR || l.estimatedBudgetINR || 0), 0);
    return {
      totalCount:            viewLeads.length,
      detailsNeededCount:    viewLeads.filter((l) => l.customerRequirement === 'share_details').length,
      demoReqCount:          viewLeads.filter((l) => l.customerRequirement === 'demo_requested').length,
      negotiationCount:      viewLeads.filter((l) => l.customerRequirement === 'rate_negotiation').length,
      callbacksCount:        viewLeads.filter((l) => l.customerRequirement === 'callback').length,
      dueTodayCount:         viewLeads.filter((l) => l.status !== 'won' && l.status !== 'lost' && isFollowUpDueOrOverdue(l.nextFollowUpDate)).length,
      wonCount:              viewLeads.filter((l) => l.status === 'won').length,
      quotationNeededCount:  viewLeads.filter((l) => l.customerRequirement === 'quotation_needed').length,
      totalPipelineValue,
    };
  }, [viewLeads]);

  const filteredLeads = useMemo(() => {
    let result = viewLeads.filter((l) => {
      if (view === 'follow-ups') {
        if (followUpFilter === 'due_today')  return isFollowUpToday(l.nextFollowUpDate) && l.followUpStatus !== 'completed';
        if (followUpFilter === 'overdue')    return isFollowUpOverdue(l.nextFollowUpDate, l.followUpStatus);
        if (followUpFilter === 'upcoming')   return isFollowUpUpcoming(l.nextFollowUpDate) && l.followUpStatus !== 'completed';
        if (followUpFilter === 'completed')  return l.followUpStatus === 'completed';
      }
      if (selectedStageFilter !== 'all' && l.status !== selectedStageFilter) return false;
      if (selectedReqFilter   !== 'all' && l.customerRequirement !== selectedReqFilter) return false;
      if (showOnlyActionNeeded && !isFollowUpDueOrOverdue(l.nextFollowUpDate) && l.status !== 'new') return false;
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        l.businessName.toLowerCase().includes(s) ||
        l.contactPerson.toLowerCase().includes(s) ||
        l.phone.includes(s) ||
        (l.city ?? '').toLowerCase().includes(s) ||
        (l.serviceInterest ?? '').toLowerCase().includes(s) ||
        (l.notes ?? '').toLowerCase().includes(s)
      );
    });

    result.sort((a, b) => {
      if (view === 'follow-ups') {
        const aDone = a.followUpStatus === 'completed';
        const bDone = b.followUpStatus === 'completed';
        if (aDone !== bDone) return aDone ? 1 : -1;
      }
      const dateA = a.nextFollowUpDate || '9999-99-99';
      const dateB = b.nextFollowUpDate || '9999-99-99';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return parseTimeSlotOrder(a.callbackTimeSlot) - parseTimeSlotOrder(b.callbackTimeSlot);
    });

    return result;
  }, [viewLeads, view, followUpFilter, selectedStageFilter, selectedReqFilter, showOnlyActionNeeded, search]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Synchronizing CRM Calling Floor...</p>
        </div>
      </div>
    );
  }

  // ── Show Add Lead Form ────────────────────────────────────────────────────
  const isAddLeadPage = showAddModal || view === 'add-lead';
  if (isAddLeadPage) {
    return (
      <LeadAddForm
        onClose={() => {
          setShowAddModal(false);
          if (onNavigate && view === 'add-lead') onNavigate('/leads');
        }}
        onLeadCreated={(created) => {
          setLeads((prev) => {
            if (prev.some((l) => l.id === created.id)) return prev;
            return [created, ...prev];
          });
          setShowAddModal(false);
          if (onNavigate) onNavigate('/leads');
          setSubmissionSuccessMsg(`Lead for "${created.businessName}" submitted to Support Desk!`);
          setTimeout(() => setSubmissionSuccessMsg(''), 6000);
        }}
      />
    );
  }

  // ── Show Lead Detail Panel ────────────────────────────────────────────────
  if (activeLead) {
    return (
      <LeadDetailPanel
        lead={activeLead}
        onBack={() => setActiveLead(null)}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => l.id === updated.id ? updated : l));
          setActiveLead(updated);
        }}
        onNavigate={onNavigate}
      />
    );
  }

  // ── Show Pipeline Table (default) ─────────────────────────────────────────
  return (
    <>
      {submissionSuccessMsg && (
        <div role="status" className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{submissionSuccessMsg}</span>
          <button onClick={() => setSubmissionSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer">✕</button>
        </div>
      )}

      {leadLoadError && (
        <div role="alert" className="mb-4 p-3.5 rounded-xl border border-red-300 bg-red-50 text-xs text-red-800 font-medium shadow-2xs">
          Could not load leads: {leadLoadError}
        </div>
      )}

      <LeadPipelineTable
        view={view}
        filteredLeads={filteredLeads}
        metrics={metrics}
        followUpCounts={followUpCounts}
        search={search}                             setSearch={setSearch}
        selectedStageFilter={selectedStageFilter}   setSelectedStageFilter={setSelectedStageFilter}
        selectedReqFilter={selectedReqFilter}       setSelectedReqFilter={setSelectedReqFilter}
        showOnlyActionNeeded={showOnlyActionNeeded} setShowOnlyActionNeeded={setShowOnlyActionNeeded}
        followUpFilter={followUpFilter}             setFollowUpFilter={setFollowUpFilter}
        updatingLeadId={updatingLeadId}
        onViewLead={(lead) => setActiveLead(lead)}
        onOpenAddLead={() => {
          setShowAddModal(true);
          if (onNavigate) onNavigate('/add-lead');
        }}
        onQuickDone={handleQuickDoneFollowUp}
        onQuickReschedule={handleQuickReschedule}
        onNavigate={onNavigate}
        isFollowUpOverdue={isFollowUpOverdue}
        isFollowUpToday={isFollowUpToday}
        formatCallbackDate={formatCallbackDate}
      />
    </>
  );
};
