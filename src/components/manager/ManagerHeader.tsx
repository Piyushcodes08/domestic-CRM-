import React from 'react';
import {
  Users,
  Send,
  Calendar,
  AlertTriangle,
  Trophy,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export type ManagerTab = 'targets' | 'proposals' | 'followups' | 'escalations' | 'coaching';

interface ManagerHeaderProps {
  activeTab: ManagerTab;
  onTabChange: (tab: ManagerTab) => void;
  agentCount: number;
  totalCallsToday: number;
  totalTargetCalls: number;
  pendingProposalsCount: number;
  totalFollowupsCount: number;
  todayFollowupsCount: number;
  managerName?: string;
}

export const ManagerHeader: React.FC<ManagerHeaderProps> = ({
  activeTab,
  onTabChange,
  agentCount,
  totalCallsToday,
  totalTargetCalls,
  pendingProposalsCount,
  totalFollowupsCount,
  todayFollowupsCount,
  managerName = 'Sales Admin / Manager'
}) => {
  const tabs = [
    {
      id: 'targets' as ManagerTab,
      label: 'Agents & Daily Targets',
      shortLabel: 'Agents & Targets',
      icon: Users,
      badge: `${totalCallsToday}/${totalTargetCalls}`
    },
    {
      id: 'proposals' as ManagerTab,
      label: "All Agents' Proposals",
      shortLabel: 'Proposals',
      icon: Send,
      badge: pendingProposalsCount > 0 ? `${pendingProposalsCount} Pending` : null,
      badgeAlert: pendingProposalsCount > 0
    },
    {
      id: 'followups' as ManagerTab,
      label: "All Agents' Follow-ups & CRM",
      shortLabel: 'Follow-ups',
      icon: Calendar,
      badge: todayFollowupsCount > 0 ? `${todayFollowupsCount} Due Today` : totalFollowupsCount
    },
    {
      id: 'escalations' as ManagerTab,
      label: 'Escalations & Waivers',
      shortLabel: 'Escalations',
      icon: AlertTriangle,
      badge: null
    },
    {
      id: 'coaching' as ManagerTab,
      label: 'Performance & Coaching',
      shortLabel: 'Coaching',
      icon: Trophy,
      badge: null
    }
  ];

  const achievementRate = totalTargetCalls > 0 ? Math.round((totalCallsToday / totalTargetCalls) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              Admin & Sales Manager Command Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal">
              Live floor governance, agent call pacing metrics, proposal approvals, and escalation triage.
            </p>
          </div>

          {/* Quick Manager Stats Chip */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 self-start md:self-auto shrink-0 shadow-lg">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Team Target Progress</p>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white tracking-tight">{totalCallsToday}</span>
                <span className="text-xs text-slate-300 font-medium">/ {totalTargetCalls} calls</span>
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[11px] font-bold text-[#00E5A3]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{achievementRate}% achieved today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-[#E8EDF0]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${isActive
                ? 'bg-white text-[#17232B] shadow-xs border border-[#E8EDF0]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00AAB7]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${tab.badgeAlert
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                    : isActive
                      ? 'bg-[#E6FAF8] text-[#007A87]'
                      : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
