import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Proposal, ServiceItem } from '../types';
import { QuotationStudio } from '../components/quotations/QuotationStudio';
import { QuotationPreviewModal } from '../components/quotations/QuotationPreviewModal';
import {
  Send,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText,
  BadgeIndianRupee,
  Shield,
  Building2,
  UserRound,
  Phone,
  MapPin,
  Sparkles,
  MessageCircle,
  CheckCheck,
  Briefcase,
  Search,
  Eye,
  Calendar,
  Filter,
  Check
} from 'lucide-react';

export const ProposalManager: React.FC = () => {
  const { currentUser, isManager, isAdmin, isSupport } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');
  const [viewTab, setViewTab] = useState<'studio' | 'pipeline'>('studio');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_support' | 'dispatched' | 'pending_manager'>('all');

  // New proposal request form state
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('srv-static-web');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [scopeNotes, setScopeNotes] = useState('');
  const [supportInstructions, setSupportInstructions] = useState('');

  const canDispatchQuotation = isSupport || isManager || isAdmin;

  // Deduplicate any proposal list by proposalNumber and by id
  const deduplicateProposals = (list: Proposal[]): Proposal[] => {
    const seen = new Set<string>();
    const result: Proposal[] = [];
    for (const p of list) {
      if (!p) continue;
      const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(p);
      }
    }
    return result;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [props, srvs] = await Promise.all([api.getProposals(), api.getServices()]);
        const cleanProps = deduplicateProposals(props);
        setProposals(cleanProps);
        setServices(srvs);

        // Auto-cleanup redundant duplicate records in Firestore for admin
        if (isAdmin && props.length > cleanProps.length) {
          const seen = new Set<string>();
          for (const p of props) {
            const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
            if (seen.has(key)) {
              api.deleteProposal(p.id).catch(() => {});
            } else {
              seen.add(key);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

    // ── Live real-time subscription for Support Team quotation dispatches & updates ──
    const unsubscribe = api.subscribeProposals((updatedProps) => {
      setProposals((prev) => {
        const merged = new Map<string, Proposal>();
        for (const p of updatedProps) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          merged.set(key, p);
        }
        for (const p of prev) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          if (!merged.has(key)) {
            merged.set(key, p);
          }
        }
        return Array.from(merged.values());
      });
      // Synchronize currently viewed proposal if updated by Support in real-time
      setViewingProposal((current) => {
        if (!current) return null;
        const matching = updatedProps.find((p) => p.id === current.id || (current.proposalNumber && p.proposalNumber === current.proposalNumber));
        return matching ? { ...current, ...matching } : current;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isAdmin]);

  // Deduplicated proposals list for consistent UI & KPIs
  const uniqueProposals = useMemo(() => {
    return deduplicateProposals(proposals);
  }, [proposals]);

  // Compute KPI metrics
  const kpis = useMemo(() => {
    const total = uniqueProposals.length;
    const pendingSupport = uniqueProposals.filter((p) => p.approvalStatus === 'pending_support_dispatch').length;
    const dispatched = uniqueProposals.filter(
      (p) => p.approvalStatus === 'sent_to_client' || p.approvalStatus === 'sent' || p.approvalStatus === 'approved'
    ).length;
    const pendingManager = uniqueProposals.filter((p) => p.approvalStatus === 'pending_manager_approval').length;
    return { total, pendingSupport, dispatched, pendingManager };
  }, [uniqueProposals]);

  // Filtered proposal requests
  const filteredProposals = useMemo(() => {
    return uniqueProposals.filter((prop) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prop.proposalNumber.toLowerCase().includes(q) ||
        prop.clientCompany.toLowerCase().includes(q) ||
        prop.clientName.toLowerCase().includes(q) ||
        (prop.clientPhone && prop.clientPhone.includes(q)) ||
        (prop.clientCity && prop.clientCity.toLowerCase().includes(q)) ||
        prop.serviceCategory.toLowerCase().includes(q) ||
        prop.agentName.toLowerCase().includes(q);

      const isDispatched =
        prop.approvalStatus === 'sent_to_client' ||
        prop.approvalStatus === 'sent' ||
        prop.approvalStatus === 'approved';
      const isPendingSupport = prop.approvalStatus === 'pending_support_dispatch';
      const isPendingManager = prop.approvalStatus === 'pending_manager_approval';

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending_support' && isPendingSupport) ||
        (statusFilter === 'dispatched' && isDispatched) ||
        (statusFilter === 'pending_manager' && isPendingManager);

      return matchesSearch && matchesStatus;
    });
  }, [uniqueProposals, searchQuery, statusFilter]);

  const handleCreateProposalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!clientName.trim() || !clientCompany.trim() || !clientPhone.trim()) return;

    const srv = services.find((s) => s.id === selectedServiceId) || services[0];
    const basePrice = customPrice !== '' ? Number(customPrice) : srv.packages[0]?.priceINR || 15000;

    try {
      setIsSubmitting(true);
      const created = await api.createProposal({
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim(),
        clientPhone: clientPhone.trim(),
        clientCity: clientCity.trim() || 'Domestic',
        serviceCategory: srv.name,
        scopeOfWork: scopeNotes.trim()
          ? [scopeNotes.trim(), ...(srv.packages[0]?.inclusions || [])]
          : srv.packages[0]?.inclusions || [
            'Full Setup & Responsive Design',
            'Lead Capture Form & WhatsApp Integration',
            'Basic On-page SEO'
          ],
        deliverables: [
          'High-converting mobile responsive design',
          'Lead contact form & direct click-to-WhatsApp link',
          'Free SSL & hosting deployment support'
        ],
        timeline: srv.packages[0]?.deliveryTimeline || '5 to 7 working days',
        subtotalINR: basePrice,
        discountPercentage: Number(discountPercent),
        termsAndConditions: [
          'Payment: 30% advance due before project start; remaining 70% payable as each feature/milestone is completed and approved.',
          'Milestones & Review: Deliverables are split by feature; you\'ll have 5 business days to review and sign off on each one. Without feedback, milestones are deemed accepted.'
        ],
        closingNote: 'Thank you for your business!',
        approvalStatus: Number(discountPercent) > 10 ? 'pending_manager_approval' : 'pending_support_dispatch',
        managerComments: supportInstructions.trim() ? `Agent Notes for Support: ${supportInstructions.trim()}` : undefined
      });

      setProposals((prev) => {
        const key = (created.proposalNumber && created.proposalNumber.trim()) || created.id;
        const exists = prev.some((p) => ((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key);
        if (exists) {
          return prev.map((p) => (((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key ? { ...p, ...created } : p));
        }
        return [created, ...prev];
      });
      setShowCreateModal(false);
      setDispatchSuccessMsg(
        `Quotation request for "${clientCompany}" submitted! Support Team will format, create quotation, and dispatch to customer.`
      );
      setTimeout(() => setDispatchSuccessMsg(''), 6000);

      // Reset form
      setClientName('');
      setClientCompany('');
      setClientPhone('');
      setClientCity('');
      setDiscountPercent(0);
      setCustomPrice('');
      setScopeNotes('');
      setSupportInstructions('');
    } catch (err) {
      console.error('Failed to create proposal request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Support Team / Manager: Dispatch Quotation to Customer & Update CRM
  const handleMarkDispatched = async (propId: string) => {
    try {
      const updated = await api.updateProposalDispatch(propId, {
        status: 'sent_to_client',
        dispatchedBy: currentUser?.name || 'Support Team',
        supportNotes: 'Official quotation verified & dispatched to customer.'
      });
      setProposals(proposals.map((p) => (p.id === propId ? updated : p)));
      if (viewingProposal?.id === propId) setViewingProposal(updated);
      setDispatchSuccessMsg(`Quotation marked as dispatched to customer in CRM!`);
      setTimeout(() => setDispatchSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to update dispatch status:', err);
    }
  };

  const handleUpdateStatus = async (propId: string, newStatus: string) => {
    try {
      const updated = await api.updateProposalStatus(propId, newStatus, 'Status updated by authorized manager');
      setProposals(proposals.map((p) => (p.id === propId ? updated : p)));
      if (viewingProposal?.id === propId) setViewingProposal(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // WhatsApp link for sending quotation to client
  const getQuotationWhatsAppLink = (prop: Proposal) => {
    const cleanPhone = (prop.clientPhone || '').replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const message = `Namaste ${prop.clientName || "Sir/Ma'am"},

Greetings from Vahlay Digital! As discussed with your Sales Executive (${prop.agentName}), here is the official commercial quotation for *${prop.clientCompany}*:

📄 *Quotation No:* ${prop.proposalNumber}
💼 *Service Scope:* ${prop.serviceCategory}
⏱️ *Timeline:* ${prop.timeline}
💰 *Total Commercial Value:* ₹${prop.totalINR.toLocaleString('en-IN')}${prop.discountPercentage > 0 ? ` (Includes ${prop.discountPercentage}% approved discount)` : ''}

📌 *Key Deliverables Included:*
${prop.scopeOfWork.slice(0, 4).map((s) => `• ${s}`).join('\n')}

💳 *Payment Milestones:*
• 50% advance on project kickoff
• 50% upon demo review before live deployment

Please review the quotation and let us know your confirmation to initiate project onboarding.

Best Regards,
*Support & Delivery Desk*
Vahlay Digital
Website: https://vahlaydigital.com`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Quotation Requests...</p>
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
              Proposal & Quotation Requests Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Generate, track, and dispatch official commercial quotations with verified pricing and SLA turnaround.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab(viewTab === 'studio' ? 'pipeline' : 'studio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00BCD4] hover:bg-[#00acc1] text-white font-bold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,188,212,0.35)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {viewTab === 'studio' ? (
                <>
                  <FileText className="w-4 h-4 text-white" />
                  <span>View Pipeline Queue ({proposals.length})</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-white" />
                  <span>Create Quotation (Studio)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex-wrap">
        <button
          onClick={() => setViewTab('studio')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewTab === 'studio'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setViewTab('pipeline')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            viewTab === 'pipeline'
              ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          
          <span>Quotations Pipeline </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              viewTab === 'pipeline'
                ? 'bg-[#00BCD4]/10 text-[#008F9B]'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {proposals.length}
          </span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {dispatchSuccessMsg && (
        <div role="status" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button onClick={() => setDispatchSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: Quotation Studio (2-Column Form & Live Preview) */}
      {viewTab === 'studio' && (
        <div className="animate-in fade-in duration-150">
          <QuotationStudio
            onQuotationSubmitted={(newProp) => {
              setProposals((prev) => {
                const key = (newProp.proposalNumber && newProp.proposalNumber.trim()) || newProp.id;
                const exists = prev.some((p) => ((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key);
                if (exists) {
                  return prev.map((p) => (((p.proposalNumber && p.proposalNumber.trim()) || p.id) === key ? { ...p, ...newProp } : p));
                }
                return [newProp, ...prev];
              });
              setDispatchSuccessMsg(
                `Quotation #${newProp.proposalNumber} for "${newProp.clientCompany}" submitted to Support Team for recheck and customer dispatch!`
              );
              setTimeout(() => setDispatchSuccessMsg(''), 7000);
              setViewTab('pipeline');
            }}
          />
        </div>
      )}

      {/* TAB 2: Quotations Pipeline & Queue */}
      {viewTab === 'pipeline' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* 4 KPI Metrics Strip (Dashboard Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Requests */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">Total</span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Quotation Requests</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{kpis.total}</span>
              <span className="text-xs font-semibold text-slate-500">requests</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Raised by sales reps</span>
            <span className="font-semibold text-blue-600">All Time</span>
          </div>
        </div>

        {/* Card 2: In Support Queue */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60">
              In Queue
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">With Support Team</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-amber-600 tracking-tight">{kpis.pendingSupport}</span>
              <span className="text-xs font-semibold text-amber-700">pending</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Awaiting dispatch</span>
            <span className="font-semibold text-amber-600">Active SLA</span>
          </div>
        </div>

        {/* Card 3: Dispatched to Client */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
              Dispatched
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dispatched to Client</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-emerald-600 tracking-tight">{kpis.dispatched}</span>
              <span className="text-xs font-semibold text-emerald-700">delivered</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>WhatsApp / PDF sent</span>
            <span className="font-semibold text-emerald-600">Verified</span>
          </div>
        </div>

        {/* Card 4: Manager Approval Due */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/60">
              &gt; 10% Discount
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Manager Approval Due</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-rose-600 tracking-tight">{kpis.pendingManager}</span>
              <span className="text-xs font-semibold text-rose-700">pending</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Requires manager sign-off</span>
            <span className="font-semibold text-rose-600">Action Required</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quotation request by Quotation #, Company, Client, Phone, Service, or Agent..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00BCD4]/20 focus:border-[#00BCD4] font-medium transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              All Requests ({kpis.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending_support')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${statusFilter === 'pending_support'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                }`}
            >
              ⏳ In Support Queue ({kpis.pendingSupport})
            </button>
            <button
              onClick={() => setStatusFilter('dispatched')}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${statusFilter === 'dispatched'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
            >
              ✓ Dispatched to Client ({kpis.dispatched})
            </button>
            {kpis.pendingManager > 0 && (
              <button
                onClick={() => setStatusFilter('pending_manager')}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${statusFilter === 'pending_manager'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
                  }`}
              >
                ⚠️ Manager Approval ({kpis.pendingManager})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Quotation Requests Table (Clean, Full-Width Dashboard) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Quotation Requests Tracking</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredProposals.length}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {canDispatchQuotation ? 'Support Authority Active' : 'Sales Floor View'}
          </span>
        </div>

        {filteredProposals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">No quotation requests found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search query or filter options.'
                  : 'Click "+ Request Quotation from Support" to submit a client requirement.'}
              </p>
            </div>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="py-3.5 px-4">Quotation ID & Date</th>
                  <th className="py-3.5 px-4">Company & Client Contact</th>
                  <th className="py-3.5 px-4">Service Scope</th>
                  <th className="py-3.5 px-4">Quoted Value</th>
                  <th className="py-3.5 px-4">Sales Agent</th>
                  <th className="py-3.5 px-4">CRM Dispatch Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProposals.map((prop) => {
                  const isDispatched =
                    prop.approvalStatus === 'sent_to_client' ||
                    prop.approvalStatus === 'sent' ||
                    prop.approvalStatus === 'approved';
                  const isPendingManager = prop.approvalStatus === 'pending_manager_approval';
                  const isPendingSupport = prop.approvalStatus === 'pending_support_dispatch';

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setViewingProposal(prop)}
                    >
                      {/* 1. ID & Date */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 block w-max">
                          {prop.proposalNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {prop.createdAt}
                        </span>
                      </td>

                      {/* 2. Company & Contact */}
                      <td className="py-4 px-4 align-top max-w-[220px]">
                        <p className="font-bold text-slate-900 truncate">{prop.clientCompany}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                          {prop.clientName}
                        </p>
                       
                      </td>

                      {/* 3. Service Scope */}
                      <td className="py-4 px-4 align-top max-w-[200px]">
                        <p className="font-bold text-slate-800">{prop.serviceCategory}</p>
                       
                       
                      </td>

                      {/* 4. Value */}
                      <td className="py-4 px-4 align-top">
                        <p className="font-bold text-slate-900 text-sm">
                          ₹{prop.totalINR.toLocaleString('en-IN')}
                        </p>
                        {prop.discountPercentage > 0 && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {prop.discountPercentage}% Discount
                          </span>
                        )}
                      </td>

                      {/* 5. Sales Agent */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-medium text-slate-700">{prop.agentName}</span>
                      </td>

                      {/* 6. CRM Status */}
                      <td className="py-4 px-4 align-top">
                        {isDispatched ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Dispatched to Client</span>
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              By: {prop.dispatchedBy || 'Support Team'} {prop.dispatchedAt ? `(${prop.dispatchedAt})` : ''}
                            </span>
                          </div>
                        ) : isPendingManager ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Manager Approval Due</span>
                            </span>
                            <span className="text-[10px] text-rose-600 block mt-1 font-semibold">
                              Discount &gt; 10%
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>In Support Queue</span>
                            </span>
                            <span className="text-[10px] text-amber-700 block mt-1">
                              Support dispatch pending
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-4 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingProposal(prop)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>

                          {/* Quick Support / Manager actions */}
                          {canDispatchQuotation && !isDispatched && (
                            <button
                              onClick={() => handleMarkDispatched(prop.id)}
                              title="Mark Dispatched to Customer in CRM"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Sent</span>
                            </button>
                          )}

                          
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )}

      {/* ── Official Quotation Document Preview Modal (Live Paper Preview with Print & Dispatch) ── */}
      {viewingProposal && (
        <QuotationPreviewModal
          proposal={viewingProposal}
          onClose={() => setViewingProposal(null)}
          onDispatch={handleMarkDispatched}
          isSupportView={false}
        />
      )}

      {/* ── New Proposal Request Form Modal (For Sales Agents to submit to Support) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-xl p-6 sm:p-7 shadow-xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-1 border border-blue-200">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  <span>Support Team Quotation Request</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Submit Quotation Request to Support</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client requirements enter karein — Support Team proposal generate karke customer ko WhatsApp/PDF send karegi aur CRM update karegi.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposalRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Bansal Dental Clinic / Apex Logistics"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client / Contact Person *</label>
                  <div className="relative">
                    <UserRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Dr. Vivek Bansal"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client Mobile / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client City / Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      placeholder="e.g. Ahmedabad / Noida"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recommended Service *</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.packages[0]?.priceINR.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quoted Price / Offered Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Leave empty for standard package"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-blue-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Special Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Scope / Specific Deliverables Requested</label>
                <textarea
                  rows={2}
                  value={scopeNotes}
                  onChange={(e) => setScopeNotes(e.target.value)}
                  placeholder="e.g. 5 Pages website + Google Reviews Widget + Direct appointment booking form..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions for Support Team</label>
                <input
                  type="text"
                  value={supportInstructions}
                  onChange={(e) => setSupportInstructions(e.target.value)}
                  placeholder="e.g. Client requested PDF by 3 PM; negotiated 10% discount approved verbally."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                />
              </div>

              {/* Support routing notice */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Ye details submit hote hi <strong>Support Team Desk</strong> par chali jayengi. Support team quotation create karke customer ko WhatsApp & PDF format me deliver karegi aur CRM me dispatch update karegi.
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request to Support Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
