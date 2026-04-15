import React from 'react';
import { LayoutDashboard, Calendar, ClipboardCheck, Bell, Activity, Settings, Moon, HelpCircle, Key, Globe2, UserCheck, Sparkles, Zap, Layout, Users, Receipt, ShoppingCart, BarChart3, Database, Shield, UtensilsCrossed, MessageSquare, Monitor, Layers, ShieldCheck, CreditCard, Bot, Building2, Star } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, setActiveView, pmsMode }) => {
  return (
    <div className="sidebar-container hide-scrollbar">
      {/* Logo Area */}
      <div className="sidebar-logo">
        <div className="logo-icon">H</div>
        <h2>HosFlow</h2>
      </div>

      {/* Primary Action */}
      <div className="sidebar-action">
        <button className="btn-create">
          <span className="plus-icon">+</span> 
          <span>{pmsMode === 'hot' ? 'Automatisé' : 'Réserver'}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-menu">
        {pmsMode === 'hot' ? (
          /* PMS HOT: Seasonal / Villa - Focus on Automation */
          <>
            <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
              <LayoutDashboard size={20} />
              <span>Tableau de Bord</span>
            </div>
            <div className={`menu-item ${activeView === 'timeline' ? 'active' : ''}`} onClick={() => setActiveView('timeline')}>
              <Calendar size={20} />
              <span>Calendrier PMS</span>
            </div>
            <div className={`menu-item ${activeView === 'lodgings' ? 'active' : ''}`} onClick={() => setActiveView('lodgings')}>
              <Building2 size={20} />
              <span>Gestion des Villas</span>
            </div>
            <div className={`menu-item ${activeView === 'distribution' ? 'active' : ''}`} onClick={() => setActiveView('distribution')}>
              <Globe2 size={20} />
              <span>Gestion Canaux</span>
            </div>
            <div className={`menu-item ${activeView === 'locks' ? 'active' : ''}`} onClick={() => setActiveView('locks')}>
              <Key size={20} />
              <span>Tableau Serrures</span>
              <span className="badge-alert">3</span>
            </div>
            <div className={`menu-item ${activeView === 'unified-inbox' ? 'active' : ''}`} onClick={() => setActiveView('unified-inbox')}>
              <MessageSquare size={20} className="text-accent-blue" />
              <span>Inbox Omnicanale</span>
              <span className="badge-alert">2</span>
            </div>
            <div className={`menu-item ${activeView === 'reputation' ? 'active' : ''}`} onClick={() => setActiveView('reputation')}>
              <Star size={20} style={{ color: '#FCD34D' }} />
              <span>E-Réputation & Avis</span>
            </div>
            <div className={`menu-item ${activeView === 'guest-workflow' ? 'active' : ''}`} onClick={() => setActiveView('guest-workflow')}>
              <UserCheck size={20} />
              <span>Parcours Guest</span>
            </div>
            <div className={`menu-item ${activeView === 'website-builder' ? 'active' : ''}`} onClick={() => setActiveView('website-builder')}>
              <Sparkles size={20} className="text-accent-blue" />
              <span>AI Website Builder</span>
            </div>
            <div className={`menu-item ${activeView === 'automation-workflow' ? 'active' : ''}`} onClick={() => setActiveView('automation-workflow')}>
              <Bot size={20} className="text-accent-gold" />
              <span>Automatisations & Bots</span>
            </div>
            <div className={`menu-item ${activeView === 'billing-engine' ? 'active' : ''}`} onClick={() => setActiveView('billing-engine')}>
              <Receipt size={20} />
              <span>Facturation & Taxes</span>
            </div>
            <div className={`menu-item ${activeView === 'staff-hub' ? 'active' : ''}`} onClick={() => setActiveView('staff-hub')}>
              <Users size={20} />
              <span>Gestion Équipe</span>
            </div>
            <div className={`menu-item ${activeView === 'housekeeping' ? 'active' : ''}`} onClick={() => setActiveView('housekeeping')}>
              <Sparkles size={20} />
              <span>Ménage & Turnover</span>
            </div>
            <div className={`menu-item ${activeView === 'services-hub' ? 'active' : ''}`} onClick={() => setActiveView('services-hub')}>
              <UtensilsCrossed size={20} />
              <span>Conciergerie (Services)</span>
            </div>
            <div className={`menu-item ${activeView === 'reports' ? 'active' : ''}`} onClick={() => setActiveView('reports')}>
              <Activity size={20} />
              <span>Rapports</span>
            </div>
            <div className={`menu-item ${activeView === 'plans' ? 'active' : ''}`} onClick={() => setActiveView('plans')} style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <CreditCard size={20} style={{ color: 'var(--accent-gold, #f59e0b)' }} />
              <span style={{ color: 'var(--accent-gold, #f59e0b)', fontWeight: 600 }}>Abonnement</span>
            </div>
            <div className={`menu-item ${activeView === 'affiliate' ? 'active' : ''}`} onClick={() => setActiveView('affiliate')}>
              <Users size={20} style={{ color: '#10b981' }} />
              <span style={{ color: '#10b981', fontWeight: 600 }}>Affiliation</span>
            </div>
            <div className={`menu-item ${activeView === 'super-admin' ? 'active' : ''}`} onClick={() => setActiveView('super-admin')}>
              <ShieldCheck size={20} style={{ color: '#6366f1' }} />
              <span style={{ color: '#6366f1', fontWeight: 700 }}>Super Admin</span>
            </div>
          </>
        ) : (
          /* PMS PRO: Hotel / Residence - Professional Hierarchy */
          <div className="pro-sidebar-wrap">
            <div className="sidebar-group">
              <span className="group-title">Dashboard</span>
              <div className={`menu-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')}>
                <BarChart3 size={18} />
                <span>Vue d'Ensemble</span>
              </div>
            </div>

            <div className="sidebar-group">
              <span className="group-label">OPÉRATIONS</span>
              <button className={`menu-item ${activeView === 'frontdesk' ? 'active' : ''}`} onClick={() => setActiveView('frontdesk')}>
                <Monitor size={18} /> <span>Front Desk (Planning)</span>
              </button>
              <button className={`menu-item ${activeView === 'locks' ? 'active' : ''}`} onClick={() => setActiveView('locks')}>
                <Key size={18} /> <span>Serrures Connectées</span>
              </button>
              <button className={`menu-item ${activeView === 'inventory' ? 'active' : ''}`} onClick={() => setActiveView('inventory')}>
                <Layers size={18} /> <span>Gestion Inventaire</span>
              </button>
              <div className={`menu-item ${activeView === 'services-hub' ? 'active' : ''}`} onClick={() => setActiveView('services-hub')}>
                <UtensilsCrossed size={18} />
                <span>Hub de Services (F&B)</span>
              </div>
              <div className={`menu-item ${activeView === 'housekeeping' ? 'active' : ''}`} onClick={() => setActiveView('housekeeping')}>
                <ClipboardCheck size={18} />
                <span>Housekeeping</span>
              </div>
              <div className={`menu-item ${activeView === 'guests' ? 'active' : ''}`} onClick={() => setActiveView('guests')}>
                <Users size={18} />
                <span>Gestion Clients (CRM)</span>
              </div>
              <div className={`menu-item ${activeView === 'unified-inbox' ? 'active' : ''}`} onClick={() => setActiveView('unified-inbox')}>
                <MessageSquare size={18} className="text-accent-blue" />
                <span>Inbox Omnicanale</span>
                <span className="badge-alert">2</span>
              </div>
              <div className={`menu-item ${activeView === 'reputation' ? 'active' : ''}`} onClick={() => setActiveView('reputation')}>
                <Star size={18} style={{ color: '#FCD34D' }} />
                <span>E-Réputation & Avis</span>
              </div>
            </div>

            <div className="sidebar-group">
              <span className="group-title">Finance</span>
              <div className={`menu-item ${activeView === 'billing-engine' ? 'active' : ''}`} onClick={() => setActiveView('billing-engine')}>
                <Receipt size={18} />
                <span>Facturation & Taxes</span>
              </div>
              <div className={`menu-item ${activeView === 'revenue' ? 'active' : ''}`} onClick={() => setActiveView('revenue')}>
                <Zap size={18} className="text-accent-gold" />
                <span>Revenue Management</span>
              </div>
            </div>

            <div className="sidebar-group">
              <span className="group-title">Distribution</span>
              <div className={`menu-item ${activeView === 'distribution' ? 'active' : ''}`} onClick={() => setActiveView('distribution')}>
                <Globe2 size={18} />
                <span>Channel Manager Sync</span>
              </div>
              <div className={`menu-item ${activeView === 'website-builder' ? 'active' : ''}`} onClick={() => setActiveView('website-builder')}>
                <Sparkles size={18} />
                <span>Booking Engine Site</span>
              </div>
            </div>

            <div className="sidebar-group">
              <span className="group-title">Expansion</span>
              <div className={`menu-item ${activeView === 'automation-workflow' ? 'active' : ''}`} onClick={() => setActiveView('automation-workflow')}>
                <Database size={18} />
                <span>Property Auto-Build</span>
              </div>
              <div className={`menu-item ${activeView === 'affiliate' ? 'active' : ''}`} onClick={() => setActiveView('affiliate')}>
                <Users size={18} />
                <span>Affiliation</span>
              </div>
            </div>
            
            <div className="sidebar-group">
              <span className="group-title">Système & Équipe</span>
              <div className={`menu-item ${activeView === 'staff-hub' ? 'active' : ''}`} onClick={() => setActiveView('staff-hub')}>
                <Users size={18} />
                <span>Équipe & RH (Staff)</span>
              </div>
              <div className={`menu-item ${activeView === 'smart-access' ? 'active' : ''}`} onClick={() => setActiveView('smart-access')}>
                <Key size={18} />
                <span>IoT Lock Config</span>
              </div>
              <div className={`menu-item ${activeView === 'plans' ? 'active' : ''}`} onClick={() => setActiveView('plans')} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 6 }}>
                <CreditCard size={18} style={{ color: 'var(--accent-gold, #f59e0b)' }} />
                <span style={{ color: 'var(--accent-gold, #f59e0b)', fontWeight: 600 }}>Abonnement</span>
              </div>
              <div className={`menu-item ${activeView === 'super-admin' ? 'active' : ''}`} onClick={() => setActiveView('super-admin')}>
                <ShieldCheck size={18} style={{ color: '#6366f1' }} />
                <span style={{ color: '#6366f1', fontWeight: 700 }}>Super Admin</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects / Properties section */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>PROPRIÉTÉS</span>
          <button className="btn-add-small">+</button>
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
        <div className="menu-item">
          <Settings size={20} />
          <span>Paramètres</span>
        </div>
        <div className="menu-item toggle-item">
          <Moon size={20} />
          <span>Mode sombre</span>
          <div className="toggle-switch"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
