/**
 * LeadAddForm
 * Full-page form for submitting a new qualified customer lead from the dialer floor.
 * Captures calling outcome, business details, service scope, follow-up schedule, and notes.
 */

import React, { useState } from 'react';
import { Lead } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Building2,
  UserRound,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  Send,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { CUSTOMER_REQUIREMENTS, CALLBACK_TIME_SLOTS, SERVICE_OPTIONS } from './leadConstants';

interface LeadAddFormProps {
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

export const LeadAddForm: React.FC<LeadAddFormProps> = ({ onClose, onLeadCreated }) => {
  const { currentUser } = useAuth();

  // Form state
  const [businessName,        setBusinessName]        = useState('');
  const [contactPerson,       setContactPerson]       = useState('');
  const [phone,               setPhone]               = useState('');
  const [city,                setCity]                = useState('');
  const [serviceInterest,     setServiceInterest]     = useState('Static Website Development');
  const [customerRequirement, setCustomerRequirement] = useState<Lead['customerRequirement']>('share_details');
  const [estimatedBudgetINR,  setEstimatedBudgetINR]  = useState<number | string>(15000);
  const [nextFollowUpDate,    setNextFollowUpDate]    = useState(
    () => new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [callbackTimeSlot, setCallbackTimeSlot] = useState('02:00 PM - 03:00 PM');
  const [notes,            setNotes]            = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const setModalQuickFollowUp = (daysAhead: number) => {
    setNextFollowUpDate(new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!businessName.trim() || !phone.trim()) return;

    try {
      setIsSubmitting(true);
      let initialStatus: Lead['status'] = 'qualified';
      if (customerRequirement === 'quotation_needed') initialStatus = 'proposal_sent';
      if (customerRequirement === 'rate_negotiation') initialStatus = 'negotiation';
      if (customerRequirement === 'callback')         initialStatus = 'contacted';

      const reqLabel = CUSTOMER_REQUIREMENTS.find((r) => r.id === customerRequirement)?.shortLabel ?? '';

      const created = await api.createLead({
        agentName:           currentUser?.name ?? 'Sales Executive',
        businessName:        businessName.trim(),
        contactPerson:       contactPerson.trim() || 'Decision Maker',
        phone:               phone.trim(),
        city:                city.trim() || 'New Delhi',
        industry:            'General Domestic Business',
        serviceInterest,
        customerRequirement,
        supportStatus:       'pending_support',
        estimatedBudgetINR:  Number(String(estimatedBudgetINR).replace(/[^0-9.]/g, '')) || 0,
        status:              initialStatus,
        leadSource:          'Cold Call',
        nextFollowUpDate,
        callbackTimeSlot,
        followUpStatus:      'pending',
        notes: notes.trim() || `Verified customer interest via dialer call (${reqLabel}). Dispatched to Support Desk.`,
      });

      onLeadCreated(created);
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setIsSubmitting(false);
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
          <div>
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white">
              Submit Qualified Customer Lead
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Capture verified requirements, commercial budget, and schedule the next follow-up.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Back to Pipeline</span>
          </button>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-300 shadow-[0_8px_30px_rgba(15,23,42,0.07)] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7 text-xs">

          {/* 1. Calling Outcome */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">1</span>
              <h2 className="text-sm font-bold text-slate-900">Calling Outcome &amp; Client Requirement</h2>
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1.5">
                Customer Calling Outcome &amp; Requirement <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={customerRequirement}
                  onChange={(e) => setCustomerRequirement(e.target.value as Lead['customerRequirement'])}
                  className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-slate-900 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer transition appearance-none pr-10 shadow-2xs"
                >
                  {CUSTOMER_REQUIREMENTS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Company & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">2</span>
              <h2 className="text-sm font-bold text-slate-900">Company &amp; Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Dental Clinic"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Contact Person Name</label>
                <div className="relative">
                  <UserRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Contact Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-mono font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ahmedabad / Noida / Mumbai"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Service Scope & Commercials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">3</span>
              <h2 className="text-sm font-bold text-slate-900">Service Scope &amp; Commercials</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Service Required <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs appearance-none cursor-pointer shadow-2xs"
                  >
                    {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  {customerRequirement === 'rate_negotiation' ? 'Client Offered Budget (₹) *' : 'Quoted Budget (₹)'}
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={estimatedBudgetINR}
                    onChange={(e) => setEstimatedBudgetINR(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-bold text-blue-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Follow-up & Callback Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">4</span>
              <h2 className="text-sm font-bold text-slate-900">Follow-up &amp; Callback Scheduling</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Callback Date</label>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setModalQuickFollowUp(1)} className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-300 transition cursor-pointer shadow-2xs">
                      Tomorrow
                    </button>
                    <button type="button" onClick={() => setModalQuickFollowUp(2)} className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-300 transition cursor-pointer shadow-2xs">
                      +2 Days
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Callback Time Slot</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={callbackTimeSlot}
                    onChange={(e) => setCallbackTimeSlot(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs appearance-none cursor-pointer shadow-2xs"
                  >
                    {CALLBACK_TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">5</span>
              <h2 className="text-sm font-bold text-slate-900">Call Discussion &amp; Customer Feedback Notes</h2>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Discussion Summary &amp; Specific Client Requests</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Customer requested portfolio demo links for dental clinic website; interested in standard package but negotiating to ₹15,000; scheduled callback for Thursday 3:00 PM..."
                className="w-full p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-300 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition text-xs font-normal text-slate-800 leading-relaxed placeholder:text-slate-400 shadow-2xs"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Details will be instantly registered into your CRM Pipeline and dispatched to Support Desk.</span>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer text-xs border border-transparent hover:border-slate-300">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00BCD4] hover:bg-[#00acc1] text-white font-bold text-xs shadow-[0_4px_14px_rgba(0,188,212,0.35)] transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 text-white" />}
                <span>Dispatch Lead to Support Desk</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
