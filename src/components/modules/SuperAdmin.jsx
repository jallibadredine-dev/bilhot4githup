import React, { useState } from 'react';
import {
  LayoutDashboard, Building2, Key, Globe, FileText,
  Package, CreditCard, Users, ClipboardList, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X, HeartPulse,
  ScanLine,
} from 'lucide-react';

import Dashboard     from './SuperAdminSections/Dashboard.jsx';
import PMSManager    from './SuperAdminSections/PMSManager.jsx';
import APIManager    from './SuperAdminSections/APIManager.jsx';
import Integrations  from './SuperAdminSections/Integrations.jsx';
import CMSEditor     from './SuperAdminSections/CMSEditor.jsx';
import PlansManager  from './SuperAdminSections/PlansManager.jsx';
import Payments      from './SuperAdminSections/Payments.jsx';
import UsersRoles    from './SuperAdminSections/UsersRoles.jsx';
import AuditLogs     from './SuperAdminSections/AuditLogs.jsx';
import SystemSettings from './SuperAdminSections/Settings.jsx';
import SystemHealth  from './SuperAdminSections/SystemHealth.jsx';
import AccessCards   from './SuperAdminSections/AccessCards.jsx';

import './SuperAdmin.css';

const NAV = [
  { id:'dashboard',    label:'Tableau de Bord',       Icon:LayoutDashboard, group:'core'   },
  { id:'pms',          label:'Gestion PMS',            Icon:Building2,       group:'core'   },
  { id:'api',          label:'API Manager',            Icon:Key,             group:'core'   },
  { id:'integrations', label:'Intégrations',           Icon:Globe,           group:'core'   },
  { id:'cards',        label:'Cartes d\'Accès',        Icon:ScanLine,        group:'core'   },
  { id:'cms',          label:'CMS — Site Web',         Icon:FileText,        group:'content'},
  { id:'plans',        label:'Plans & Abonnements',    Icon:Package,         group:'business'},
  { id:'payments',     label:'Paiements & Finance',    Icon:CreditCard,      group:'business'},
  { id:'users',        label:'Utilisateurs & Rôles',   Icon:Users,           group:'business'},
  { id:'logs',         label:"Journal d'Activité",     Icon:ClipboardList,   group:'admin'  },
  { id:'health',       label:'Santé Système',          Icon:HeartPulse,      group:'admin'  },
  { id:'settings',     label:'Paramètres Système',     Icon:Settings,        group:'admin'  },
];

const GROUPS = [
  { id:'core',     label:'Opérations'  },
  { id:'content',  label:'Contenu'     },
  { id:'business', label:'Business'    },
  { id:'admin',    label:'Admin'       },
];

const SECTION_MAP = {
  dashboard:    Dashboard,
  pms:          PMSManager,
  api:          APIManager,
  integrations: Integrations,
  cards:        AccessCards,
  cms:          CMSEditor,
  plans:        PlansManager,
  payments:     Payments,
  users:        UsersRoles,
  logs:         AuditLogs,
  health:       SystemHealth,
  settings:     SystemSettings,
};

export default function SuperAdmin({ onLogout, initialActive = 'dashboard' }) {
  const [active, setActive]       = useState(initialActive);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const Section = SECTION_MAP[active] || Dashboard;

  const handleLogout = () => {
    sessionStorage.removeItem('superadmin_auth');
    if (onLogout) onLogout();
    else window.location.href = '/';
  };

  const SidebarContent = () => (
    <div className="sa2-sidebar-inner">
      <div className="sa2-sidebar-logo">
        <img src="/hova-logo.png" alt="BilHot" className="sa2-logo-img"/>
        {!collapsed && <span className="sa2-logo-text">Control Center</span>}
      </div>

      <nav className="sa2-nav">
        {GROUPS.map(group => {
          const items = NAV.filter(n => n.group === group.id);
          return (
            <div key={group.id} className="sa2-nav-group">
              {!collapsed && <div className="sa2-nav-group-label">{group.label}</div>}
              {items.map(item => (
                <button
                  key={item.id}
                  className={`sa2-nav-item ${active === item.id ? 'active' : ''}`}
                  onClick={() => { setActive(item.id); setMobileOpen(false); }}
                  title={collapsed ? item.label : undefined}
                >
                  <item.Icon size={17}/>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sa2-sidebar-footer">
        <div className="sa2-admin-pill">
          <div className="sa2-admin-avatar">SA</div>
          {!collapsed && (
            <div className="sa2-admin-info">
              <div className="sa2-admin-name">Super Admin</div>
              <div className="sa2-admin-email">admin@hosflow.com</div>
            </div>
          )}
        </div>
        <button className="sa2-nav-item sa2-logout-btn" onClick={handleLogout} title="Déconnexion">
          <LogOut size={15}/>
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="sa2-root">
      {/* Mobile overlay */}
      {mobileOpen && <div className="sa2-mobile-overlay" onClick={() => setMobileOpen(false)}/>}

      {/* Sidebar desktop */}
      <aside className={`sa2-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <button className="sa2-collapse-btn" onClick={() => setCollapsed(v => !v)}>
          {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
        </button>
        <SidebarContent/>
      </aside>

      {/* Sidebar mobile */}
      <aside className={`sa2-sidebar sa2-sidebar-mobile ${mobileOpen ? 'open' : ''}`}>
        <SidebarContent/>
      </aside>

      {/* Main */}
      <div className="sa2-main">
        <header className="sa2-topbar">
          <button className="sa2-mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
          <div className="sa2-topbar-title">
            {NAV.find(n => n.id === active)?.label || 'Control Center'}
          </div>
          <div className="sa2-topbar-right">
            <span className="sa2-topbar-badge">Hova v2.0</span>
          </div>
        </header>
        <main className="sa2-content">
          <Section/>
        </main>
      </div>
    </div>
  );
}
