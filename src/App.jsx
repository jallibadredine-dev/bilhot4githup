import { useState } from 'react'
import './App.css'

// Layout & Common Components
import Sidebar from './components/layout/Sidebar'
import TopHeader from './components/layout/TopHeader'
import TaskListView from './components/views/TaskListView'
import TimelineView from './components/views/TimelineView'
import ActivitySidePanel from './components/views/ActivitySidePanel'
import OracleAssistant from './components/common/OracleAssistant'

// Module Components
import SmartAccess from './components/modules/SmartAccess'
import ChannelManager from './components/modules/ChannelManager'
import GuestJourneyDiagram from './components/modules/GuestJourneyDiagram'
import AperçuGlobal from './components/modules/AperçuGlobal'
import PropertyGallery from './components/modules/PropertyGallery'
import ReportsDashboard from './components/modules/ReportsDashboard'
import WebsiteBuilder from './components/modules/WebsiteBuilder'
import WorkflowBuilder from './components/modules/WorkflowBuilder'
import PropertyBuilder from './components/modules/PropertyBuilder'
import SmartDesk from './components/modules/SmartDesk';
import RevenueAI from './components/modules/RevenueAI';
import PredictiveMaintenance from './components/modules/PredictiveMaintenance';
import GuestCRM from './components/modules/GuestCRM';
import ModularDashboard from './components/modules/ModularDashboard';
import ServicesHub from './components/modules/ServicesHub';
import BillingEngine from './components/modules/BillingEngine';
import SystemAdmin from './components/modules/SystemAdmin';
import UnifiedInbox from './components/modules/UnifiedInbox';
import StaffHub from './components/modules/StaffHub';
import AuthPage from './components/modules/AuthPage';
import LandingPage from './components/modules/LandingPage';
import SmartLockHub from './components/modules/SmartLockHub';
import SmartInventory from './components/modules/SmartInventory';
import PropertiesManager from './components/modules/PropertiesManager';
import SuperAdmin from './components/modules/SuperAdmin';
import ClientPlans from './components/modules/ClientPlans';
import ReputationManager from './components/modules/ReputationManager';
import AffiliateSystem from './components/modules/AffiliateSystem';

function App() {
  const [isLanding, setIsLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [pmsMode, setPmsMode] = useState('hot'); // Default to HOT for demo

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
        return <ChannelManager pmsMode={pmsMode} />;
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
        return <UnifiedInbox pmsMode={pmsMode} />;
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
        return <ReputationManager pmsMode={pmsMode} />;
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
    return <LandingPage onGoToAuth={() => setIsLanding(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPage 
        onLogin={(mode) => {
          setPmsMode(mode);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className={`app-container mode-${pmsMode}`}>
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        pmsMode={pmsMode}
      />

      <div className="app-main-content">
        {/* Top Header */}
        <header className="app-header glass-panel">
          <TopHeader pmsMode={pmsMode} setPmsMode={setPmsMode} />
        </header>

        {/* Dynamic Content */}
        <div className="app-content-grid">
          {activeView === 'timeline' ? (
            renderModule()
          ) : (
            <section className="app-full-module hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
              {renderModule()}
            </section>
          )}
        </div>
      </div>
      
      {/* Global AI Assistant */}
      <OracleAssistant />
    </div>
  );
}

export default App;
