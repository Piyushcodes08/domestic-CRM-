import React from 'react';
import {
  Users2,
  Briefcase,
  ShieldAlert,
  Bot,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  FileText,
  BadgeIndianRupee,
  ClipboardList,
  Send,
  LifeBuoy,
  Megaphone,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Activity,
  Database,
  IndianRupee,
  PhoneCall,
  Trophy
} from 'lucide-react';
import { User, ServiceItem, ObjectionItem } from '../../types';
import { AdminTab } from './AdminHeader';

interface AdminOverviewTabProps {
  agents: User[];
  services: ServiceItem[];
  objections?: ObjectionItem[];
  masterDataCount?: number;
  monthlyTargetTotal: number;
  monthlyRevenueTotal: number;
  aiModel: string;
  currency: string;
  auditLogs: { timestamp: string; user: string; action: string }[];
  onTabChange: (tab: AdminTab) => void;
  onNavigate?: (path: string) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  agents,
  services,
  objections: _objections,
  masterDataCount = 0,
  monthlyTargetTotal,
  monthlyRevenueTotal,
  aiModel,
  currency,
  auditLogs,
  onTabChange,
  onNavigate
}) => {
  const crmModuleGroups = [
    {
      group: 'Sales Enablement Core',
      description: 'Training, live rep copilot, and AI call simulations',
      modules: [
        { label: 'Live Sales Copilot', path: '/sales-copilot', icon: Bot, desc: 'Real-time AI script and rebuttal prompt assist' }
      ]
    },
    {
      group: 'Domestic CRM & Pipeline',
      description: 'All agents leads, follow-ups, quotation requests, and commercial tools',
      modules: [
        { label: 'All Agents Leads', path: '/admin?tab=all_leads', icon: Users2, desc: 'Review and manage all customer leads across sales agents' },
        { label: 'All Agents Quotation Request', path: '/admin?tab=all_quotations', icon: Send, desc: 'Review, approve, and track commercial quotations' },
        { label: 'All Agents Follow-up', path: '/admin?tab=all_followups', icon: PhoneCall, desc: 'Monitor agent follow-up discipline and callback schedules' },
        { label: 'All Agents Deals', path: '/admin?tab=all_deals', icon: Trophy, desc: 'Track confirmed contracts and closed revenue across all agents' },
        { label: 'Approved Rate Chart', path: '/pricing', icon: BadgeIndianRupee, desc: 'Official package pricing & profit margins' },
      ]
    },
    {
      group: 'Team Announcements & Operations',
      description: 'Company-wide updates, manager oversight, and ticket queue',
      modules: [
        { label: 'Team Announcements', path: '/announcements', icon: Megaphone, desc: 'Company-wide updates and priority alerts' },
        { label: 'Manager Performance Hub', path: '/manager', icon: BarChart3, desc: 'Manager oversight, team targets & rep review' },
        { label: 'Tech Ticket Queue', path: '/support', icon: Server, desc: 'Engineering & delivery team ticket queue' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Agents */}
        <div
          onClick={() => onTabChange('agents')}
          className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Team Accounts</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{agents.length}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active in Firebase
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Monthly target: ₹{monthlyTargetTotal.toLocaleString('en-IN')}</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Services */}
        <div
          onClick={() => onTabChange('services')}
          className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Catalog</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{services.length}</span>
            <span className="text-xs font-semibold text-indigo-600">Active Services</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hinglish + English Pitch</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Catalog <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: All Agents Leads */}
        <div
          onClick={() => onTabChange('all_leads')}
          className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">All Agents Leads</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{masterDataCount}</span>
            <span className="text-xs font-semibold text-blue-600">Active Records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Admin Governance</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              View Leads <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Closed Revenue */}
        <div
          onClick={() => onTabChange('all_deals')}
          className="group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Revenue Closed This Month</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">₹{monthlyRevenueTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-slate-600 font-medium">Target: ₹{monthlyTargetTotal.toLocaleString('en-IN')}</span>
            <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              View Closures <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* System Infrastructure Health Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Governance & Security Posture</h3>
              <p className="text-xs text-slate-500">
                Firebase Authentication active • Firestore rules enforced • Primary currency set to {currency}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange('agents')}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              + Add Team Member
            </button>
            <button
              type="button"
              onClick={() => onTabChange('tasks')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold hover:bg-cyan-100 shadow-2xs cursor-pointer"
            >
              Assign Department Task
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('/announcements')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 shadow-2xs cursor-pointer"
            >
              Publish Announcement
            </button>
            <button
              type="button"
              onClick={() => onTabChange('services')}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              + Add Catalog Item
            </button>
            <button
              type="button"
              onClick={() => onTabChange('audit')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              View Full Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Complete Module Command Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Vahlay Digital CRM Ecosystem</h2>
            <p className="text-xs text-slate-500">Directly navigate and manage your CRM, sales, and team operations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crmModuleGroups.map((group) => (
            <div key={group.group} className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              <div className="mb-3.5 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">{group.group}</h3>
                  <p className="text-[11px] text-slate-500">{group.description}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                  {group.modules.length} Apps
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {group.modules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.path}
                      type="button"
                      onClick={() => onNavigate?.(mod.path)}
                      className="group flex flex-col justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-white text-slate-700 group-hover:text-blue-600 group-hover:bg-blue-100/60 transition-colors shadow-2xs border border-slate-200/50">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 truncate">
                            {mod.label}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500 group-hover:text-slate-600 line-clamp-2">
                        {mod.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Snippet */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent System Governance Events</h3>
            <p className="text-xs text-slate-500">Live operational changes, rate updates, and target resets</p>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('audit')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            All Logs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 3).map((log, index) => (
            <div
              key={index}
              className="flex items-start justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-150/70 text-xs"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">{log.action}</p>
                <p className="text-[11px] text-slate-500">Actor: <span className="font-semibold text-slate-700">{log.user}</span></p>
              </div>
              <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap bg-white px-2 py-1 rounded-lg border border-slate-200">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
