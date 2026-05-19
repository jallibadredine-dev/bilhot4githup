import React from 'react';
import {
  LayoutDashboard, Calendar, ClipboardCheck, Settings, Moon, Key,
  Globe2, UserCheck, Sparkles, Zap, Layers, Users, Receipt, Database,
  CreditCard, Bot, Building2, Star, XCircle,
  UtensilsCrossed, MessageSquare, Monitor, BarChart3, Code,
  Workflow, ClipboardList, Home, ScanLine
} from 'lucide-react';
import './Sidebar.css';

const SidebarItem = ({ id, icon: Icon, label, activeView, setActiveView, alertCount, color, isBold, extraStyle }) => {
  const isActive = activeView === id;

  return (
    <button
      className={`menu-item ${isActive ? 'active' : ''}`}
      onClick={() => setActiveView(id)}
      style={extraStyle || {}}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
      title={label}
    >
      <Icon size={17} />
      <span>{label}</span>
      {alertCount && <span className="badge-alert">{alertCount}</span>}
    </button>
  );
};

const Sidebar = ({ activeView, setActiveView, pmsMode, onClose, darkMode, setDarkMode }) => {
  return (
    <nav className="sidebar-container hide-scrollbar" aria-label="Main Navigation">

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5, flexShrink: 0, lineHeight: 1, userSelect: 'none' }}>
          <span style={{ color: 'var(--accent-blue)' }}>Bil</span><span style={{ color: 'var(--text-primary)' }}>Hot</span>
        </span>
        <button
          className="mobile-sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <XCircle size={22} />
        </button>
      </div>

      {/* ── Quick Action ── */}
      <div className="sidebar-action">
        <button className="btn-create">
          <span className="plus-icon">+</span>
          <span>Réserver</span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="sidebar-menu">
        <div className="pro-sidebar-wrap">

          <div className="sidebar-group">
            <span className="group-title">Tableau de bord</span>
            <SidebarItem id="dashboard"   icon={BarChart3}     label="Vue d'Ensemble"         activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Opérations</span>
            <SidebarItem id="frontdesk"        icon={Monitor}       label="Front Desk"             activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="inventory"        icon={Layers}        label="Gestion Inventaire"     activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="locks"            icon={Key}           label="Serrures Connectées"    activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="card-management" icon={ScanLine}      label="Cartes d'Accès RFID"    activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="services-hub"     icon={UtensilsCrossed} label="Hub de Services"      activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="housekeeping"     icon={ClipboardCheck} label="Housekeeping"          activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="checkin-manager"  icon={ClipboardList} label="Check-in Digital"      activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="guests"           icon={Users}         label="CRM Clients"            activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="unified-inbox"    icon={MessageSquare} label="Inbox Omnicanale"       alertCount={2} activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="reputation"       icon={Star}          label="E-Réputation & Avis"   activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Finance</span>
            <SidebarItem id="billing-engine"  icon={Receipt}  label="Facturation & Taxes"  activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="revenue"         icon={Zap}      label="Revenue Management"   activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Distribution</span>
            <SidebarItem id="distribution"    icon={Globe2}    label="Channel Manager"     activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="website-builder" icon={Sparkles}  label="Booking Engine Site" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="automation-hub"  icon={Workflow}  label="Automation Engine"   activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Expansion</span>
            <SidebarItem id="api-about"       icon={Zap}       label="À propos de l'API"   activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="api-integration" icon={Code}      label="API & Intégration"   activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="affiliate"       icon={Users}     label="Affiliation"         activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Système</span>
            <SidebarItem id="staff-hub"   icon={Users}      label="Équipe & RH"    activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="plans"       icon={CreditCard} label="Abonnement"     activeView={activeView} setActiveView={setActiveView}
              extraStyle={{ borderTop: '1px solid #F0F0F0', marginTop: 4, paddingTop: 12 }}
            />
          </div>

        </div>
      </div>

      {/* ── Properties ── */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>Propriétés</span>
          <button className="btn-add-small" aria-label="Add Property">+</button>
        </div>
        <div className="project-list">
          <div className="project-item">
            <span className="circle-indicator green"></span>
            <span>Villa Sunrise</span>
          </div>
          <div className="project-item active-project">
            <span className="circle-indicator white"></span>
            <span>Ocean View Apt</span>
            <span className="project-progress">76%</span>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <button
          className={`menu-item ${activeView === 'settings' ? 'active' : ''}`}
          style={{ width: '100%' }}
          onClick={() => setActiveView('settings')}
          title="Paramètres"
        >
          <Settings size={17} />
          <span>Paramètres</span>
        </button>
        <div
          className="menu-item toggle-item"
          style={{ cursor: 'pointer' }}
          onClick={() => setDarkMode && setDarkMode(prev => !prev)}
          role="switch"
          aria-checked={darkMode}
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setDarkMode && setDarkMode(prev => !prev)}
        >
          <Moon size={17} />
          <span>Mode sombre</span>
          <div className={`toggle-switch${darkMode ? ' toggle-on' : ''}`}></div>
        </div>
      </div>

    </nav>
  );
};

export default Sidebar;
