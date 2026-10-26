import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { SalesCopilot } from './pages/SalesCopilot';
import { PricingRateChart } from './pages/PricingRateChart';
import { ProposalManager } from './pages/ProposalManager';
import { LeadManagement } from './pages/LeadManagement';
import { QuizCenter } from './pages/QuizCenter';
import { AdminSettings } from './pages/AdminSettings';
import { TechnicalSupport } from './pages/TechnicalSupport';
import { Announcements } from './pages/Announcements';
import { AgentChat } from './pages/AgentChat';
import { LoginPage } from './pages/LoginPage';
import { SplashScreen } from './components/common/SplashScreen';

function AppShell() {
  const { currentUser, isAdmin, isManager, isSupport, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(
    () => (window.location.pathname || '/') + (window.location.search || '')
  );
  const [showSplash, setShowSplash] = useState(true);
  const [splashKey, setSplashKey] = useState(1);

  useEffect(() => {
    const handleReplay = () => {
      setSplashKey((k) => k + 1);
      setShowSplash(true);
    };
    window.addEventListener('vahlay_replay_splash', handleReplay);
    (window as any).__replaySplashScreen = handleReplay;
    return () => {
      window.removeEventListener('vahlay_replay_splash', handleReplay);
      delete (window as any).__replaySplashScreen;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading && !currentUser && currentPath !== '/login') {
      navigate('/login');
      return;
    }

    // Direct Support team AND Sales Manager to their dedicated Support/Operations Queue
    if (!loading && currentUser && (isSupport || isManager) && (
      currentPath === '/' ||
      currentPath === '/dashboard' ||
      currentPath === '/leads' ||
      currentPath === '/pipeline' ||
      currentPath === '/follow-ups' ||
      currentPath === '/deals' ||
      currentPath === '/clients' ||
      currentPath === '/agent-chat'
    )) {
      navigate('/support');
      return;
    }

    // Direct Admin team to Admin Command Center
    const isUserAdmin = Boolean(
      isAdmin ||
      currentUser?.role === 'super_admin' ||
      currentUser?.email?.toLowerCase().trim() === 'vahlaydigital@gmail.com'
    );
    if (!loading && currentUser && isUserAdmin && (
      currentPath === '/' ||
      currentPath === '/dashboard'
    )) {
      navigate('/admin');
      return;
    }

    // Keep the sales readiness quiz center out of the admin workspace.
    if (!loading && currentUser && isUserAdmin && currentPath.split('?')[0] === '/quizzes') {
      navigate('/admin');
      return;
    }

    // Direct Sales Agent away from admin/support routes only (allow '/' and '/dashboard')
    const isSalesAgent = Boolean(currentUser && !isUserAdmin && !isSupport && !isManager);
    if (!loading && currentUser && isSalesAgent && (
      currentPath.startsWith('/admin') ||
      currentPath.startsWith('/support')
    )) {
      navigate('/dashboard');
      return;
    }
  }, [loading, currentUser, isSupport, isAdmin, currentPath]);

  // Route matching
  const renderRoute = () => {
    const pathname = currentPath.split('?')[0];
    const isUserAdmin = Boolean(
      isAdmin ||
      currentUser?.role === 'super_admin' ||
      currentUser?.email?.toLowerCase().trim() === 'vahlaydigital@gmail.com'
    );

    if (pathname === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }

    if (pathname === '/' || pathname === '/dashboard') {
      if (isSupport || isManager) return <TechnicalSupport onNavigate={navigate} />;
      if (isUserAdmin) return <AdminSettings onNavigate={navigate} currentPath={currentPath} />;
      return <Dashboard onNavigate={navigate} />;
    }

    if (
      pathname.startsWith('/services') ||
      pathname.startsWith('/academy') ||
      pathname === '/objections' ||
      pathname === '/scripts' ||
      pathname === '/requirements' ||
      pathname === '/escalations' ||
      pathname === '/mock-calls'
    ) {
      // These features were removed — redirect to leads
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="pipeline" onNavigate={navigate} />;
    }

    if (pathname === '/pricing') {
      return <PricingRateChart onNavigate={navigate} />;
    }

    if (
      pathname === '/sales-copilot' ||
      pathname === '/copilot' ||
      pathname === '/live-sales-call'
    ) {
      return <SalesCopilot onNavigate={navigate} />;
    }

    if (pathname === '/agent-chat') {
      return <AgentChat currentPath={currentPath} />;
    }

    if (pathname === '/proposals') {
      return <ProposalManager />;
    }

    if (pathname === '/leads' || pathname === '/pipeline') {
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="pipeline" onNavigate={navigate} />;
    }

    if (pathname === '/add-lead') {
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="add-lead" onNavigate={navigate} />;
    }

    if (pathname === '/follow-ups') {
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="follow-ups" onNavigate={navigate} />;
    }

    if (pathname === '/deals') {
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="deals" onNavigate={navigate} />;
    }

    if (pathname === '/clients') {
      return (isSupport || isManager) ? <TechnicalSupport onNavigate={navigate} /> : <LeadManagement view="clients" onNavigate={navigate} />;
    }

    if (pathname === '/quizzes') {
      if (isUserAdmin) return <AdminSettings onNavigate={navigate} currentPath="/admin" />;
      return <QuizCenter onNavigate={navigate} />;
    }

    if (pathname === '/gamification' || pathname === '/achievements') {
      // Gamification page removed — redirect to announcements
      return <Announcements />;
    }

    if (pathname === '/manager' || pathname.startsWith('/manager/')) {
      // Manager is now merged into the Support & Operations interface
      const tab = pathname.includes('proposals') ? 'proposal_approvals'
        : pathname.includes('followups') || pathname.includes('follow') ? 'followup_radar'
        : pathname.includes('escalations') ? 'escalations_mgr'
        : pathname.includes('targets') ? 'agent_targets'
        : 'agent_targets';
      // Also check query param ?tab=
      const qTab = currentPath.includes('?') ? new URLSearchParams(currentPath.split('?')[1]).get('tab') : null;
      const resolvedTab = (qTab as any) || tab;
      return (isManager || isAdmin)
        ? <TechnicalSupport initialTab={resolvedTab as any} onNavigate={navigate} />
        : <Dashboard onNavigate={navigate} />;
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return isAdmin ? <AdminSettings onNavigate={navigate} currentPath={currentPath} /> : <Dashboard onNavigate={navigate} />;
    }

    if (pathname === '/support' || pathname.startsWith('/support/')) {
      const tab = pathname === '/support/quotations'
        ? 'quotation_requests'
        : (pathname === '/support/whatsapp-share' || pathname.startsWith('/support/whatsapp-share'))
        ? 'whatsapp_share'
        : pathname === '/support/tasks'
        ? 'department_tasks'
        : pathname === '/support/proposals'
        ? 'proposal_approvals'
        : pathname === '/support/followups'
        ? 'followup_radar'
        : pathname === '/support/escalations'
        ? 'escalations_mgr'
        : pathname === '/support/targets'
        ? 'agent_targets'
        : 'inbound_leads';
      // Also honour ?tab= query param
      const qTab = currentPath.includes('?') ? new URLSearchParams(currentPath.split('?')[1]).get('tab') : null;
      const resolvedTab = (qTab as any) || tab;
      return (currentUser?.role === 'technical_support' || isSupport || isAdmin || isManager)
        ? <TechnicalSupport initialTab={resolvedTab as any} onNavigate={navigate} />
        : <Dashboard onNavigate={navigate} />;
    }

    if (pathname === '/announcements') {
      return <Announcements />;
    }

    return <Dashboard onNavigate={navigate} />;
  };

  if (showSplash) {
    return (
      <SplashScreen
        key={splashKey}
        minDisplayTime={10000}
        onComplete={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  return (
    <Layout currentPath={currentPath} onNavigate={navigate}>
      {renderRoute()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
