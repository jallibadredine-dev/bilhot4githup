import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { supabase, SUPABASE_READY } from './lib/supabase';
import { LayoutDashboard, Monitor, MessageSquare, UserCheck, Menu, Clock, Sparkles, X } from 'lucide-react';
import { getCheckinTokenFromURL } from './lib/checkin';
import { clearSensitiveLocalState } from './lib/secureStorage';
import { useRealtimeSync, writeSystemLog, loadInitialStoreData } from './store/realtime';
import { useAppStore } from './store/appStore';

// Core Layout & Common Components (Eager Load)
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import OracleAssistant from './components/common/OracleAssistant';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/common/ToastContainer';
import { logError, logWarn } from './lib/errorHandler';
import { setAuthState } from './lib/authState';

// Lazy-loaded Views (Performance Optimization)
const TaskListView = lazy(() => import('./components/views/TaskListView'));
const TimelineView = lazy(() => import('./components/views/TimelineView'));

// Lazy-loaded Module Components (Performance Optimization)
const SmartAccess = lazy(() => import('./components/modules/SmartAccess'));
const ChannelManager = lazy(() => import('./components/modules/ChannelManager'));
const GuestJourneyDiagram = lazy(() => import('./components/modules/GuestJourneyDiagram'));
const ReportsDashboard = lazy(() => import('./components/modules/ReportsDashboard'));
const WebsiteBuilder = lazy(() => import('./components/modules/WebsiteBuilder'));
const WorkflowBuilder = lazy(() => import('./components/modules/WorkflowBuilder'));
const PropertyBuilder = lazy(() => import('./components/modules/PropertyBuilder'));
const SmartDesk = lazy(() => import('./components/modules/SmartDesk'));
const RevenueAI = lazy(() => import('./components/modules/RevenueAI'));
const PredictiveMaintenance = lazy(() => import('./components/modules/PredictiveMaintenance'));
const GuestCRM = lazy(() => import('./components/modules/GuestCRM'));
const ModularDashboard = lazy(() => import('./components/modules/ModularDashboard'));
const ServicesHub = lazy(() => import('./components/modules/ServicesHub'));
const BillingEngine = lazy(() => import('./components/modules/BillingEngine'));
const SystemAdmin = lazy(() => import('./components/modules/SystemAdmin'));
const UnifiedInbox = lazy(() => import('./components/modules/UnifiedInbox'));
const StaffHub = lazy(() => import('./components/modules/StaffHub'));
const AuthPage = lazy(() => import('./components/modules/AuthPage'));
const LandingPage = lazy(() => import('./components/modules/LandingPage'));
const SmartLockHub = lazy(() => import('./components/modules/SmartLockHub'));
const CardManagement = lazy(() => import('./components/modules/CardManagement'));
const SmartInventory = lazy(() => import('./components/modules/SmartInventory'));
const PropertiesManager = lazy(() => import('./components/modules/PropertiesManager'));
const SuperAdmin = lazy(() => import('./components/modules/SuperAdmin'));
const SuperAdminLogin = lazy(() => import('./components/modules/SuperAdminLogin'));
const ClientPlans = lazy(() => import('./components/modules/ClientPlans'));
const ReputationManager = lazy(() => import('./components/modules/ReputationManager'));
const SettingsDashboard = lazy(() => import('./components/modules/SettingsDashboard'));
const AffiliateSystem = lazy(() => import('./components/modules/AffiliateSystem'));
const AutomationHub = lazy(() => import('./components/modules/AutomationHub'));
const CheckinManager = lazy(() => import('./components/modules/CheckinManager'));
const GuestCheckinPage = lazy(() => import('./components/modules/GuestCheckinPage'));
const MoroccanPoliceForm = lazy(() => import('./components/modules/MoroccanPoliceForm'));
const APIDocumentation = lazy(() => import('./components/modules/APIDocumentation'));
const APIIntegration = lazy(() => import('./components/modules/APIIntegration'));
const APIDescription = lazy(() => import('./components/modules/APIDescription'));

// Fallback Loader UI
const LoadingFallback = () => (
  <div className="flex-center" style={{ height: '100%', width: '100%', color: 'var(--text-muted)' }}>
    <div className="spinner">Loading module...</div>
  </div>
);

function App() {
  // Activate Supabase real-time sync for shared PMS state (only runs when SUPABASE_READY)
  useRealtimeSync();

  // Global store actions — session and initial data are centralized
  const setStoreSession = useAppStore(s => s.setSession);
  const clearStoreSession = useAppStore(s => s.clearSession);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [pmsMode, setPmsMode] = useState('pro');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null); // { daysLeft: number, expired: boolean } | null

  useEffect(() => {
    if (!SUPABASE_READY) {
      setSessionChecked(true);
      return;
    }

    // Helper: check if a logged-in user is super_admin and redirect
    const checkSuperAdmin = async (user) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role === 'super_admin') {
          setActiveView('super-admin');
        }
      } catch (_) {}
    };

    // Helper: create profile row on first Google (or any OAuth) sign-in
    const ensureUserProfile = async (user) => {
      if (!user?.id) return;
      try {
        const { data: existing, error: fetchErr } = await supabase
          .from('profiles')
          .select('id, plan, trial_ends_at')
          .eq('id', user.id)
          .single();
        // PGRST116 = "no rows returned" — expected for new users; all other errors are real
        if (fetchErr && fetchErr.code !== 'PGRST116') {
          logWarn('auth', 'ensureUserProfile: could not check profile', { code: fetchErr.code, message: fetchErr.message });
          return;
        }
        if (!existing) {
          const displayName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] || '';
          const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
          const { error: upsertErr } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: displayName,
            email: user.email,
            role: 'user',
            plan: 'trial',
            trial_ends_at: trialEndsAt,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });
          if (upsertErr) {
            logError('auth', 'ensureUserProfile: could not create profile', { userId: user.id, error: upsertErr.message });
            writeSystemLog({ severity: 'error', module: 'auth', message: 'Profile creation failed', details: { userId: user.id, error: upsertErr.message } });
          }
          // New user → set trial banner info
          setTrialInfo({ daysLeft: 14, expired: false });
        } else if (existing.plan === 'trial' && existing.trial_ends_at) {
          // Existing trial user → compute remaining days
          const daysLeft = Math.ceil(
            (new Date(existing.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          setTrialInfo({ daysLeft: Math.max(0, daysLeft), expired: daysLeft <= 0 });
        }
      } catch (err) {
        logError('auth', 'ensureUserProfile: unexpected error', { error: err.message });
        writeSystemLog({ severity: 'error', module: 'auth', message: 'ensureUserProfile unexpected error', details: { error: err.message } });
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logError('auth', 'getSession failed', { error: error.message });
        writeSystemLog({ severity: 'error', module: 'auth', message: 'getSession failed', details: { error: error.message } });
      }
      if (session) {
        setAuthState(true);
        setStoreSession(session);
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        checkSuperAdmin(session.user);
        loadInitialStoreData();
      } else {
        setAuthState(false);
        clearSensitiveLocalState();
      }
      setSessionChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthState(true);
        setStoreSession(session);
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        checkSuperAdmin(session.user);
        if (_event === 'SIGNED_IN') {
          ensureUserProfile(session.user);
          loadInitialStoreData();
        }
      } else {
        setAuthState(false);
        clearStoreSession();
        setIsAuthenticated(false);
        setCurrentUser(null);
        clearSensitiveLocalState();
        if (_event === 'SIGNED_OUT') {
          writeSystemLog({ severity: 'info', module: 'auth', message: 'User signed out' });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Folio State: shared between ServicesHub and SmartInventory
  // Each room stores an array of charges with type + timestamp for billing
  const [roomFolios, setRoomFolios] = useState({
    '102': {
      total: 124.00,
      charges: [
        { id: 1, type: 'F&B', items: 'Champagne Moët, Fruits de saison', amount: 124.00, time: '09:45' }
      ]
    },
    '304': {
      total: 48.00,
      charges: [
        { id: 2, type: 'F&B', items: 'Cocktail x2, Club Sandwich', amount: 48.00, time: '12:15' }
      ]
    }
  });

  // type = 'F&B' | 'Spa' | 'Conciergerie' | 'Service'
  const addFolioCharge = (room, amount, items, type = 'Service') => {
    setRoomFolios(prev => {
      const current = prev[room] || { total: 0, charges: [] };
      const newCharge = {
        id: Date.now(),
        type,
        items,
        amount,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      return {
        ...prev,
        [room]: {
          total: current.total + amount,
          charges: [...current.charges, newCharge],
        }
      };
    });
  };

  const clearFolioCharge = (room) => {
    setRoomFolios(prev => {
      const copy = { ...prev };
      delete copy[room];
      return copy;
    });
  };

  const renderModule = () => {
    switch (activeView) {
      case 'dashboard':
        return <ModularDashboard pmsMode="pro" onModuleSelect={setActiveView} />;
      case 'timeline':
        return (
          <>
            <section className="app-task-list app-panel glass-panel">
               <TaskListView />
            </section>
            <section className="app-timeline app-panel glass-panel">
               <TimelineView />
            </section>
          </>
        );
      case 'properties':
      case 'lodgings':
        return <PropertiesManager pmsMode="pro" />;
      case 'smart-access':
        return <SmartAccess />;
      case 'distribution':
        return <ChannelManager pmsMode="pro" setActiveView={setActiveView} />;
      case 'guest-workflow':
        return <GuestJourneyDiagram />;
      case 'reports':
        return <ReportsDashboard />;
      case 'website-builder':
        return <WebsiteBuilder />;
      case 'automation-hub':
        return <AutomationHub />;
      case 'checkin-manager':
        return <CheckinManager />;
      case 'automation-workflow':
        return <WorkflowBuilder />;
      case 'frontdesk':
      case 'front-desk':
        return <SmartDesk />;
      case 'property-builder':
        return <PropertyBuilder />;
      case 'revenue':
        return <RevenueAI />;
      case 'housekeeping':
        return <PredictiveMaintenance />;
      case 'guests':
        return <GuestCRM />;
      case 'unified-inbox':
        return <UnifiedInbox pmsMode={pmsMode} setActiveView={setActiveView} />;
      case 'services-hub':
        return <ServicesHub addFolioCharge={addFolioCharge} roomFolios={roomFolios} />;
      case 'billing-engine':
        return <BillingEngine pmsMode={pmsMode} />;
      case 'system-admin':
        return <SystemAdmin />;
      case 'super-admin':
      case 'superadmin':
        return <SuperAdmin />;
      case 'plans':
        return <ClientPlans pmsMode={pmsMode} />;
      case 'reputation':
        return <ReputationManager pmsMode={pmsMode} setActiveView={setActiveView} />;
      case 'staff-hub':
        return <StaffHub onNavigate={setActiveView} />;
      case 'locks':
        return <SmartLockHub />;
      case 'card-management':
        return <CardManagement />;
      case 'inventory':
        return <SmartInventory roomFolios={roomFolios} clearFolioCharge={clearFolioCharge} />;
      case 'affiliate':
      case 'affiliation':
        return <AffiliateSystem pmsMode={pmsMode} />;
      case 'settings':
        return <SettingsDashboard />;
      case 'police':
        return <MoroccanPoliceForm />;
      case 'api-docs':
        return <APIDocumentation />;
      case 'api-integration':
        return <APIIntegration />;
      case 'api-about':
        return <APIDescription onModuleSelect={setActiveView} />;
      default:
        return <ModularDashboard pmsMode="pro" onModuleSelect={setActiveView} />;
    }
  };

  // ── Guest check-in page — bypasses auth entirely ──────────────────────
  const checkinToken = getCheckinTokenFromURL();
  if (checkinToken) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GuestCheckinPage token={checkinToken} />
      </Suspense>
    );
  }

  if (!sessionChecked) {
    return <LoadingFallback />;
  }

  // ── Route dédiée Super Admin : ?superadmin ──────────────────────────────
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('superadmin')) {
    // Already authenticated as super_admin → show panel directly
    if (isAuthenticated && activeView === 'super-admin') {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SuperAdmin onLogout={() => {
            setAuthState(false);
            clearSensitiveLocalState();
            supabase.auth.signOut();
            setIsAuthenticated(false);
            setCurrentUser(null);
            setActiveView('dashboard');
            window.location.href = '/';
          }} />
        </Suspense>
      );
    }
    // Not authenticated → show Super Admin login page
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SuperAdminLogin onSuccess={(user, profile) => {
            setAuthState(true);
            setCurrentUser(user);
            setIsAuthenticated(true);
            setActiveView('super-admin');
          }} />
        </Suspense>
      );
    }
  }

  // ── Super Admin full-screen (no PMS shell) — accessible from anywhere ──
  if (isAuthenticated && activeView === 'super-admin') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <SuperAdmin onLogout={() => {
          setAuthState(false);
          clearSensitiveLocalState();
          supabase.auth.signOut();
          setIsAuthenticated(false);
          setCurrentUser(null);
          setActiveView('dashboard');
        }} />
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage onLogin={(mode) => {
            if (mode === 'demo') {
              setPmsMode('pro');
              setCurrentUser({ id: 'demo', email: 'demo@hova.app', user_metadata: { full_name: 'Mode Démo' } });
              setAuthState(true);
              setIsAuthenticated(true);
            } else if (mode === 'super-admin') {
              setPmsMode('pro');
              setCurrentUser({ id: 'sa-local', email: 'admin@hosflow.com', user_metadata: { full_name: 'Super Admin' } });
              setAuthState(true);
              setIsAuthenticated(true);
              setActiveView('super-admin');
            } else if (mode === 'trial') {
              setPmsMode('pro');
              setTrialInfo({ daysLeft: 14, expired: false });
              setIsAuthenticated(true);
            } else {
              setPmsMode(mode || 'pro');
            }
        }} />
      </Suspense>
    );
  }

  /* ── Trial banner (shown to trial users) ── */
  const TrialBanner = () => {
    if (!trialInfo || trialBannerDismissed) return null;
    const { daysLeft, expired } = trialInfo;

    return (
      <div className={`trial-banner ${expired ? 'trial-banner--expired' : ''}`}>
        <div className="trial-banner-inner">
          {expired ? (
            <Clock size={15} className="trial-banner-icon"/>
          ) : (
            <Sparkles size={15} className="trial-banner-icon"/>
          )}
          <span className="trial-banner-text">
            {expired
              ? 'Votre essai gratuit est terminé. Abonnez-vous pour continuer à accéder à toutes les fonctionnalités.'
              : `Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}.`
            }
          </span>
          <button
            className="trial-banner-cta"
            onClick={() => setActiveView('plans')}
          >
            {expired ? 'Voir les plans' : 'Choisir un plan'} →
          </button>
          {!expired && (
            <button
              className="trial-banner-dismiss"
              onClick={() => setTrialBannerDismissed(true)}
              aria-label="Fermer"
            >
              <X size={13}/>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container mode-${pmsMode} ${isMobileMenuOpen ? 'mobile-menu-open' : ''} ${trialInfo && !trialBannerDismissed ? 'has-trial-banner' : ''}`}>
      {/* Trial banner */}
      <TrialBanner />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
          aria-label="Close mobile menu"
          role="button"
          tabIndex={0}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileMenuOpen(false);
        }} 
        pmsMode={pmsMode}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="app-main-content">
        {/* Top Header */}
        <header className="app-header glass-panel">
          <button 
            className="mobile-hamburger" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
             <div className="bar" />
             <div className="bar" />
             <div className="bar" />
          </button>
          <TopHeader
            pmsMode={pmsMode}
            setPmsMode={setPmsMode}
            setActiveView={setActiveView}
            currentUser={currentUser}
            onLogout={() => {
              setAuthState(false);
              clearSensitiveLocalState();
              supabase.auth.signOut();
              setIsAuthenticated(false);
              setCurrentUser(null);
              setActiveView('dashboard');
            }}
          />
        </header>

        {/* Dynamic Content Wrapped in Suspense + ErrorBoundary */}
        <div className="app-content-grid">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {activeView === 'timeline' ? (
                renderModule()
              ) : (
                <section className="app-full-module" style={{ flex: 1, overflowY: 'auto' }}>
                  {renderModule()}
                </section>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      
      {/* Global AI Assistant */}
      <OracleAssistant />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav" aria-label="Navigation mobile">
        <button
          className={activeView === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveView('dashboard')}
        >
          <LayoutDashboard size={22} />
          <span>Dashboard</span>
        </button>
        <button
          className={activeView === 'frontdesk' ? 'active' : ''}
          onClick={() => setActiveView('frontdesk')}
        >
          <Monitor size={22} />
          <span>Planning</span>
        </button>
        <button
          className={activeView === 'checkin-manager' ? 'active' : ''}
          onClick={() => setActiveView('checkin-manager')}
        >
          <UserCheck size={22} />
          <span>Check-in</span>
        </button>
        <button
          className={activeView === 'unified-inbox' ? 'active' : ''}
          onClick={() => setActiveView('unified-inbox')}
        >
          <MessageSquare size={22} />
          <span>Inbox</span>
        </button>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={22} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
