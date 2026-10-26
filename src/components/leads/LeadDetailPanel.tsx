/**
 * LeadDetailPanel
 * Full-page lead detail view that opens when an agent clicks "View" on a lead row.
 * Handles reading and saving all lead fields: pipeline stage, customer requirement,
 * service interest, budget, quotation, follow-up schedule, and notes.
 */

import React, { useState } from 'react';
import { Lead } from '../../types';
import { api } from '../../services/api';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  UserRound,
  Flame,
  Send,
  Headphones,
  TrendingUp,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Check,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { CUSTOMER_REQUIREMENTS, KANBAN_STAGES, CALLBACK_TIME_SLOTS, SERVICE_OPTIONS } from './leadConstants';

interface LeadDetailPanelProps {
  lead: Lead;
  onBack: () => void;
  onLeadUpdated: (updated: Lead) => void;
  onNavigate?: (path: string) => void;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({
  lead,
  onBack,
  onLeadUpdated,
  onNavigate,
}) => {
  // Local copy of the lead being edited
  const [activeLead, setActiveLead] = useState<Lead>(lead);

  const [isSavingLead, setIsSavingLead] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leadActionError, setLeadActionError] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);

  // Sync if parent passes a fresh lead (e.g. from real-time subscription)
  React.useEffect(() => {
    setActiveLead((prev) => ({ ...prev, ...lead }));
  }, [lead]);

  const currentStageMeta = KANBAN_STAGES.find((s) => s.id === activeLead.status);
  const currentReqMeta   = CUSTOMER_REQUIREMENTS.find((r) => r.id === (activeLead.customerRequirement || 'share_details'));
  const leadInitial      = activeLead.businessName?.trim().charAt(0).toUpperCase() || 'L';

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleCopyPhone = () => {
    if (!activeLead.phone) return;
    navigator.clipboard.writeText(activeLead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingLead(true);
      setLeadActionError('');
      const updated = await api.updateLead(activeLead.id, {
        status:               activeLead.status,
        customerRequirement:  activeLead.customerRequirement,
        supportStatus:        activeLead.supportStatus,
        notes:                activeLead.notes,
        estimatedBudgetINR:   Number(activeLead.estimatedBudgetINR),
        quotationINR:         activeLead.quotationINR == null ? null : Number(activeLead.quotationINR),
        nextFollowUpDate:     activeLead.nextFollowUpDate,
        callbackTimeSlot:     activeLead.callbackTimeSlot || '02:00 PM - 03:00 PM',
        followUpStatus:       activeLead.followUpStatus || 'pending',
        lastContactDate:      new Date().toISOString().slice(0, 10),
        serviceInterest:      activeLead.serviceInterest,
      });
      onLeadUpdated(updated);
      setActiveLead(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setLeadActionError(err instanceof Error ? err.message : 'Could not save lead updates.');
    } finally {
      setIsSavingLead(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 pb-12 w-full animate-in fade-in duration-150">

      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
        <div className="absolute right-0 bottom-0 pointer-events-none w-full h-full overflow-hidden">
          <svg className="absolute right-0 bottom-0 w-[480px] h-[95px] opacity-35" viewBox="0 0 480 95" fill="none">
            <path d="M0 95 L90 55 L160 75 L260 30 L360 65 L440 18 L480 40 L480 95 Z" fill="#0A3C4D" />
            <path d="M40 95 L140 60 L230 78 L330 40 L410 65 L480 45 L480 95 Z" fill="#00D4DD" opacity="0.35" />
          </svg>
          <div className="absolute right-1/4 top-0 w-[220px] h-[110px] bg-[#00D4DD]/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Lead avatar */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#00D4DD] to-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-cyan-500/25 shrink-0 select-none">
              {leadInitial}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                  <Building2 className="w-3 h-3" />
                  <span>{activeLead.industry || 'Domestic SMB'}</span>
                </span>

                {currentStageMeta && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentStageMeta.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStageMeta.dotColor}`} />
                    <span>{currentStageMeta.label}</span>
                  </span>
                )}

                {activeLead.isHighPriority && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-400/40">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>High Priority</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white">
                {activeLead.businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium mt-1">
                <span className="flex items-center gap-1.5">
                  <UserRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeLead.contactPerson}</span>
                </span>
                {activeLead.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{activeLead.city}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeLead.phone}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Back to Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Form Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-300 shadow-[0_8px_30px_rgba(15,23,42,0.07)] overflow-hidden">
        <form onSubmit={handleSave} className="flex flex-col">
          <div className="p-6 sm:p-8 space-y-5">

            {/* 1. Quick Connect Toolbar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/20 to-indigo-50/20 border border-slate-300 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Mobile</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`tel:${activeLead.phone}`}
                      className="font-mono font-bold text-slate-900 text-base hover:text-blue-600 hover:underline transition"
                      title="Click to dial"
                    >
                      {activeLead.phone}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
                      title={copiedPhone ? 'Copied!' : 'Copy Phone'}
                    >
                      {copiedPhone ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => { onBack(); onNavigate('/proposals'); }}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition shadow-xs cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Quotation</span>
                </button>
              )}
            </div>

            {/* 2. Calling Outcome & Requirement */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-blue-600" />
                    <span>Customer Calling Outcome & Requirement</span>
                  </label>
                  {currentReqMeta && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentReqMeta.badge}`}>
                      <currentReqMeta.icon className="w-3 h-3" />
                      <span>{currentReqMeta.shortLabel}</span>
                    </span>
                  )}
                </div>

                <select
                  value={activeLead.customerRequirement || 'share_details'}
                  onChange={(e) => setActiveLead({ ...activeLead, customerRequirement: e.target.value as Lead['customerRequirement'] })}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none transition shadow-2xs"
                >
                  {CUSTOMER_REQUIREMENTS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>

                {currentReqMeta?.desc && (
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{currentReqMeta.desc}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pipeline Stage custom dropdown */}
                <div className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pipeline Stage</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsStageDropdownOpen((p) => !p)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border transition cursor-pointer text-left ${isStageDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-blue-500/80 ring-2 ring-blue-100/60 shadow-2xs hover:border-blue-600'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${currentStageMeta?.dotColor || 'bg-blue-600'}`} />
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {currentStageMeta?.label || activeLead.status}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ml-2 ${isStageDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>

                  {isStageDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsStageDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl shadow-slate-200/90 border border-slate-300 p-2 space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                        {KANBAN_STAGES.map((s) => {
                          const isSelected = activeLead.status === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => { setActiveLead({ ...activeLead, status: s.id }); setIsStageDropdownOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${isSelected ? 'bg-blue-50/80 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-700 font-medium'}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${isSelected ? 'bg-blue-600 text-white shadow-2xs' : s.iconBg}`}>
                                  <s.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm truncate">{s.label}</span>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-blue-600 stroke-[2.5] ml-2 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Service Interest */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Service Interest</span>
                  </label>
                  <select
                    value={activeLead.serviceInterest || 'Static Website Development'}
                    onChange={(e) => setActiveLead({ ...activeLead, serviceInterest: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-slate-800 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white focus:outline-none transition shadow-2xs"
                  >
                    {SERVICE_OPTIONS.map((svc) => <option key={svc} value={svc}>{svc}</option>)}
                  </select>
                </div>
              </div>

              {/* Budget & Quotation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Estimated Budget</span>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-slate-400 text-xs select-none">₹</span>
                    <input
                      type="number"
                      value={activeLead.estimatedBudgetINR}
                      onChange={(e) => setActiveLead({ ...activeLead, estimatedBudgetINR: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-300 font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-1">Formal Quotation Value</span>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-bold text-slate-400 text-xs select-none">₹</span>
                    <input
                      type="number"
                      value={activeLead.quotationINR ?? ''}
                      onChange={(e) => setActiveLead({ ...activeLead, quotationINR: e.target.value === '' ? null : Number(e.target.value) })}
                      placeholder="Enter final quote"
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-white border border-slate-300 font-mono font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Follow-up & Callback Schedule */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Follow-up & Callback Schedule</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500">Never miss a committed callback</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Next Follow-up Date</span>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="date"
                      value={activeLead.nextFollowUpDate}
                      onChange={(e) => setActiveLead({ ...activeLead, nextFollowUpDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-mono font-bold text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Callback Time Slot</span>
                  <select
                    value={activeLead.callbackTimeSlot || '02:00 PM - 03:00 PM'}
                    onChange={(e) => setActiveLead({ ...activeLead, callbackTimeSlot: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                  >
                    {CALLBACK_TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Quick date presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Presets:</span>
                </span>
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: 'In 2 Days', days: 2 },
                  { label: 'In 3 Days', days: 3 },
                  { label: 'In 7 Days', days: 7 },
                ].map((p) => {
                  const presetDate = new Date(Date.now() + p.days * 86400000).toISOString().split('T')[0];
                  const active = activeLead.nextFollowUpDate === presetDate;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setActiveLead({ ...activeLead, nextFollowUpDate: presetDate })}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer border ${active ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-2xs'}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Notes & Interaction History */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Customer Interaction Notes & Objection Log</span>
              </label>
              <textarea
                rows={4}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-medium text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition leading-relaxed shadow-2xs"
                value={activeLead.notes}
                onChange={(e) => setActiveLead({ ...activeLead, notes: e.target.value })}
                placeholder="Record customer specific requirements, objection points, discount discussions or preferred meeting time..."
              />
            </div>

            {/* 5. Support Team Updates (live sync, read-only) */}
            {(activeLead.supportStatus || activeLead.supportNotes) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-blue-50/60 border border-indigo-200 shadow-2xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">Technical Support Updates (Live Sync)</span>
                  </div>
                  {activeLead.supportStatus && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                      {activeLead.supportStatus.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                {activeLead.supportNotes && (
                  <div className="text-xs text-indigo-900 bg-white/90 p-3.5 rounded-xl border border-indigo-100 font-medium leading-relaxed space-y-1">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Support Team Note:</div>
                    <p>{activeLead.supportNotes}</p>
                  </div>
                )}
                {activeLead.assignedSupportName && (
                  <p className="text-[11px] text-indigo-700">
                    Handled by: <span className="font-semibold">{activeLead.assignedSupportName}</span>
                  </p>
                )}
              </div>
            )}

            {leadActionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{leadActionError}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 hover:text-slate-900 transition text-xs cursor-pointer shadow-2xs"
              >
                Back to Pipeline
              </button>
              <button
                type="submit"
                disabled={isSavingLead}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSavingLead ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isSavingLead ? 'Saving...' : saveSuccess ? 'Saved Successfully!' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
