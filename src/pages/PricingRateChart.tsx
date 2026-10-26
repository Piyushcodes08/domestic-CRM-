import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ServiceItem } from '../types';
import {
  BadgeIndianRupee,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  Lock,
  Edit,
  Plus
} from 'lucide-react';

interface PricingRateChartProps {
  onNavigate: (path: string) => void;
}

export const PricingRateChart: React.FC<PricingRateChartProps> = ({ onNavigate }) => {
  const { isManager, isAdmin } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.getServices();
        setServices(s);
        if (s.length > 0) setSelectedService(s[0]);
      } catch (err) {
        console.error('Failed to load services for rate chart:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !selectedService) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Centralized Rate Chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12 w-full">
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
              Official Vahlay Digital Pricing Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Standard commercial rate card with verified scopes, milestones, delivery SLAs, and strict exclusion boundaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('/sales-copilot')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer border border-slate-200/50"
            >
              <span>Sales Copilot →</span>
            </button>
            <button
              onClick={() => onNavigate('/proposals')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BCD4] hover:bg-[#00acc1] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,188,212,0.35)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Create Quotation →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Table / Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Services Selector */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {services.map((srv) => {
            const isSelected = selectedService.id === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer ${isSelected
                    ? 'bg-[#E6FAF8] text-[#007A87] border-[#00BFCB] shadow-2xs font-bold ring-1 ring-[#00BFCB]/20'
                    : 'bg-white border-[#E8EDF0] text-slate-800 hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
              >
                <div>
                  <p className="text-xs font-semibold line-clamp-1">{srv.name}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-[#008F9B]' : 'text-slate-500'}`}>
                    ₹{srv.packages[0]?.priceINR.toLocaleString('en-IN')} ({srv.packages[0]?.pricingUnit})
                  </p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#00C9D4] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                  {srv.packages[0]?.status || 'Approved'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Package Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E8EDF0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {selectedService.category}
                </span>
                <h2 className="text-lg font-bold text-[#17232B]">{selectedService.name}</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Rate Card</span>
              </div>
            </div>

            {/* Packages */}
            <div className="space-y-4">
              {selectedService.packages.map((pkg) => (
                <div key={pkg.id} className="p-5 rounded-xl bg-slate-50/70 border border-[#E8EDF0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#17232B]">{pkg.name}</h3>
                      <p className="text-xs text-slate-500">Target Segment: {pkg.recommendedFor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-[#17232B]">
                        ₹{pkg.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 block">({pkg.pricingUnit} + GST if applicable)</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-slate-700">Scope of Work Deliverables:</p>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      {pkg.inclusions.map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 text-xs text-rose-700 pt-2 border-t border-slate-200/80">
                    <p className="font-bold">Strict Exclusions:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {pkg.exclusions.map((exc, i) => (
                        <li key={i}>{exc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Approved Timeline: {pkg.deliveryTimeline}</span>
                    </div>
                    <div>
                      <span>Milestones: {pkg.paymentMilestones.join(' • ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Optional Add-ons */}
            {selectedService.optionalAddons.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-[#E8EDF0] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Approved Optional Add-ons
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedService.optionalAddons.map((addon, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50/70 border border-[#E8EDF0] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{addon.name}</p>
                        <p className="text-[11px] text-slate-500">{addon.description}</p>
                      </div>
                      <span className="font-bold text-[#008F9B] ml-2">₹{addon.priceINR.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Warning */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Approval Requirement: </strong>
                {selectedService.approvalRequirements.join(' ')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
