import React, { useMemo, useState } from 'react';
import { Building, CheckCircle2, IndianRupee, Search, Send, TrendingUp, Users } from 'lucide-react';
import { Lead, User as UserType } from '../../types';
import { getCurrentMonthWonRevenue } from '../../utils/salesMetrics';

interface ManagerTargetsTabProps {
  agents: UserType[];
  leads: Lead[];
  onSelectAgentProposals: (agentId: string) => void;
  onSelectAgentFollowups: (agentId: string) => void;
}

export const ManagerTargetsTab: React.FC<ManagerTargetsTabProps> = ({
  agents,
  leads,
  onSelectAgentProposals,
  onSelectAgentFollowups,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const agentMetrics = useMemo(() => agents.map((agent) => {
    const agentLeads = leads.filter((lead) => lead.agentId === agent.id);
    return {
      agent,
      monthlyRevenue: getCurrentMonthWonRevenue(agentLeads),
      wonClients: agentLeads.filter((lead) => lead.status === 'won').length,
    };
  }), [agents, leads]);

  const filteredAgents = agentMetrics.filter(({ agent }) =>
    `${agent.name} ${agent.email} ${agent.department}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalMonthlyTarget = agents.reduce((total, agent) => total + (agent.assignedTargetRevenueINR || 0), 0);
  const totalMonthlyRevenue = getCurrentMonthWonRevenue(leads);
  const wonClients = leads.filter((lead) => lead.status === 'won').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            Monthly team target <TrendingUp className="h-4 w-4 text-cyan-700" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">₹{totalMonthlyTarget.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-slate-500">Combined agent targets for this month</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            Revenue closed this month <IndianRupee className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-800">₹{totalMonthlyRevenue.toLocaleString('en-IN')}</p>
          <p className="mt-1 text-xs text-slate-500">Won leads recorded this calendar month</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            Total won clients <Users className="h-4 w-4 text-violet-700" />
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-800">{wonClients}</p>
          <p className="mt-1 text-xs text-slate-500">Across {agents.length} sales agents</p>
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search agents by name, email, or department..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:bg-white"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Agent</th>
                <th className="px-4 py-3">Monthly target</th>
                <th className="px-4 py-3">Closed this month</th>
                <th className="px-4 py-3">Target progress</th>
                <th className="px-4 py-3">Won clients</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAgents.map(({ agent, monthlyRevenue, wonClients: agentWonClients }) => {
                const target = agent.assignedTargetRevenueINR || 0;
                const progress = target ? Math.min(100, Math.round((monthlyRevenue / target) * 100)) : 0;
                return (
                  <tr key={agent.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{agent.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{agent.email}</p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Building size={12} />{agent.department}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold">₹{target.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-800">₹{monthlyRevenue.toLocaleString('en-IN')}</td>
                    <td className="min-w-36 px-4 py-4">
                      <div className="flex items-center justify-between text-[10px]">
                        <span>{target ? `${progress}%` : 'Not set'}</span>
                        {target > 0 && monthlyRevenue >= target && <CheckCircle2 size={13} className="text-emerald-600" />}
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold">{agentWonClients}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => onSelectAgentProposals(agent.id)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 font-bold text-blue-800 hover:bg-blue-100">
                          <Send size={12} /> Proposals
                        </button>
                        <button type="button" onClick={() => onSelectAgentFollowups(agent.id)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-bold text-slate-700 hover:bg-slate-50">
                          Follow-ups
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAgents.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No agents match that search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
