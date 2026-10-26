import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth, DEFAULT_AGENT_USER, DEFAULT_SUPPORT_USER } from '../context/AuthContext';
import { api } from '../services/api';
import { ServiceItem, ObjectionItem, Proposal, Lead } from '../types';
import { AdminHeader, AdminTab } from '../components/admin/AdminHeader';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminAgentsTab } from '../components/admin/AdminAgentsTab';
import { AdminServicesTab } from '../components/admin/AdminServicesTab';
import { AdminAllLeadsTab } from '../components/admin/AdminAllLeadsTab';
import { AdminAllQuotationsTab } from '../components/admin/AdminAllQuotationsTab';
import { AdminAllFollowUpsTab } from '../components/admin/AdminAllFollowUpsTab';
import { AdminAllDealsTab } from '../components/admin/AdminAllDealsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { AdminAuditTab, AuditLogEntry } from '../components/admin/AdminAuditTab';
import { DepartmentTasks } from '../components/admin/DepartmentTasks';
import { getCurrentMonthWonRevenue } from '../utils/salesMetrics';

interface AdminSettingsProps {
  onNavigate?: (path: string) => void;
  currentPath?: string;
}

const VALID_ADMIN_TABS: AdminTab[] = [
  'overview',
  'tasks',
  'agents',
  'all_leads',
  'all_quotations',
  'all_followups',
  'all_deals',
  'services',
  'settings',
  'audit'
];

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate, currentPath }) => {
  const {
    currentUser,
    allUsers,
    agentDirectoryError,
    refreshAgentUsers,
    createUserAccount,
    updateAgentProfile,
    deleteAgentProfile
  } = useAuth();

  // Tab state (sync with query param if present)
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const search = currentPath && currentPath.includes('?')
      ? currentPath.split('?')[1]
      : window.location.search.slice(1);
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab') as AdminTab;
    if (tabParam === 'master_data') return 'all_leads';
    if (VALID_ADMIN_TABS.includes(tabParam)) {
      return tabParam;
    }
    return 'overview';
  });

  // Re-sync activeTab when currentPath changes (e.g. from sidebar clicks)
  useEffect(() => {
    const search = currentPath && currentPath.includes('?')
      ? currentPath.split('?')[1]
      : window.location.search.slice(1);
    const params = new URLSearchParams(search);
    let tabParam = params.get('tab') as AdminTab;
    if (tabParam === 'master_data') tabParam = 'all_leads';
    if (tabParam && VALID_ADMIN_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [currentPath]);

  // Global Settings State
  const [aiModel] = useState('gemini-3.8-flash');
  const [currency] = useState('INR (₹)');

  // Catalogs State
  const [serviceCatalog, setServiceCatalog] = useState<ServiceItem[]>([]);
  const [objectionCatalog, setObjectionCatalog] = useState<ObjectionItem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isRefreshingMasterData, setIsRefreshingMasterData] = useState(false);
  const [masterDataLoadError, setMasterDataLoadError] = useState<string | null>(null);

  // System Audit Trail
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      timestamp: '2026-10-18 11:30:00',
      user: 'Piyush Gond (Super Admin)',
      action: 'Verified production security rules & agent access controls',
      category: 'Security'
    },
    {
      timestamp: '2026-10-15 15:00:00',
      user: 'Piyush Gond (Super Admin)',
      action: 'Synchronized Master Rate Cards & 13 active service packages',
      category: 'Pricing'
    },
    {
      timestamp: '2026-10-12 11:42:15',
      user: 'Piyush Gond (Super Admin)',
      action: 'Configured automated quotation dispatch & technical support pipeline',
      category: 'Pricing'
    }
  ]);

  // Sync tab change to URL
  const handleTabChange = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Redirect legacy or unsupported admin tabs to overview.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'objections') {
      handleTabChange('overview');
    }
  }, [handleTabChange]);

  // Keep administrative account management focused on delivery and sales staff.
  const teamMembers = useMemo(() => {
    const map = new Map<string, typeof allUsers[0]>();

    // 1. All users loaded from Firestore/auth who are not super_admin
    allUsers.forEach((u) => {
      if (u.role !== 'super_admin') {
        map.set(u.id, u);
      }
    });

    // 2. Deleted user IDs safeguard from localStorage
    const deletedIds = typeof window !== 'undefined'
      ? new Set(JSON.parse(localStorage.getItem('vahlay_deleted_user_ids') || '[]'))
      : new Set();

    // 3. Ensure default agent profile is present if not deleted
    if (!deletedIds.has(DEFAULT_AGENT_USER.id) && !deletedIds.has(DEFAULT_AGENT_USER.email.toLowerCase())) {
      const emailExists = Array.from(map.values()).some(u => u.email.toLowerCase() === DEFAULT_AGENT_USER.email.toLowerCase());
      if (!map.has(DEFAULT_AGENT_USER.id) && !emailExists) {
        map.set(DEFAULT_AGENT_USER.id, DEFAULT_AGENT_USER);
      }
    }

    // 4. Ensure default support profile is present if not deleted
    if (!deletedIds.has(DEFAULT_SUPPORT_USER.id) && !deletedIds.has(DEFAULT_SUPPORT_USER.email.toLowerCase())) {
      const emailExists = Array.from(map.values()).some(u => u.email.toLowerCase() === DEFAULT_SUPPORT_USER.email.toLowerCase());
      if (!map.has(DEFAULT_SUPPORT_USER.id) && !emailExists) {
        map.set(DEFAULT_SUPPORT_USER.id, DEFAULT_SUPPORT_USER);
      }
    }

    // 5. Also surface any agents discovered in CRM leads
    leads.forEach((l) => {
      if (l.agentId && !map.has(l.agentId) && !deletedIds.has(l.agentId)) {
        map.set(l.agentId, {
          id: l.agentId,
          name: l.agentName || 'Sales Agent',
          email: `${l.agentId}@vahlay.com`,
          role: 'sales_agent',
          avatar: '',
          title: 'Sales Agent',
          phone: '+91 83479 30515',
          department: 'Domestic Inside Sales',
          joinedDate: '2026-10-01',
          readinessScore: 85,
          learningXp: 1500,
          streakDays: 5,
          completedLessons: [],
          completedQuizzes: [],
          badges: ['badge-starter'],
          assignedTargetRevenueINR: 50000,
          leadsWon: 0,
          revenueGenerated: 0
        });
      }
    });

    return Array.from(map.values());
  }, [allUsers, leads]);

  const supportUsers = teamMembers.filter((user) => user.role === 'technical_support');
  const agents = teamMembers.filter((user) => user.role === 'sales_agent' || user.role === 'sales_manager');

  // Load catalogs and business data on mount
  useEffect(() => {
    void refreshAgentUsers();
    void loadServices();
    void loadObjections();
    void loadMasterBusinessData();
  }, [refreshAgentUsers]);

  const loadServices = async () => {
    try {
      const list = await api.getServices();
      setServiceCatalog(list);
    } catch (error) {
      console.error('Failed to load services in admin panel:', error);
    }
  };

  const loadObjections = async () => {
    try {
      const list = await api.getObjections();
      setObjectionCatalog(list);
    } catch (error) {
      console.error('Failed to load objections in admin panel:', error);
    }
  };

  const loadMasterBusinessData = async () => {
    setIsRefreshingMasterData(true);
    setMasterDataLoadError(null);
    try {
      const [props, lds] = await Promise.all([api.getProposals(), api.getLeads()]);
      setProposals(props);
      setLeads(lds.leads || []);
    } catch (err) {
      console.error('Failed to load master data:', err);
      setMasterDataLoadError(err instanceof Error ? err.message : 'Could not load leads and quotations.');
    } finally {
      setIsRefreshingMasterData(false);
    }
  };

  // Service Handlers (Full CRUD)
  const handleAddService = async (payload: Partial<ServiceItem>) => {
    const created = await api.createService(payload);
    setServiceCatalog((prev) => [created, ...prev]);
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
        action: `Added new service offering "${created.name}" (₹${created.packages[0]?.priceINR?.toLocaleString('en-IN')})`,
        category: 'Pricing'
      },
      ...prev
    ]);
  };

  const handleUpdateService = async (id: string, payload: Partial<ServiceItem>) => {
    const updated = await api.updateService(id, payload);
    setServiceCatalog((prev) => prev.map((item) => (item.id === id ? updated : item)));
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
        action: `Modified service offering "${updated.name}" specifications and pricing`,
        category: 'Pricing'
      },
      ...prev
    ]);
  };

  const handleDeleteService = async (id: string) => {
    const srv = serviceCatalog.find((s) => s.id === id);
    await api.deleteService(id);
    setServiceCatalog((prev) => prev.filter((item) => item.id !== id));
    if (srv) {
      setAuditLogs((prev) => [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
          action: `Removed service "${srv.name}" from catalog`,
          category: 'Pricing'
        },
        ...prev
      ]);
    }
  };

  // Super Admin Master Data CRUD: Delete Proposal, Override Proposal, Delete Lead
  const handleDeleteProposal = async (id: string) => {
    const p = proposals.find((x) => x.id === id);
    await api.deleteProposal(id);
    setProposals((prev) => prev.filter((x) => x.id !== id));
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
        action: `Super Admin permanently deleted proposal ${p?.proposalNumber || id} for client ${p?.clientName || 'N/A'}`,
        category: 'Proposal'
      },
      ...prev
    ]);
  };

  const handleOverrideProposalStatus = async (id: string, status: Proposal['approvalStatus']) => {
    const updated = await api.updateProposalStatus(id, status, 'Status overridden by Super Admin authority');
    setProposals((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
        action: `Super Admin overridden proposal ${updated.proposalNumber} status to "${status}"`,
        category: 'Proposal'
      },
      ...prev
    ]);
  };

  const handleDeleteLead = async (id: string) => {
    const lead = leads.find((l) => l.id === id);
    await api.deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setAuditLogs((prev) => [
      {
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        user: `${currentUser?.name || 'Super Admin'} (Super Admin)`,
        action: `Super Admin permanently deleted CRM lead ${lead?.businessName || id}`,
        category: 'Security'
      },
      ...prev
    ]);
  };

  const handleUpdateLead = async (id: string, status: Lead['status']) => {
    const updated = await api.updateLead(id, { status });
    setLeads((previous) => previous.map((lead) => lead.id === id ? updated : lead));
  };

  const handleUpdateLeadNotes = async (id: string, notes: string) => {
    const updated = await api.updateLead(id, { notes });
    setLeads((previous) => previous.map((lead) => lead.id === id ? updated : lead));
  };

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads((previous) => previous.map((lead) => lead.id === updatedLead.id ? updatedLead : lead));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      {/* Header Banner & Navigation Tabs */}
      <AdminHeader activeTab={activeTab} />

      {activeTab === 'tasks' && (
        <DepartmentTasks canAssign supportUsers={supportUsers} />
      )}

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <AdminOverviewTab
          agents={teamMembers}
          services={serviceCatalog}
          masterDataCount={proposals.length + leads.length}
          monthlyTargetTotal={agents.reduce((sum, agent) => sum + (agent.assignedTargetRevenueINR || 0), 0)}
          monthlyRevenueTotal={getCurrentMonthWonRevenue(leads)}
          aiModel={aiModel}
          currency={currency}
          auditLogs={auditLogs}
          onTabChange={handleTabChange}
          onNavigate={onNavigate}
        />
      )}

      {/* Tab 2: Team Members & Directory */}
      {activeTab === 'agents' && (
        <AdminAgentsTab
          agents={teamMembers}
          leads={leads}
          proposals={proposals}
          agentDirectoryError={agentDirectoryError}
          refreshAgentUsers={refreshAgentUsers}
          createUserAccount={createUserAccount}
          updateAgentProfile={updateAgentProfile}
          deleteAgentProfile={deleteAgentProfile}
        />
      )}

      {/* Tab: All Agents Leads */}
      {(activeTab === 'all_leads' || activeTab === 'master_data') && (
        <AdminAllLeadsTab
          leads={leads}
          agents={teamMembers}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onRefresh={loadMasterBusinessData}
          isRefreshing={isRefreshingMasterData}
          loadError={masterDataLoadError}
          onLeadUpdated={handleLeadUpdated}
        />
      )}

      {/* Tab: All Agents Quotation Request */}
      {activeTab === 'all_quotations' && (
        <AdminAllQuotationsTab
          proposals={proposals}
          agents={teamMembers}
          onDeleteProposal={handleDeleteProposal}
          onOverrideProposalStatus={handleOverrideProposalStatus}
          onRefresh={loadMasterBusinessData}
          isRefreshing={isRefreshingMasterData}
          loadError={masterDataLoadError}
        />
      )}

      {/* Tab: All Agents Follow-up */}
      {activeTab === 'all_followups' && (
        <AdminAllFollowUpsTab
          leads={leads}
          agents={teamMembers}
          onUpdateLeadNotes={handleUpdateLeadNotes}
          onUpdateLeadStatus={handleUpdateLead}
          onRefresh={loadMasterBusinessData}
          isRefreshing={isRefreshingMasterData}
          onLeadUpdated={handleLeadUpdated}
        />
      )}

      {/* Tab: All Agents Deals */}
      {activeTab === 'all_deals' && (
        <AdminAllDealsTab
          leads={leads}
          agents={teamMembers}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onRefresh={loadMasterBusinessData}
          isRefreshing={isRefreshingMasterData}
          loadError={masterDataLoadError}
          onLeadUpdated={handleLeadUpdated}
        />
      )}

      {/* Tab 3: Service Catalog Manager (Full CRUD) */}
      {activeTab === 'services' && (
        <AdminServicesTab
          services={serviceCatalog}
          onAddService={handleAddService}
          onUpdateService={handleUpdateService}
          onDeleteService={handleDeleteService}
          onNavigate={onNavigate}
        />
      )}

      {/* Tab 6: AI & System Configurations */}
      {activeTab === 'settings' && (
        <AdminSettingsTab
          aiModel={aiModel}
          currency={currency}
          services={serviceCatalog}
          objections={objectionCatalog}
        />
      )}

      {/* Tab 7: Full Audit Trail */}
      {activeTab === 'audit' && <AdminAuditTab auditLogs={auditLogs} />}
    </div>
  );
};
export default AdminSettings;
