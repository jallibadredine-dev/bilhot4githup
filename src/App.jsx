import React, { useState, Suspense, lazy } from 'react';
import './App.css';

// Core Layout & Common Components (Eager Load)
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import ActivitySidePanel from './components/views/ActivitySidePanel';
import OracleAssistant from './components/common/OracleAssistant';

// Lazy-loaded Views (Performance Optimization)
const TaskListView = lazy(() => import('./components/views/TaskListView'));
const TimelineView = lazy(() => import('./components/views/TimelineView'));

// Lazy-loaded Module Components (Performance Optimization)
const SmartAccess = lazy(() => import('./components/modules/SmartAccess'));
const ChannelManager = lazy(() => import('./components/modules/ChannelManager'));
const GuestJourneyDiagram = lazy(() => import('./components/modules/GuestJourneyDiagram'));
const AperçuGlobal = lazy(() => import('./components/modules/AperçuGlobal'));
const PropertyGallery = lazy(() => import('./components/modules/PropertyGallery'));
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
const SmartInventory = lazy(() => import('./components/modules/SmartInventory'));
const PropertiesManager = lazy(() => import('./components/modules/PropertiesManager'));
const SuperAdmin = lazy(() => import('./components/modules/SuperAdmin'));
const ClientPlans = lazy(() => import('./components/modules/ClientPlans'));
const ReputationManager = lazy(() => import('./components/modules/ReputationManager'));
const AffiliateSystem = lazy(() => import('./components/modules/AffiliateSystem'));

// Fallback Loader UI
const LoadingFallback = () => (
  <div className="flex-center" style={{ height: '100%', width: '100%', color: 'var(--text-muted)' }}>
    <div className="spinner">Loading module...</div>
  </div>
);

function App() {
  const [isLanding, setIsLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [pmsMode, setPmsMode] = useState('hot'); // Default to HOT for demo
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Folio State: shared between ServicesHub and SmartInventory
  const [roomFolios, setRoomFolios] = useState({
     '102': { total: 124.00, items: 'Champagne Moët, Fruits' }
  });

  const addFolioCharge = (room, amount, items) => {
    setRoomFolios(prev => {
      const current = prev[room] || { total: 0, items: '' };
      return {
        ...prev,
        [room]: {
          total: current.total + amount,
          items: current.items ? `${current.items} | ${items}` : items
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
        return pmsMode === 'pro' ? <ModularDashboard pmsMode={pmsMode} onModuleSelect={setActiveView} /> : <AperçuGlobal pmsMode={pmsMode} />;
      case 'timeline':
        return (
          <>
            <section className="app-task-list app-panel glass-panel">
               <TaskListView />
            </section>
            <section className="app-timeline app-panel glass-panel">
               <TimelineView />
            </section>
            <section className="app-activity-panel app-panel glass-panel">
               <ActivitySidePanel />
            </section>
          </>
        );
      case 'properties':
      case 'lodgings':
        return <PropertiesManager pmsMode={pmsMode} />;
      case 'smart-access':
        return <SmartAccess />;
      case 'distribution':
        return <ChannelManager pmsMode={pmsMode} setActiveView={setActiveView} />;
      case 'guest-workflow':
        return <GuestJourneyDiagram />;
      case 'reports':
        return <ReportsDashboard />;
      case 'website-builder':
        return <WebsiteBuilder />;
      case 'automation-workflow':
        return <WorkflowBuilder />;
      case 'frontdesk':
      case 'front-desk':
        return pmsMode === 'pro' ? <SmartDesk /> : <AperçuGlobal pmsMode={pmsMode} />;
      case 'property-builder':
        return <PropertyBuilder />;
      case 'revenue':
        return pmsMode === 'pro' ? <RevenueAI /> : <AperçuGlobal pmsMode={pmsMode} />;
      case 'housekeeping':
        return pmsMode === 'pro' ? <PredictiveMaintenance /> : <AperçuGlobal pmsMode={pmsMode} />;
      case 'guests':
        return pmsMode === 'pro' ? <GuestCRM /> : <AperçuGlobal pmsMode={pmsMode} />;
      case 'unified-inbox':
        return <UnifiedInbox pmsMode={pmsMode} setActiveView={setActiveView} />;
      case 'services-hub':
        return <ServicesHub addFolioCharge={addFolioCharge} />;
      case 'billing-engine':
        return <BillingEngine />;
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
        return <StaffHub />;
      case 'locks':
        return <SmartLockHub />;
      case 'inventory':
        return <SmartInventory roomFolios={roomFolios} clearFolioCharge={clearFolioCharge} />;
      case 'affiliate':
      case 'affiliation':
        return <AffiliateSystem pmsMode={pmsMode} />;
      default:
        return <AperçuGlobal pmsMode={pmsMode} />;
    }
  };

  if (isLanding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage onGoToAuth={() => setIsLanding(false)} />
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuthPage 
          onLogin={(mode) => {
            setPmsMode(mode);
            setIsAuthenticated(true);
          }} 
        />
      </Suspense>
    );
  }

  return (
    <div className={`app-container mode-${pmsMode} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
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
          setIsMobileMenuOpen(false); // Auto-close on selection on mobile
        }} 
        pmsMode={pmsMode}
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
          <TopHeader pmsMode={pmsMode} setPmsMode={setPmsMode} />
        </header>

        {/* Dynamic Content Wrapped in Suspense */}
        <div className="app-content-grid">
          <Suspense fallback={<LoadingFallback />}>
            {activeView === 'timeline' ? (
              renderModule()
            ) : (
              <section className="app-full-module hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                {renderModule()}
              </section>
            )}
          </Suspense>
        </div>
      </main>
      
      {/* Global AI Assistant */}
      <OracleAssistant />
    </div>
  );
}

export default App;
