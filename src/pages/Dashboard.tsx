import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lead, Announcement } from '../types';
import { getCurrentMonthWonRevenue } from '../utils/salesMetrics';
import {
  Send,
  Trophy,
  ArrowRight,
  Sparkles,
  Clock,
  Briefcase,
  Plus,
  CheckCircle2,
  Calendar,
  Building2,
  TrendingUp,
  X,
  ChevronRight,
  Phone,
  ArrowUpRight,
  User,
  Check,
  FileText,
  Award,
  Activity,
  Handshake,
  Zap,
  Star,
  Flame,
  BarChart2,
  Bell,
  Layers,
  MessageSquare,
  RefreshCw,
  PhoneCall,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Lead Modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [quickForm, setQuickForm] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    city: '',
    serviceInterest: 'Static Website Development (₹12,000+)',
    estimatedBudgetINR: 15000,
    isHighPriority: false,
    notes: ''
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState('');
  const [pipelineView, setPipelineView] = useState<'pipeline' | 'list'>('pipeline');
  const [tasks, setTasks] = useState<{ id: number; title: string; desc: string; time: string; completed: boolean }[]>([]);

  // Load CRM data + live subscriptions
  useEffect(() => {
    const load = async () => {
      try {
        const [l, a] = await Promise.all([
          api.getLeads(),
          api.getAnnouncements()
        ]);
        setLeads(l.leads || []);
        setAnnouncements(a || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    const unsubLeads = api.subscribeLeads((updated) => {
      setLeads((prev) => {
        if (updated.length > 1) return updated;
        if (updated.length === 1) {
          const single = updated[0];
          const exists = prev.some((l) => l.id === single.id);
          return exists ? prev.map((l) => (l.id === single.id ? { ...l, ...single } : l)) : [single, ...prev];
        }
        return prev;
      });
    });

    const unsubAnn = api.subscribeAnnouncements((updated) => {
      if (updated.length > 0) setAnnouncements(updated);
    });

    return () => { unsubLeads(); unsubAnn(); };
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const agentDisplayName = currentUser?.name && currentUser.name !== 'vahlaydigital' && !currentUser.name.includes('@')
    ? currentUser.name : 'Agent';
  const firstName = agentDisplayName.split(' ')[0] || 'Agent';

  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDisplay = useMemo(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), []);

  const activeLeads = useMemo(() => leads.filter(l => l.status !== 'won' && l.status !== 'lost'), [leads]);
  const pipelineValue = useMemo(() => activeLeads.reduce((acc, l) => acc + (l.quotationINR || l.estimatedBudgetINR || 0), 0), [activeLeads]);
  const wonLeads = useMemo(() => leads.filter(l => l.status === 'won'), [leads]);
  const wonRevenue = useMemo(() => wonLeads.reduce((acc, l) => acc + (l.quotationINR || l.estimatedBudgetINR || 0), 0), [wonLeads]);
  const followUpsDue = useMemo(() => leads.filter(l => l.status !== 'won' && l.status !== 'lost' && (l.nextFollowUpDate <= todayStr || l.followUpStatus === 'pending')), [leads, todayStr]);
  const avgDealValue = useMemo(() => activeLeads.length === 0 ? 0 : Math.round(pipelineValue / activeLeads.length), [activeLeads, pipelineValue]);

  // Monthly revenue target
  const revenueTarget = currentUser?.assignedTargetRevenueINR || 0;
  const revenueAchieved = getCurrentMonthWonRevenue(leads, currentUser?.id);
  const revenuePct = revenueTarget > 0 ? Math.min(100, Math.round((revenueAchieved / revenueTarget) * 100)) : 0;

  // Gamification
  const xp = currentUser?.learningXp || 0;
  const readiness = currentUser?.readinessScore || 0;
  const streak = currentUser?.streakDays || 0;
  const badgesCount = currentUser?.badges?.length || 0;

  // INR formatter
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${Math.round(n / 1000)}k`;
    return `₹${n}`;
  };

  // Conversion rate
  const conversionRate = leads.length > 0 ? ((wonLeads.length / leads.length) * 100).toFixed(1) : '0.0';

  // Funnel stages
  const funnelStages = useMemo(() => {
    const calc = (stageLeads: Lead[]) => {
      const sum = stageLeads.reduce((acc, l) => acc + (l.quotationINR || l.estimatedBudgetINR || 0), 0);
      return fmt(sum) === '₹0' ? '—' : fmt(sum);
    };
    return [
      { key: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length, subtext: calc(leads.filter(l => l.status === 'new')), icon: User, color: '#1877F2', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
      { key: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, subtext: calc(leads.filter(l => l.status === 'contacted')), icon: Phone, color: '#7848FF', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
      { key: 'qualified', label: 'Qualified', count: leads.filter(l => l.status === 'qualified').length, subtext: calc(leads.filter(l => l.status === 'qualified')), icon: Check, color: '#00BA88', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
      { key: 'proposal_sent', label: 'Quote Sent', count: leads.filter(l => l.status === 'proposal_sent').length, subtext: calc(leads.filter(l => l.status === 'proposal_sent')), icon: FileText, color: '#6366F1', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
      { key: 'negotiation', label: 'Negotiation', count: leads.filter(l => l.status === 'negotiation').length, subtext: calc(leads.filter(l => l.status === 'negotiation')), icon: Handshake, color: '#D97706', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
      { key: 'won', label: 'Closed Won', count: wonLeads.length, subtext: calc(wonLeads), icon: Award, color: '#16A34A', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' },
    ];
  }, [leads, wonLeads]);

  // Dynamic tasks from follow-ups
  const dynamicTasks = useMemo(() => followUpsDue.slice(0, 5).map((l, idx) => ({
    id: idx + 1,
    title: `Follow up with ${l.businessName}`,
    desc: l.serviceInterest || 'Callback pending',
    time: l.callbackTimeSlot || (l.nextFollowUpDate === todayStr ? 'Today' : l.nextFollowUpDate),
    completed: l.followUpStatus === 'completed'
  })), [followUpsDue, todayStr]);

  useEffect(() => { setTasks(dynamicTasks); }, [dynamicTasks]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const list: { id: string; icon: any; iconBg: string; title: string; subtitle: string; time: string; badge?: string; badgeColor?: string }[] = [];
    [...leads].reverse().slice(0, 5).forEach((l) => {
      if (l.status === 'won') {
        list.push({ id: `won-${l.id}`, icon: CheckCircle2, iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', title: 'Deal closed', subtitle: `${l.businessName} · ${fmt(l.quotationINR || l.estimatedBudgetINR || 0)}`, time: l.lastContactDate || 'Recently', badge: 'Won', badgeColor: 'bg-emerald-100 text-emerald-700' });
      } else if (l.status === 'proposal_sent') {
        list.push({ id: `prop-${l.id}`, icon: Send, iconBg: 'bg-purple-50 text-purple-600 border-purple-100', title: 'Proposal sent', subtitle: `${l.businessName} · ${fmt(l.quotationINR || l.estimatedBudgetINR || 0)}`, time: l.lastContactDate || 'Recently', badge: 'Proposal', badgeColor: 'bg-purple-100 text-purple-700' });
      } else if (l.status === 'negotiation') {
        list.push({ id: `neg-${l.id}`, icon: Handshake, iconBg: 'bg-amber-50 text-amber-600 border-amber-100', title: 'In negotiation', subtitle: `${l.businessName} · ${l.serviceInterest}`, time: l.lastContactDate || 'Active', badge: 'Negotiation', badgeColor: 'bg-amber-100 text-amber-700' });
      } else if (l.followUpStatus === 'pending') {
        list.push({ id: `cb-${l.id}`, icon: Calendar, iconBg: 'bg-orange-50 text-orange-600 border-orange-100', title: 'Callback due', subtitle: `${l.contactPerson || l.businessName} · ${l.callbackTimeSlot || l.nextFollowUpDate || 'Pending'}`, time: l.lastContactDate || 'Pending', badge: 'Callback', badgeColor: 'bg-orange-100 text-orange-700' });
      } else {
        list.push({ id: `lead-${l.id}`, icon: Phone, iconBg: 'bg-blue-50 text-blue-600 border-blue-100', title: 'Lead added', subtitle: `${l.businessName} · ${l.city || 'Domestic'}`, time: l.lastContactDate || 'Active' });
      }
    });
    announcements.slice(0, 2).forEach((a) => {
      list.push({ id: `ann-${a.id}`, icon: Bell, iconBg: 'bg-sky-50 text-sky-600 border-sky-100', title: a.title, subtitle: a.category || 'Company Notice', time: a.date || 'Recent', badge: 'Notice', badgeColor: 'bg-sky-100 text-sky-700' });
    });
    return list.slice(0, 6);
  }, [leads, announcements]);

  // Quick lead submit
  const handleCreateQuickLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLead) return;
    if (!quickForm.businessName.trim() || !quickForm.phone.trim()) return;
    setIsSubmittingLead(true);
    try {
      const created = await api.createLead({
        businessName: quickForm.businessName.trim(),
        contactPerson: quickForm.contactPerson.trim() || quickForm.businessName.trim(),
        phone: quickForm.phone.trim(),
        city: quickForm.city.trim() || 'Noida, Delhi',
        industry: 'Business',
        serviceInterest: quickForm.serviceInterest.replace(/\s*\(.*\)/, ''),
        estimatedBudgetINR: Number(quickForm.estimatedBudgetINR) || 15000,
        status: 'new',
        leadSource: 'Inbound',
        lastContactDate: todayStr,
        nextFollowUpDate: todayStr,
        followUpStatus: 'pending',
        notes: quickForm.notes.trim() || 'Quick lead added via Overview Dashboard.',
        isHighPriority: quickForm.isHighPriority,
        agentId: currentUser?.id || 'agent-1',
        agentName: currentUser?.name || 'Sales Agent'
      });
      setLeads(prev => {
        if (prev.some(l => l.id === created.id)) return prev;
        return [created, ...prev];
      });
      setLeadSuccessMsg(`"${created.businessName}" added to pipeline!`);
      setTimeout(() => setLeadSuccessMsg(''), 4000);
      setQuickForm({ businessName: '', contactPerson: '', phone: '', city: '', serviceInterest: 'Static Website Development (₹12,000+)', estimatedBudgetINR: 15000, isHighPriority: false, notes: '' });
      setShowAddLeadModal(false);
    } catch (err) {
      console.error('Create lead error:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-[#00BCD4] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-14 w-full">

      {/* ── 1. Hero Greeting Banner ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-7 shadow-[0_4px_28px_rgba(0,0,0,0.22)] relative overflow-hidden text-white border border-[#103448]">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute right-0 bottom-0 w-[600px] h-[110px] opacity-30" viewBox="0 0 600 110" fill="none">
            <path d="M0 110 L100 65 L180 85 L290 35 L400 72 L490 20 L560 46 L600 28 L600 110 Z" fill="#0A3C4D" />
            <path d="M50 110 L165 72 L270 90 L370 46 L450 72 L540 35 L600 56 L600 110 Z" fill="#00D4DD" opacity="0.3" />
          </svg>
          <div className="absolute right-1/4 top-[-20px] w-[280px] h-[160px] bg-[#00D4DD]/12 rounded-full blur-3xl" />
          <div className="absolute left-[-40px] bottom-[-20px] w-[200px] h-[120px] bg-[#1677FF]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#00D4DD] rounded-full" />
              <p className="text-[11px] font-bold text-[#00D4DD] uppercase tracking-widest">Agent Workspace</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {greeting}, {firstName} {/*  */}
            </h1>
            <p className="text-sm text-slate-300/80 font-medium max-w-md">
              {todayDisplay} · Focus on moving your best opportunities forward.
            </p>

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-slate-200">
                <Layers className="w-3 h-3 text-[#00D4DD]" />
                <span>{activeLeads.length} Active Leads</span>
              </div>
              {followUpsDue.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFA000]/20 border border-[#FFA000]/30 text-xs font-semibold text-amber-200">
                  <Flame className="w-3 h-3 text-[#FFA000]" />
                  <span>{followUpsDue.length} Follow-ups Due</span>
                </div>
              )}
              {revenueTarget > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/20 text-xs font-semibold text-emerald-200">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{revenuePct}% of ₹{revenueTarget >= 100000 ? `${(revenueTarget / 100000).toFixed(1)}L` : `${Math.round(revenueTarget / 1000)}k`} target</span>
                </div>
              )}
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-slate-200">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{streak}-Day Streak</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick CTA buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/sales-copilot')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00BCD4] to-[#0097A7] hover:from-[#00ADC5] hover:to-[#00899A] text-white font-bold text-xs shadow-lg shadow-cyan-900/40 transition active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Sales Call</span>
            </button>
          </div>
        </div>

        {/* Success toast */}
        {leadSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{leadSuccessMsg}</span>
            </div>
            <button onClick={() => setLeadSuccessMsg('')} className="text-emerald-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── 2. KPI Cards Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">

        {/* Card 1: Monthly Revenue Target */}
        <div
          onClick={() => onNavigate('/deals')}
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#00BA88]/40 hover:shadow-[0_4px_20px_rgba(0,186,136,0.08)] transition cursor-pointer flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E6FBF5] text-[#00BA88] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            {revenueTarget > 0 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00BA88] bg-[#E6FBF5] px-2 py-0.5 rounded-full">
                {revenuePct}% Done
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                No target set
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Target</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              {revenueTarget > 0 ? (
                <>
                  <span className="text-2xl font-black text-slate-900">
                    {revenueAchieved >= 100000 ? `₹${(revenueAchieved / 100000).toFixed(1)}L` : revenueAchieved >= 1000 ? `₹${Math.round(revenueAchieved / 1000)}k` : `₹${revenueAchieved}`}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">
                    / {revenueTarget >= 100000 ? `₹${(revenueTarget / 100000).toFixed(1)}L` : `₹${Math.round(revenueTarget / 1000)}k`}
                  </span>
                </>
              ) : (
                <span className="text-base font-bold text-slate-400">Ask admin to set</span>
              )}
            </div>
          </div>
          <div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${revenuePct >= 100 ? 'bg-gradient-to-r from-[#00BA88] to-[#00D4DD]' : revenuePct >= 75 ? 'bg-gradient-to-r from-[#00BA88] to-[#16A34A]' : 'bg-gradient-to-r from-[#00BA88] to-[#34D399]'}`}
                style={{ width: `${revenuePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10.5px] font-medium text-slate-400">
                {revenueTarget > 0 ? `${revenuePct}% achieved` : 'Target assigned by admin'}
              </span>
              <span className="text-[10.5px] font-bold text-slate-500">
                {revenueTarget > 0 && revenueAchieved < revenueTarget
                  ? `${(revenueTarget - revenueAchieved) >= 100000 ? `₹${((revenueTarget - revenueAchieved) / 100000).toFixed(1)}L` : `₹${Math.round((revenueTarget - revenueAchieved) / 1000)}k`} left`
                  : revenueTarget > 0 ? '🎯 Achieved!' : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Pipeline */}
        <div
          onClick={() => onNavigate('/leads')}
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#00BA88]/40 hover:shadow-[0_4px_20px_rgba(0,186,136,0.08)] transition cursor-pointer flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E6FBF5] text-[#00BA88] flex items-center justify-center font-black text-lg">₹</div>
            <div className="flex items-center gap-1 text-[#00BA88]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{activeLeads.length} leads</span>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{fmt(pipelineValue)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-slate-400">Avg ticket</span>
            <span className="text-[11px] font-bold text-slate-700">{fmt(avgDealValue)}</span>
          </div>
        </div>

        {/* Card 3: Won Revenue */}
        <div
          onClick={() => onNavigate('/deals')}
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#7848FF]/40 hover:shadow-[0_4px_20px_rgba(120,72,255,0.08)] transition cursor-pointer flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#F2EDFD] text-[#7848FF] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex items-end gap-0.5 h-6">
              {[2, 3, 4, 5, 5].map((h, i) => (
                <div key={i} className="w-1.5 rounded-sm bg-[#7848FF]" style={{ height: `${h * 4}px`, opacity: 0.3 + i * 0.17 }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed Won</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{fmt(wonRevenue)}</span>
              <span className="text-sm font-semibold text-[#00BA88]">({wonLeads.length} deals)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-slate-400">Conversion</span>
            <span className="text-[11px] font-bold text-[#7848FF]">{conversionRate}%</span>
          </div>
        </div>

        {/* Card 4: Follow-ups Due */}
        <div
          onClick={() => onNavigate('/follow-ups')}
          className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#FFA000]/40 hover:shadow-[0_4px_20px_rgba(255,160,0,0.08)] transition cursor-pointer flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF3E0] text-[#FFA000] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            {followUpsDue.filter(l => l.isHighPriority).length > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
                <span className="text-[10px] font-bold text-[#E11D48]">{followUpsDue.filter(l => l.isHighPriority).length} Urgent</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow-ups Today</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-2xl font-black ${followUpsDue.length > 0 ? 'text-[#FFA000]' : 'text-slate-900'}`}>{followUpsDue.length}</span>
              <span className="text-sm font-semibold text-slate-400">pending</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-slate-400">Completed</span>
            <span className="text-[11px] font-bold text-slate-700">{followUpsDue.filter(l => l.followUpStatus === 'completed').length}/{followUpsDue.length}</span>
          </div>
        </div>
      </div>

      {/* ── 3. Middle Row: Performance + Pipeline + Activity ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Conversion & Performance (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#1677FF]" />
              <h3 className="text-sm font-extrabold text-slate-900">Performance</h3>
            </div>
            <button onClick={() => onNavigate('/leads')} className="text-xs font-bold text-[#1677FF] hover:underline cursor-pointer flex items-center gap-0.5">
              Pipeline <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Conversion donut */}
          <div className="flex items-center gap-4">
            <div className="relative w-[88px] h-[88px] shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="38" stroke="url(#perfGrad)" strokeWidth="10"
                  strokeDasharray="238"
                  strokeDashoffset={String(238 - (238 * parseFloat(conversionRate)) / 100)}
                  strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D4DD" />
                    <stop offset="100%" stopColor="#1677FF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[15px] font-black text-slate-900 leading-none">{conversionRate}%</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Won</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              {[
                { label: 'Total Leads', val: leads.length, color: '#1677FF' },
                { label: 'Qualified', val: leads.filter(l => ['qualified','proposal_sent','negotiation','won'].includes(l.status)).length, color: '#00BA88' },
                { label: 'Proposals', val: leads.filter(l => ['proposal_sent','negotiation','won'].includes(l.status)).length, color: '#7848FF' },
                { label: 'Closed Won', val: wonLeads.length, color: '#16A34A' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                    {row.label}
                  </div>
                  <span className="font-extrabold text-slate-800">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly revenue target progress */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[#00BA88]" />Monthly Target
              </span>
              {revenueTarget > 0 ? (
                <span className="font-extrabold text-[#00BA88]">
                  {revenueAchieved >= 100000 ? `₹${(revenueAchieved / 100000).toFixed(1)}L` : `₹${Math.round(revenueAchieved / 1000)}k`}
                  {' '}/{' '}
                  {revenueTarget >= 100000 ? `₹${(revenueTarget / 100000).toFixed(1)}L` : `₹${Math.round(revenueTarget / 1000)}k`}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">Set by admin</span>
              )}
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00BA88] to-[#00D4DD] rounded-full transition-all duration-700" style={{ width: `${revenuePct}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {revenueTarget > 0
                ? revenuePct >= 100
                  ? '🎯 Monthly target achieved!'
                  : `${revenuePct}% of monthly ₹ revenue target achieved`
                : 'Admin assigns monthly revenue targets per agent'}
            </p>
          </div>

          {/* Gamification mini-strip */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-purple-50 border border-purple-100 p-2.5 text-center">
              <p className="text-[9.5px] font-bold text-purple-400 uppercase tracking-wider">Learning XP</p>
              <p className="text-base font-black text-purple-700 mt-0.5">{xp.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-center">
              <p className="text-[9.5px] font-bold text-amber-400 uppercase tracking-wider">Readiness</p>
              <p className="text-base font-black text-amber-700 mt-0.5">{readiness}%</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-center">
              <p className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider">Streak</p>
              <p className="text-base font-black text-emerald-700 mt-0.5">{streak}d 🔥</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-center">
              <p className="text-[9.5px] font-bold text-blue-400 uppercase tracking-wider">Badges</p>
              <p className="text-base font-black text-blue-700 mt-0.5">{badgesCount} 🏅</p>
            </div>
          </div>
        </div>

        {/* Sales Pipeline Funnel (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#1677FF]" />
              <h3 className="text-sm font-extrabold text-slate-900">Sales Pipeline</h3>
            </div>
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
              {(['pipeline', 'list'] as const).map(v => (
                <button key={v} type="button" onClick={() => setPipelineView(v)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${pipelineView === v ? 'bg-[#1677FF] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {v === 'pipeline' ? 'Funnel' : 'List'}
                </button>
              ))}
            </div>
          </div>

          {pipelineView === 'pipeline' ? (
            <div className="space-y-2 flex-1">
              {funnelStages.map((st, idx) => {
                const Icon = st.icon;
                const total = leads.length || 1;
                const barPct = Math.min(100, Math.round((st.count / total) * 100));
                return (
                  <div key={st.key} onClick={() => onNavigate('/leads')}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition group">
                    <div className={`w-7 h-7 rounded-lg ${st.bg} border ${st.border} ${st.text} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-700">{st.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-medium text-slate-400">{st.subtext}</span>
                          <span className="text-xs font-black text-slate-900 w-5 text-right">{st.count}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: st.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {leads.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <Layers className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-500">Pipeline empty</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Add a lead to start tracking deals.</p>
                </div>
              ) : (
                leads.slice(0, 6).map(l => (
                  <div key={l.id} onClick={() => onNavigate('/leads')} className="py-2.5 px-1.5 flex items-center justify-between text-xs hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{l.businessName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{l.serviceInterest} · {l.city}</p>
                    </div>
                    <div className="ml-3 shrink-0 text-right">
                      <p className="font-bold text-[#1677FF]">{fmt(l.quotationINR || l.estimatedBudgetINR || 0)}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{l.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={() => onNavigate('/leads')}
            className="mt-1 w-full py-2 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-400 hover:text-[#1677FF] hover:border-[#1677FF] transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            View Full Pipeline
          </button>
        </div>

        {/* Recent Activity (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1677FF]" />
              <h3 className="text-sm font-extrabold text-slate-900">Activity</h3>
            </div>
            <button onClick={() => onNavigate('/announcements')} className="text-xs font-bold text-[#1677FF] hover:underline cursor-pointer flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Activity className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No recent activity</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Pipeline updates appear here live.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-50 flex-1">
              {recentActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-2.5 flex items-start gap-2.5 px-1 hover:bg-slate-50 rounded-xl transition">
                    <div className={`mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${act.iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">{act.title}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{act.subtitle}</p>
                      {act.badge && (
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${act.badgeColor}`}>{act.badge}</span>
                      )}
                    </div>
                    <span className="text-[9.5px] text-slate-400 font-medium shrink-0 mt-0.5">{act.time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Bottom Row: Upcoming Tasks + Announcements + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Upcoming Tasks */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1677FF]" />
              <h3 className="text-sm font-extrabold text-slate-900">Upcoming Tasks</h3>
            </div>
            <button onClick={() => onNavigate('/follow-ups')} className="text-xs font-bold text-[#1677FF] hover:underline cursor-pointer flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">All clear!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">No pending callbacks or follow-ups.</p>
            </div>
          ) : (
            <div className="space-y-1 flex-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${task.completed ? 'bg-[#1677FF] border-[#1677FF]' : 'border-slate-300 hover:border-[#1677FF]'}`}>
                    {task.completed && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{task.desc}</p>
                  </div>
                  <span className={`text-[9.5px] font-medium shrink-0 mt-0.5 ${task.time === 'Today' ? 'text-[#E11D48] font-bold' : 'text-slate-400'}`}>{task.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Announcements */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1677FF]" />
              <h3 className="text-sm font-extrabold text-slate-900">Announcements</h3>
            </div>
            <button onClick={() => onNavigate('/announcements')} className="text-xs font-bold text-[#1677FF] hover:underline cursor-pointer flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {announcements.slice(0, 4).map((ann) => (
                <div key={ann.id} onClick={() => onNavigate('/announcements')} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-sky-50/50 hover:border-sky-100 cursor-pointer transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{ann.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{ann.content}</p>
                    </div>
                    {ann.priority === 'high' && (
                      <span className="shrink-0 text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase">Urgent</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9.5px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full">{ann.category}</span>
                    <span className="text-[9.5px] text-slate-400">{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
            <Zap className="w-4 h-4 text-[#1677FF]" />
            <h3 className="text-sm font-extrabold text-slate-900">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-1 gap-2 flex-1">
            {[
              { label: 'Start Live Sales Call', sub: 'AI-powered script guidance', icon: Sparkles, color: '#00BCD4', bg: 'bg-cyan-50', path: '/sales-copilot', highlight: true },
              { label: 'View Lead Pipeline', sub: 'All active opportunities', icon: Layers, color: '#1677FF', bg: 'bg-blue-50', path: '/leads' },
              { label: 'Create Branded Quote', sub: 'Professional proposals', icon: Send, color: '#7848FF', bg: 'bg-purple-50', path: '/proposals' },
              { label: 'Approved Rate Chart', sub: 'Pricing & packages', icon: TrendingUp, color: '#00BA88', bg: 'bg-emerald-50', path: '/pricing' },
              { label: 'Follow-ups & Callbacks', sub: `${followUpsDue.length} pending today`, icon: PhoneCall, color: '#FFA000', bg: 'bg-amber-50', path: '/follow-ups' },
              { label: 'My Deals', sub: `${wonLeads.length} deals closed`, icon: Trophy, color: '#E11D48', bg: 'bg-rose-50', path: '/deals' },
              { label: 'Agent Chat', sub: 'Team communication', icon: MessageSquare, color: '#6366F1', bg: 'bg-indigo-50', path: '/agent-chat' },
              { label: 'My Clients', sub: 'Client directory', icon: Briefcase, color: '#16A34A', bg: 'bg-green-50', path: '/clients' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  type="button"
                  onClick={() => onNavigate(action.path)}
                  className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer text-left ${action.highlight
                    ? 'bg-gradient-to-r from-[#00BCD4]/10 to-[#1677FF]/10 border-[#00BCD4]/30 hover:from-[#00BCD4]/20 hover:to-[#1677FF]/20 hover:border-[#00BCD4]/50'
                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                >
                  <div className={`w-8 h-8 rounded-xl ${action.bg} flex items-center justify-center shrink-0`} style={{ color: action.color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{action.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{action.sub}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Add Lead Modal ─────────────────────────────────────────────── */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-[#1677FF]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Domestic Lead</h3>
                  <p className="text-xs text-slate-500">Capture client details into the CRM pipeline</p>
                </div>
              </div>
              <button onClick={() => setShowAddLeadModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickLead} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Company Name *</label>
                <input type="text" required placeholder="e.g. Apex Diagnostic & Healthcare" value={quickForm.businessName}
                  onChange={e => setQuickForm({ ...quickForm, businessName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input type="text" required placeholder="Owner / Decision Maker" value={quickForm.contactPerson}
                    onChange={e => setQuickForm({ ...quickForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input type="tel" required placeholder="+91 93765 43210" value={quickForm.phone}
                    onChange={e => setQuickForm({ ...quickForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City / Region</label>
                  <input type="text" placeholder="e.g. Noida, Delhi" value={quickForm.city}
                    onChange={e => setQuickForm({ ...quickForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget (₹)</label>
                  <input type="number" step="1000" value={quickForm.estimatedBudgetINR}
                    onChange={e => setQuickForm({ ...quickForm, estimatedBudgetINR: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Interest</label>
                <select value={quickForm.serviceInterest} onChange={e => setQuickForm({ ...quickForm, serviceInterest: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition text-slate-800">
                  <option>Static Website Development (₹12,000+)</option>
                  <option>Dynamic Website Development (₹22,000+)</option>
                  <option>E-Commerce Website Development (₹38,000+)</option>
                  <option>Search Engine Optimization (₹15,000/mo)</option>
                  <option>Meta Ads & Lead Gen (₹18,000/mo)</option>
                  <option>Custom CRM Software (₹45,000+)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea rows={2} placeholder="Any context about this lead…" value={quickForm.notes}
                  onChange={e => setQuickForm({ ...quickForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#1677FF]/30 focus:border-[#1677FF] outline-none transition resize-none" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={quickForm.isHighPriority} onChange={e => setQuickForm({ ...quickForm, isHighPriority: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1677FF] border-slate-300" />
                <span className="text-xs font-semibold text-slate-700">High Priority 🔥 (Urgent follow-up needed)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingLead}
                  className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-[#1565E0] text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 flex items-center gap-2">
                  {isSubmittingLead ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Plus className="w-3.5 h-3.5" /> Add to Pipeline</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
