import React from 'react';
import { LayoutDashboard, Calendar, ClipboardCheck, Activity, Settings, Moon, Key, Globe2, UserCheck, Sparkles, Zap, Layers, Users, Receipt, Database, ShieldCheck, CreditCard, Bot, Building2, Star, XCircle, UtensilsCrossed, MessageSquare, Monitor, BarChart3, Code } from 'lucide-react';
import './Sidebar.css';

const SidebarItem = ({ id, icon: Icon, label, activeView, setActiveView, alertCount, color, isBold, extraStyle }) => {
  const isActive = activeView === id;
  const itemStyle = extraStyle || {};
  if (color) {
    itemStyle.color = color;
  }
  if (isBold) {
    itemStyle.fontWeight = 600;
  }

  return (
    <button 
      className={`menu-item ${isActive ? 'active' : ''}`} 
      onClick={() => setActiveView(id)}
      style={itemStyle}
      aria-label={`Navigate to ${label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon size={18} style={color ? { color } : {}} />
      <span style={isBold ? { fontWeight: 'inherit' } : {}}>{label}</span>
      {alertCount && <span className="badge-alert">{alertCount}</span>}
    </button>
  );
};

const Sidebar = ({ activeView, setActiveView, pmsMode }) => {
  return (
    <nav className="sidebar-container hide-scrollbar" aria-label="Main Navigation">
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div className="logo-icon">H</div>
        <h2>Hova</h2>

        <button
          className="mobile-sidebar-close"
          onClick={() => setActiveView(activeView)} 
          aria-label="Close sidebar"
        >
          <XCircle size={24} />
        </button>
      </div>

      {/* Primary Action */}
      <div className="sidebar-action">
        <button className="btn-create">
          <span className="plus-icon">+</span>
          <span>Réserver</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-menu">
        <div className="pro-sidebar-wrap">
          <div className="sidebar-group">
            <span className="group-title">Dashboard</span>
            <SidebarItem id="dashboard" icon={BarChart3} label="Vue d'Ensemble" activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-label group-title">OPÉRATIONS</span>
            <SidebarItem id="frontdesk" icon={Monitor} label="Front Desk (Planning)" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="locks" icon={Key} label="Serrures Connectées" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="inventory" icon={Layers} label="Gestion Inventaire" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="services-hub" icon={UtensilsCrossed} label="Hub de Services (F&B)" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="housekeeping" icon={ClipboardCheck} label="Housekeeping" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="guests" icon={Users} label="Gestion Clients (CRM)" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="unified-inbox" icon={MessageSquare} label="Inbox Omnicanale" alertCount={2} color="#3B82F6" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="reputation" icon={Star} label="E-Réputation & Avis" color="#FCD34D" activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Finance</span>
            <SidebarItem id="billing-engine" icon={Receipt} label="Facturation & Taxes" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="revenue" icon={Zap} label="Revenue Management" color="#F59E0B" activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Distribution</span>
            <SidebarItem id="distribution" icon={Globe2} label="Channel Manager Sync" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="website-builder" icon={Sparkles} label="Booking Engine Site" activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Expansion</span>
            <SidebarItem id="api-about" icon={Zap} label="À propos de l'API" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="api-integration" icon={Code} label="API & Intégration" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="affiliate" icon={Users} label="Affiliation" activeView={activeView} setActiveView={setActiveView} />
          </div>

          <div className="sidebar-group">
            <span className="group-title">Système & Équipe</span>
            <SidebarItem id="staff-hub" icon={Users} label="Équipe & RH (Staff)" activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="plans" icon={CreditCard} label="Abonnement" color="#f59e0b" isBold extraStyle={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 6 }} activeView={activeView} setActiveView={setActiveView} />
            <SidebarItem id="super-admin" icon={ShieldCheck} label="Super Admin" color="#6366f1" isBold activeView={activeView} setActiveView={setActiveView} />
          </div>
        </div>
      </div>

      {/* Projects / Properties section */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>PROPRIÉTÉS</span>
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

      {/* Bottom Actions */}
      <div className="sidebar-footer">
        <button 
          className={`menu-item ${activeView === 'settings' ? 'active' : ''}`} 
          style={{ width: '100%' }} 
          onClick={() => setActiveView('settings')}
        >
          <Settings size={20} />
          <span>Paramètres</span>
        </button>
        <div className="menu-item toggle-item" style={{ cursor: 'pointer' }}>
          <Moon size={20} />
          <span>Mode sombre</span>
          <div className="toggle-switch"></div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
