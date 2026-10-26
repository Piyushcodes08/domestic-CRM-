import React, { useState, useMemo } from 'react';
import {
  Users2,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Building,
  Shield,
  Eye,
  TrendingUp,
  X
} from 'lucide-react';
import { User as AppUser, Lead, Proposal } from '../../types';
import { AdminAgentModal } from './AdminAgentModal';
import { AgentDetailModal } from './AgentDetailModal';

type CreatableRole = 'sales_agent' | 'technical_support';

const ROLE_META: Record<string, { label: string; color: string }> = {
  sales_agent: { label: 'Agent', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  sales_manager: { label: 'Manager', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  technical_support: { label: 'Support', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  super_admin: { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' }
};

interface AdminAgentsTabProps {
  agents: AppUser[];
  leads?: Lead[];
  proposals?: Proposal[];
  agentDirectoryError: string | null;
  refreshAgentUsers: () => Promise<void>;
  updateAgentProfile: (agentId: string, updates: Partial<Pick<AppUser, 'name' | 'title' | 'department' | 'assignedTargetRevenueINR'>>) => Promise<AppUser>;
  deleteAgentProfile: (agentId: string) => Promise<void>;
  createUserAccount: (
    name: string, email: string, password: string,
    role: CreatableRole,
    options?: { title?: string; department?: string; assignedTargetRevenueINR?: number }
  ) => Promise<AppUser>;
}

export const AdminAgentsTab: React.FC<AdminAgentsTabProps> = ({
  agents,
  leads = [],
  proposals = [],
  agentDirectoryError,
  refreshAgentUsers,
  createUserAccount,
  updateAgentProfile,
  deleteAgentProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AppUser | null>(null);
  const [editingAgent, setEditingAgent] = useState<AppUser | null>(null);
  const [confirmDeleteAgent, setConfirmDeleteAgent] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    agents.forEach(a => { if (a.department) set.add(a.department); });
    return ['All', ...Array.from(set)];
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents
      .filter(agent => agent.role !== 'super_admin')
      .filter(agent => {
        const matchesSearch =
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || agent.role === roleFilter;
        const matchesDept = departmentFilter === 'All' || agent.department === departmentFilter;
        return matchesSearch && matchesRole && matchesDept;
      });
  }, [agents, searchQuery, roleFilter, departmentFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAgentUsers();
      setFeedbackMessage('Agent directory refreshed.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch {
      // handled in parent/error prop
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingAgent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (agent: AppUser) => {
    setEditingAgent(agent);
    setModalOpen(true);
  };

  const handleOpenDelete = (agent: AppUser) => {
    setConfirmDeleteAgent(agent);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteAgent) return;
    const agent = confirmDeleteAgent;
    setDeleting(true);
    try {
      await deleteAgentProfile(agent.id);
      setFeedbackMessage(`✅ ${agent.name} (${agent.email}) successfully removed.`);
      setTimeout(() => setFeedbackMessage(null), 3500);
      setConfirmDeleteAgent(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete agent.');
      setConfirmDeleteAgent(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    role: CreatableRole;
    title?: string;
    department?: string;
    assignedTargetRevenueINR?: number;
  }) => {
    await createUserAccount(data.name, data.email, data.password, data.role, {
      title: data.title,
      department: data.department,
      assignedTargetRevenueINR: data.assignedTargetRevenueINR
    });
    const roleMeta = ROLE_META[data.role];
    setFeedbackMessage(`✅ ${roleMeta?.label ?? 'Account'} created for ${data.name} — they can now login.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleEditSubmit = async (
    agentId: string,
    updates: Partial<Pick<AppUser, 'name' | 'title' | 'department' | 'assignedTargetRevenueINR'>>
  ) => {
    await updateAgentProfile(agentId, updates);
    setFeedbackMessage(`Agent profile updated.`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Directory Error Alert */}
      {agentDirectoryError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Firestore Access Notice</span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed">{agentDirectoryError}</p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or UID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-blue-500"
            >
              <option value="All">All Roles</option>
              <option value="sales_agent">Sales Agents</option>
              <option value="sales_manager">Sales Managers</option>
              <option value="technical_support">Technical Support</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold outline-none focus:border-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-2xs"
            title="Refresh directory"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Agent Name</th>
                <th className="py-3.5 px-4">Contact & Auth</th>
                <th className="py-3.5 px-4">Role & Dept</th>
                <th className="py-3.5 px-4">Monthly Target</th>
                <th className="py-3.5 px-4">Pipeline & Deals</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAgents.map((agent) => {
                const agentLeads = leads.filter(
                  l => l.agentId === agent.id || (l.agentName && l.agentName.toLowerCase() === agent.name.toLowerCase())
                );
                const wonCount = agentLeads.filter(l => l.status === 'won').length;
                const wonRevenue = agentLeads
                  .filter(l => l.status === 'won')
                  .reduce((sum, l) => sum + (l.quotationINR || l.estimatedBudgetINR || 0), 0) || agent.revenueGenerated || 0;

                return (
                  <tr
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    title="Click to view full agent profile & details"
                  >
                    {/* Name */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {agent.name.trim().slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                              {agent.name}
                            </p>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              View
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{agent.title || 'Sales Agent'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-800">{agent.email}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(agent.email);
                          }}
                          className="hover:text-blue-600 p-0.5 text-slate-400"
                          title="Copy email"
                        >
                          {copiedEmail === agent.email ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Joined: {agent.joinedDate || '2026-10-01'}</p>
                    </td>

                    {/* Role & Dept */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                          ROLE_META[agent.role]?.color ?? 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {ROLE_META[agent.role]?.label ?? agent.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        {agent.department || '—'}
                      </p>
                    </td>

                    {/* Monthly Target */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-emerald-800">
                        {agent.role === 'sales_agent' || agent.role === 'sales_manager'
                          ? `₹${(agent.assignedTargetRevenueINR || 0).toLocaleString('en-IN')}`
                          : '—'}
                      </p>
                      {wonRevenue > 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Won: ₹{wonRevenue.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>

                    {/* Pipeline & Deals */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                          {agentLeads.length} Leads
                        </span>
                        {wonCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-bold text-emerald-700">
                            {wonCount} Won
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-6 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgent(agent);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 font-bold transition text-xs cursor-pointer shadow-2xs"
                          title="View complete agent profile and performance"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(agent);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-xs cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDelete(agent);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-bold transition text-xs cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAgents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No team members found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try a different keyword.`
                        : 'No accounts in this directory yet. Use "Add Team Member" to create one.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Full Detail Modal */}
      <AgentDetailModal
        isOpen={Boolean(selectedAgent)}
        agent={selectedAgent}
        leads={leads}
        proposals={proposals}
        onClose={() => setSelectedAgent(null)}
        onEditAgent={handleOpenEdit}
      />

      {/* Create / Edit Modal */}
      <AdminAgentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitCreate={handleCreateSubmit}
        onSubmitEdit={handleEditSubmit}
        editingAgent={editingAgent}
      />

      {/* Remove Confirmation Modal */}
      {confirmDeleteAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
                <div className="p-2 bg-red-50 rounded-xl border border-red-200">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <span>Remove Team Member</span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteAgent(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{confirmDeleteAgent.name}</strong> (<span className="text-slate-700 font-medium">{confirmDeleteAgent.email}</span>) from the directory?
            </p>

            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>This will immediately revoke their access to the Vahlay CRM, quotations, and active sales pipelines.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteAgent(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Removing...' : 'Confirm Remove'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

