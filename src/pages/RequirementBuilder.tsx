import React, { useState } from 'react';
import { api } from '../services/api';
import {
  ClipboardList,
  CheckCircle2,
  Send,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const RequirementBuilder: React.FC = () => {
  const [serviceType, setServiceType] = useState<'website' | 'ecommerce' | 'crm' | 'erp' | 'marketing' | 'reels'>('website');
  const [clientName, setClientName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Dynamic answers state
  const [answers, setAnswers] = useState<any>({
    pagesCount: '5 Pages (Brochure)',
    hasExistingSite: 'No, fresh website',
    cmsNeeded: 'No, static fast brochure',
    integrations: 'Direct WhatsApp + Google Maps',
    timeline: 'Within 7 working days',
    estimatedBudget: '₹12,000 - ₹20,000',
    usersCount: '1 - 5 users',
    paymentGateway: 'Razorpay UPI + COD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    try {
      await api.submitRequirements({
        clientName: clientName || businessName,
        serviceCategory: serviceType.toUpperCase(),
        answers
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit requirements:', err);
    }
  };

  return (
    <div className="space-y-5 pb-12 w-full animate-in fade-in duration-150">
      {/* Top Welcome / Executive Midnight Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
        {/* Subtle geometric & mountain landscape SVG silhouettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <svg
            className="absolute bottom-0 right-0 w-[600px] h-[180px] text-teal-800/20"
            viewBox="0 0 600 180"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 180 L120 70 L240 130 L380 40 L490 110 L600 20 L600 180 Z" fill="currentColor" />
            <path d="M60 180 L180 90 L300 145 L420 75 L520 125 L600 60 L600 180 Z" fill="currentColor" opacity="0.5" />
          </svg>
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00D4DD]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              Client Requirement Questionnaire Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Structured discovery form to capture complex technical scopes and trigger automated feasibility SLA tickets.
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="p-8 rounded-2xl bg-white border border-[#E8EDF0] shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#17232B]">Requirement Summary Captured & Escalated</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            A technical feasibility ticket has been automatically created for the Technical Support Team with target SLA of 8 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setBusinessName('');
              setClientName('');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0C1215] hover:bg-[#182329] text-white font-semibold text-xs shadow-sm transition active:scale-[0.99] border border-white/10"
          >
            Fill Another Form
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8EDF0] shadow-2xs space-y-5 text-xs">
          {/* Service Selector Tabs */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">Select Service Type:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'website', label: 'Website Development' },
                { id: 'ecommerce', label: 'E-commerce Store' },
                { id: 'crm', label: 'Sales CRM' },
                { id: 'erp', label: 'Manufacturing ERP' },
                { id: 'marketing', label: 'SEO & Marketing' },
                { id: 'reels', label: 'Reels Production' }
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setServiceType(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition cursor-pointer ${serviceType === tab.id
                      ? 'bg-[#0C1215] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="font-semibold text-slate-700">Business / Lead Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Hospital & Fertility Center"
                className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Contact Person</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Dr. Ramesh Kumar"
                className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Dynamic Questionnaire Fields */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            {serviceType === 'website' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700">Number of Pages Required:</label>
                  <select
                    value={answers.pagesCount}
                    onChange={(e) => setAnswers({ ...answers, pagesCount: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="5 Pages (Brochure)">5 Pages (Starter Brochure)</option>
                    <option value="8-10 Pages (Corporate)">8-10 Pages (Corporate)</option>
                    <option value="15+ Pages (Portal)">15+ Pages (Custom Portal)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Self-Editable CMS Admin Panel?</label>
                  <select
                    value={answers.cmsNeeded}
                    onChange={(e) => setAnswers({ ...answers, cmsNeeded: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="No, static fast brochure">No, static fast brochure (Developer edits)</option>
                    <option value="Yes, dynamic CMS needed">Yes, dynamic CMS needed (Admin login)</option>
                  </select>
                </div>
              </div>
            )}

            {serviceType === 'crm' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">Total Active Telecallers / Executives:</label>
                  <input
                    type="text"
                    value={answers.usersCount}
                    onChange={(e) => setAnswers({ ...answers, usersCount: e.target.value })}
                    placeholder="e.g. 8 sales agents"
                    className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Primary Lead Sources:</label>
                  <input
                    type="text"
                    defaultValue="Meta Ads, Google Sheets, Website"
                    className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}

            {serviceType === 'erp' && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Mandatory Technical Scoping Rule
                </span>
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  ERP requirements cannot be quoted verbally. Submitting this form creates a Joint Scoping Call ticket with the Technical Delivery Team.
                </p>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700">Expected Delivery Timeline & Client Deadline:</label>
              <input
                type="text"
                value={answers.timeline}
                onChange={(e) => setAnswers({ ...answers, timeline: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-lg bg-slate-50/70 border border-slate-200 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BCD4] hover:bg-[#00acc1] text-white font-bold text-xs shadow-[0_4px_14px_rgba(0,188,212,0.35)] transition active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>Generate Summary & Route to Tech Team</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
