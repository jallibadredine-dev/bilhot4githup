import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Globe, HeadphonesIcon,
  Shield, TrendingUp, TrendingDown, Server, Zap, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Search, Filter,
  ChevronDown, MoreHorizontal, Plus, Lock, Unlock, Eye,
  Wifi, WifiOff, Activity, Settings, Bell, ArrowUpRight,
  Building2, Home, MessageSquare, Key, Package, BarChart3,
  CheckCheck, Clock, LogOut, Database, Layers, Star,
  ShieldAlert, UserPlus, FileText, Share2, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './SuperAdmin.css';

/* ────────────────────────────────────────
   MOCK DATA (Refined for Omnichannel)
   ──────────────────────────────────────── */
const revenueData = [
  { m: 'Oct', hot: 6200, pro: 12200, total: 18400 },
  { m: 'Nov', hot: 7800, pro: 14300, total: 22100 },
  { m: 'Dec', hot: 9200, pro: 17600, total: 26800 },
  { m: 'Jan', hot: 10800, pro: 20400, total: 31200 },
  { m: 'Feb', hot: 9900, pro: 19800, total: 29700 },
  { m: 'Mar', hot: 13200, pro: 25700, total: 38900 },
];

const TENANTS = [
  { id: 1, name: 'Résidence Elysée', email: 'admin@elysee.fr', plan: 'gold', mode: 'pro', status: 'active', mrr: 2990, properties: 12, owner: 'Amine Bensouda' },
  { id: 4, name: 'Eco Stay Boutique', owner: 'Laila Benali', properties: 3, mrr: 149, plan: 'silver', mode: 'hot', status: 'active' },
];

const LED_CLIENTS = [
  { id: 'l1', name: 'Marc-Antoine Vallet', country: '🇫🇷 France', score: '4.8/5', lastStay: 'Villa Horizon', subStatus: 'active', expires: '2026-05-12' },
  { id: 'l2', name: 'Sarah Jenkins', country: '🇬🇧 UK', score: '5.0/5', lastStay: 'Riad Dar El Sadaka', subStatus: 'expiring', expires: '2026-04-25' },
  { id: 'l3', name: 'Ayoub El Fassi', country: '🇲🇦 Maroc', score: '4.2/5', lastStay: 'Atlas Suites', subStatus: 'expired', expires: '2026-03-10' },
  { id: 'l4', name: 'James Wilson', country: '🇺🇸 USA', score: '4.9/5', lastStay: 'Palm Resort', subStatus: 'banned', expires: '2026-01-01' },
];

const APIS = [
  { id: 'channex', name: 'Channex.io', type: 'Channel Manager', status: 'operational', uptime: 99.99, latency: 120, icon: <Globe size={18} /> },
  { id: 'stripe', name: 'Stripe Payments', type: 'Gateway', status: 'operational', uptime: 99.97, latency: 82, icon: <CreditCard size={18} /> },
  { id: 'ttlock', name: 'TTHotel / TTLock', type: 'Smart Lock', status: 'degraded', uptime: 96.44, latency: 980, icon: <Key size={18} /> },
  { id: 'twilio', name: 'Twilio Cloud', type: 'SMS & WhatsApp', status: 'operational', uptime: 99.9, latency: 145, icon: <MessageSquare size={18} /> },
  { id: 'google', name: 'Google Workspace', type: 'Authentication', status: 'operational', uptime: 100, latency: 45, icon: <Lock size={18} /> },
  { id: 'openai', name: 'OpenAI API', type: 'Intelligence Artificielle', status: 'operational', uptime: 99.98, latency: 380, icon: <Zap size={18} /> },
  { id: 'oracleai', name: 'Oracle AI Engine', type: 'Chat Live & AI Ops', status: 'operational', uptime: 99.95, latency: 410, icon: <Activity size={18} /> },
];

const ALERTS = [
  { id: 1, title: 'Déconnexion API TTLock', desc: 'Surcharge requêtes V3 - 3 tenants affectés.', type: 'critical', time: '2m' },
  { id: 2, title: 'Retard de paiement', desc: 'Nomad Stays - Facture de 149€ impayée.', type: 'warning', time: '14m' },
];

const PLAN_FEATURES = [
  { id: 'ai', label: 'Oracle AI Engine', icon: <Zap size={14} /> },
  { id: 'iot', label: 'IoT Smart Locks', icon: <Key size={14} /> },
  { id: 'comms', label: 'SMS & WhatsApp (Twilio)', icon: <MessageSquare size={14} /> },
  { id: 'channex', label: 'Channel Manager Hub', icon: <Globe size={14} /> },
  { id: 'reporting', label: 'Advanced Reporting', icon: <BarChart3 size={14} /> },
  { id: 'multi', label: 'Multi-Property Support', icon: <Building2 size={14} /> },
];

const INITIAL_PLANS = {
  bronze: { price: 49, features: ['channex'], propertiesLimit: 1 },
  silver: { price: 149, features: ['channex', 'iot'], propertiesLimit: 5 },
  gold: { price: 349, features: ['channex', 'iot', 'comms', 'reporting'], propertiesLimit: 20 },
  enterprise: { price: 899, features: ['ai', 'iot', 'comms', 'channex', 'reporting', 'multi'], propertiesLimit: 999 },
};

/* ────────────────────────────────────────
   COMPONENTS
   ──────────────────────────────────────── */

// mode: global | hot | pro
const SelecteurMode = ({ mode, setMode }) => (
  <div className="mode-selector-container">
    <div className="mode-selector-track">
      <button className={`mode-btn ${mode === 'global' ? 'active' : ''}`} onClick={() => setMode('global')}>GLOBAL</button>
      <button className={`mode-btn ${mode === 'hot' ? 'active' : ''}`} onClick={() => setMode('hot')}>PMSA - HÔTE</button>
      <button className={`mode-btn ${mode === 'pro' ? 'active' : ''}`} onClick={() => setMode('pro')}>PMS PRO</button>
      <div className={`mode-slider mode-${mode}`} />
    </div>
  </div>
);

const SectionDashboard = ({ mode }) => {
  const chartData = useMemo(() => {
    if (mode === 'global') return revenueData;
    return revenueData.map(d => ({ m: d.m, value: d[mode] }));
  }, [mode]);

  return (
    <div className="sa-dashboard-view">
      {/* KPI Widgets */}
      <div className="sa-widget-row">
        <div className="sa-card sa-interactive-card">
          <div className="card-lbl">MRR TOTAL</div>
          <div className="card-val">{mode === 'pro' ? '$25.7k' : mode === 'hot' ? '$13.2k' : '$38.9k'}</div>
          <div className="card-delta up">+12.4% vs mois dernier</div>
          <TrendingUp className="card-bg-icon" />
        </div>
        <div className="sa-card sa-interactive-card">
          <div className="card-lbl">LICENCES ACTIVES</div>
          <div className="card-val">{mode === 'pro' ? '54' : mode === 'hot' ? '193' : '247'}</div>
          <div className="card-delta">Net +18 ce mois</div>
          <Shield className="card-bg-icon" />
        </div>
        <div className="sa-card sa-interactive-card">
          <div className="card-lbl">API HEALTH</div>
          <div className="card-val">99.2%</div>
          <div className="card-delta">Statut opérationnel</div>
          <Activity className="card-bg-icon" />
        </div>
      </div>

      <div className="sa-dashboard-grid">
        {/* Growth Chart */}
        <div className="sa-card sa-chart-card">
          <div className="sa-card-header">
            <h3>Croissance Cumulative (Revenue)</h3>
            <div className="chart-legend">
              {mode === 'global' ? (
                <>
                  <span className="legend-item pro">Pro</span>
                  <span className="legend-item hot">Hot</span>
                </>
              ) : (
                <span className={`legend-item ${mode}`}>{mode.toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="chart-container" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                />
                {mode === 'global' ? (
                  <>
                    <Area type="monotone" dataKey="pro" stroke="#2E5BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorPro)" />
                    <Area type="monotone" dataKey="hot" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorHot)" />
                  </>
                ) : (
                  <Area type="monotone" dataKey="value" stroke={mode === 'pro' ? '#2E5BFF' : '#8b5cf6'} strokeWidth={3} fillOpacity={1} fill={`url(#color${mode.charAt(0).toUpperCase() + mode.slice(1)})`} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Center */}
        <div className="sa-card sa-alert-card">
          <div className="sa-card-header">
            <h3>Centre d'Alertes</h3>
            <span className="badge-red">{ALERTS.length}</span>
          </div>
          <div className="alert-list">
            {ALERTS.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'critical' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div className="alert-body">
                  <div className="alert-title sa-clickable">{alert.title}</div>
                  <div className="alert-desc">{alert.desc}</div>
                </div>
                <div className="alert-time">{alert.time} ago</div>
              </div>
            ))}
          </div>
          <button className="white-action-btn mt-4 sa-clickable">Voir tout l'historique</button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   MAIN APP SHELL
   ──────────────────────────────────────── */

export default function SuperAdmin() {
  const [mode, setMode] = useState('global');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingApi, setEditingApi] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success

  const filteredTenants = useMemo(() => {
    let list = TENANTS;
    if (mode !== 'global') list = list.filter(t => t.mode === mode);
    if (searchQuery) {
      list = list.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [mode, searchQuery]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const togglePlanFeature = (planId, featureId) => {
    setPlans(prev => {
      const currentFeatures = prev[planId].features;
      const newFeatures = currentFeatures.includes(featureId)
        ? currentFeatures.filter(f => f !== featureId)
        : [...currentFeatures, featureId];
      return {
        ...prev,
        [planId]: { ...prev[planId], features: newFeatures }
      };
    });
  };

  const updatePlanPrice = (planId, newPrice) => {
    setPlans(prev => ({
      ...prev,
      [planId]: { ...prev[planId], price: parseInt(newPrice) || 0 }
    }));
  };

  const handleSaveConfig = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800)
  };

  const navigation = [
    { section: 'SURVEILLANCE FINANCIÈRE', items: [
      { id: 'billing', label: 'Paiements & Facturation', icon: <CreditCard size={18} /> },
      { id: 'plan-builder', label: 'Abonnements & Offres', icon: <Layers size={18} /> },
    ]},
    { section: 'LICENCES & CLIENTS', items: [
      { id: 'mms-hot', label: 'Management PMS Hôte', icon: <Home size={18} />, hidden: mode === 'pro' },
      { id: 'mms-pro', label: 'Management PMS Pro', icon: <Building2 size={18} />, hidden: mode === 'hot' },
      { id: 'clients-led', label: 'Base Clients LED', icon: <Users size={18} /> },
    ]},
    { section: 'TECHNIQUE & CONNECTIVITÉ', items: [
      { id: 'integrations', label: 'Hub d\'Intégrations', icon: <Terminal size={18} /> },
      { id: 'permissions', label: 'Permissions & Rôles', icon: <Shield size={18} /> },
    ]}
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <SectionDashboard mode={mode} />;
      case 'billing': 
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="sa-content-placeholder"
          >
             <div className="sa-card">
                <div className="sa-card-header">
                   <h3>Suivi des Abonnements</h3>
                   <div className="sa-search-mini">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Filtrer les factures..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                </div>
                <div className="sa-table-wrap">
                   <table className="sa-modern-table">
                     <thead>
                       <tr>
                         <th>CLIENT</th>
                         <th>PLAN</th>
                         <th>STATUT</th>
                         <th>DERNIER PAIEMENT</th>
                         <th>ACTIONS</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredTenants.map(t => (
                         <tr key={t.id}>
                           <td className="sa-clickable font-bold">{t.name}</td>
                           <td><span className={`plan-pill ${t.plan}`}>{t.plan.toUpperCase()}</span></td>
                           <td><span className={`status-pill ${t.status}`}>{t.status}</span></td>
                           <td className="text-slate-500">12/03/2026</td>
                           <td><MoreHorizontal className="sa-clickable" size={16} /></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        );
      case 'plan-builder':
        return (
          <div className="sa-plan-builder-view">
             <div className="sa-card mb-6">
                <div className="sa-card-header">
                   <h3>Matrice des Offres Globales</h3>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="white-action-btn sa-clickable" onClick={() => setPlans(INITIAL_PLANS)}>Réinitialiser</button>
                      <button className="white-action-btn primary-cobalt sa-clickable">Sauvegarder les Offres</button>
                   </div>
                </div>
                <div className="sa-table-wrap">
                   <table className="sa-modern-table sa-matrix-table">
                      <thead>
                         <tr>
                            <th>FONCTIONNALITÉS</th>
                            {Object.keys(plans).map(p => <th key={p} className="text-center">{p.toUpperCase()}</th>)}
                         </tr>
                      </thead>
                      <tbody>
                         <tr>
                            <td className="font-bold">Prix Mensuel (€)</td>
                            {Object.keys(plans).map(p => (
                               <td key={p} className="text-center">
                                  <input 
                                    type="number" 
                                    className="sa-price-input" 
                                    value={plans[p].price} 
                                    onChange={(e) => updatePlanPrice(p, e.target.value)}
                                  />
                               </td>
                            ))}
                         </tr>
                         <tr>
                            <td className="font-bold">Limite de Propriétés</td>
                            {Object.keys(plans).map(p => (
                               <td key={p} className="text-center font-bold text-slate-500">
                                  {plans[p].propertiesLimit === 999 ? '∞' : plans[p].propertiesLimit}
                               </td>
                            ))}
                         </tr>
                         {PLAN_FEATURES.map(feature => (
                           <tr key={feature.id}>
                              <td className="feature-cell">
                                 {feature.icon}
                                 <span>{feature.label}</span>
                              </td>
                              {Object.keys(plans).map(p => (
                                <td key={p} className="text-center">
                                   <label className="sa-mini-toggle">
                                      <input 
                                        type="checkbox" 
                                        checked={plans[p].features.includes(feature.id)}
                                        onChange={() => togglePlanFeature(p, feature.id)}
                                      />
                                      <span className="toggle-slider" />
                                   </label>
                                </td>
                              ))}
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );
      case 'mms-hot':
      case 'mms-pro': {
        const filteredList = TENANTS.filter(t => t.mode === (activeTab === 'mms-hot' ? 'hot' : 'pro'));
        return (
          <div className="sa-management-view">
            <div className={`sa-management-main ${selectedTenant ? 'with-panel' : ''}`}>
              <div className="sa-card">
                <div className="sa-card-header">
                  <h3>{activeTab === 'mms-hot' ? 'Propriétaires Individuels (HOT)' : 'Agences & Conciergeries (PRO)'}</h3>
                  <button 
                    className="white-action-btn primary-cobalt sa-clickable"
                    onClick={() => setIsNewClientModalOpen(true)}
                  >
                    <UserPlus size={16}/> Nouveau Client {(activeTab === 'mms-hot' ? 'HOT' : 'PRO')}
                  </button>
                </div>
                <div className="sa-table-wrap mt-4">
                  <table className="sa-modern-table">
                    <thead>
                      <tr>
                        <th>PROPRIÉTÉ / AGENCE</th>
                        <th>RESPONSABLE</th>
                        <th>UNITÉS</th>
                        <th>PLAN</th>
                        <th>SANTÉ</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map(t => (
                        <tr key={t.id} className={selectedTenant?.id === t.id ? 'active-row' : ''}>
                          <td className="sa-clickable font-bold" onClick={() => setSelectedTenant(t)}>{t.name}</td>
                          <td className="text-slate-500">{t.owner}</td>
                          <td>{t.properties} / {plans[t.plan].propertiesLimit}</td>
                          <td><span className={`plan-pill ${t.plan}`}>{t.plan.toUpperCase()}</span></td>
                          <td><div className="health-dot active" /></td>
                          <td>
                            <button className="icon-btn-gray sa-clickable" onClick={() => setSelectedTenant(t)}><Settings size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {selectedTenant && selectedTenant.type !== 'led' && (
              <div className="sa-side-panel">
                <div className="panel-header">
                  <h4>Limites & Overrides : {selectedTenant.name}</h4>
                  <XCircle className="sa-clickable" size={18} onClick={() => setSelectedTenant(null)} />
                </div>
                <div className="panel-content">
                  <div className="override-section">
                    <label>Abonnement Forcé</label>
                    <select className="sa-modern-select" defaultValue={selectedTenant.plan}>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className="override-section mt-6">
                    <div className="label-with-toggle">
                      <span>IA Oracle (Boost)</span>
                      <label className="sa-mini-toggle">
                        <input type="checkbox" defaultChecked={selectedTenant.plan === 'enterprise'} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                    <p className="tiny-info text-slate-400">Permet au client d'utiliser l'IA même si son plan ne l'inclut pas.</p>
                  </div>

                  <div className="override-section mt-6">
                    <label>Limite Propriétés Manuelle</label>
                    <input type="number" className="sa-modern-input" defaultValue={selectedTenant.properties} />
                  </div>

                  <div className="panel-divider my-6" />

                  <div className="override-section">
                    <label className="section-title">Automatisations de Relances</label>
                    <div className="label-with-toggle mt-3">
                      <span className="flex items-center gap-2"><FileText size={14}/> Alertes Renouvellement (Mail)</span>
                      <label className="sa-mini-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                    <div className="label-with-toggle mt-3">
                      <span className="flex items-center gap-2"><MessageSquare size={14}/> Alertes WhatsApp / SMS</span>
                      <label className="sa-mini-toggle">
                        <input type="checkbox" />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="override-section mt-8">
                    <label className="section-title">Actions Critiques</label>
                    <button className="sa-btn action-alert-btn mt-3 w-full sa-clickable">
                      <Bell size={14} /> Envoyer Rappel de Paiement
                    </button>
                    {selectedTenant.status === 'suspended' ? (
                      <button className="sa-btn action-success-btn mt-3 w-full sa-clickable sa-confirm-btn">
                        <Unlock size={14} /> Libérer l'Accès au PMS
                      </button>
                    ) : (
                      <button className="sa-btn action-danger-btn mt-3 w-full sa-clickable sa-confirm-btn">
                        <Lock size={14} /> Bloquer l'Accès (Suspendre)
                      </button>
                    )}
                  </div>

                  <div className="panel-footer mt-auto pt-6">
                    <button 
                      className={`sa-btn primary-cobalt w-full sa-interactive-btn ${saveStatus}`}
                      onClick={handleSaveConfig}
                      disabled={saveStatus !== 'idle'}
                    >
                      {saveStatus === 'idle' && 'Enregistrer les Modifications'}
                      {saveStatus === 'saving' && <><RefreshCw size={14} className="animate-spin" /> Sauvegarde...</>}
                      {saveStatus === 'success' && <><CheckCircle size={14} /> Modifications Enregistrées !</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'clients-led':
        return (
          <div className="sa-management-view">
            <div className={`sa-management-main ${selectedTenant?.type === 'led' ? 'with-panel' : ''}`}>
              <div className="sa-card">
                <div className="sa-card-header">
                   <h3>Répertoire Centralisé "Base Clients LED"</h3>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="white-action-btn sa-clickable"><UserPlus size={16}/> Exporter DB</button>
                      <button 
                        className="white-action-btn primary-cobalt sa-clickable"
                        onClick={() => setIsNewClientModalOpen(true)}
                      >
                        <Plus size={16}/> Nouveau Client LED
                      </button>
                   </div>
                </div>
                <div className="sa-table-wrap mt-6">
                   <table className="sa-modern-table">
                      <thead>
                        <tr>
                           <th>NOM COMPLET</th>
                           <th>PAYS</th>
                           <th>FIDÉLITÉ</th>
                           <th>ABONNEMENT</th>
                           <th>EXPIRATION</th>
                           <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LED_CLIENTS.map(c => (
                          <tr key={c.id} className={selectedTenant?.id === c.id ? 'active-row' : ''}>
                             <td className="sa-clickable font-bold" onClick={() => setSelectedTenant({ ...c, type: 'led' })}>{c.name}</td>
                             <td className="text-slate-500">{c.country}</td>
                             <td className="font-bold">{c.score}</td>
                             <td><span className={`status-pill ${c.subStatus}`}>{c.subStatus.toUpperCase()}</span></td>
                             <td className="text-slate-500">{c.expires}</td>
                             <td>
                                <button className="icon-btn-gray sa-clickable" onClick={() => setSelectedTenant({ ...c, type: 'led' })}>
                                   <Settings size={14} />
                                </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>
            </div>

            {selectedTenant?.type === 'led' && (
              <div className="sa-side-panel">
                 <div className="panel-header">
                    <h4>Gestion LED : {selectedTenant.name}</h4>
                    <XCircle className="sa-clickable" size={18} onClick={() => setSelectedTenant(null)} />
                 </div>
                 <div className="panel-content">
                    <div className="override-section">
                       <label className="section-title">Abonnement Manuel</label>
                       <div className="sa-quick-actions gap-2 mt-3">
                          <button className="white-action-btn sa-clickable flex-1">+30 Jours</button>
                          <button className="white-action-btn sa-clickable flex-1">+1 An</button>
                       </div>
                    </div>

                    <div className="panel-divider my-6" />

                    <div className="override-section">
                       <label className="section-title">Automatisation Alertes (Branding)</label>
                       <div className="label-with-toggle mt-3">
                          <span className="flex items-center gap-2"><FileText size={14}/> Relances Mail (Votre Marque)</span>
                          <label className="sa-mini-toggle">
                             <input type="checkbox" defaultChecked />
                             <span className="toggle-slider" />
                          </label>
                       </div>
                       <div className="label-with-toggle mt-3">
                          <span className="flex items-center gap-2"><MessageSquare size={14}/> Alerte SMS de Renouvellement</span>
                          <label className="sa-mini-toggle">
                             <input type="checkbox" />
                             <span className="toggle-slider" />
                          </label>
                       </div>
                    </div>

                    <div className="panel-divider my-6" />

                    <div className="override-section">
                       <label className="section-title">Action Post-Expiration</label>
                       <select className="sa-modern-select mt-3 w-full">
                          <option value="alert">Alerte Uniquement</option>
                          <option value="block">Bloquer l'Utilisateur</option>
                          <option value="ban">Bannir Définitivement</option>
                       </select>
                    </div>

                    <div className="override-section mt-8">
                       <label className="section-title">Zone de Danger</label>
                       <button className="sa-btn action-danger-btn mt-3 w-full sa-clickable">
                          <ShieldAlert size={14} /> Bannir le Client (Blacklist)
                       </button>
                    </div>

                    <div className="panel-footer mt-auto pt-6">
                       <button className="sa-btn primary-cobalt w-full">Valider la Configuration</button>
                    </div>
                 </div>
              </div>
            )}
          </div>
        );
      case 'integrations':
        return (
          <div className="sa-integrations-view">
             <div className="sa-card mb-6">
                <div className="sa-card-header">
                   <h3>Hub d'Intégrations Omnicanal</h3>
                   <div className="uptime-global"><Activity size={14}/> 99.98% Global Connectivity</div>
                </div>
                <div className="api-list-detailed">
                   {APIS.map(api => (
                     <div key={api.id} className="api-row-detailed sa-interactive-card mb-3">
                        <div className="api-icon-wrap">{api.icon}</div>
                        <div className="api-main-info">
                           <div className="api-name sa-clickable">{api.name}</div>
                           <div className="api-type-tag">{api.type}</div>
                        </div>
                        <div className="api-stat">
                           <div className="m-val">{api.uptime}%</div>
                           <div className="m-lbl">Uptime</div>
                        </div>
                        <div className="api-stat">
                           <div className="m-val">{api.latency}ms</div>
                           <div className="m-lbl">Latence</div>
                        </div>
                        <div className="api-status-wrap">
                           <div className={`api-status-pill ${api.status}`}>{api.status === 'operational' ? 'En ligne' : 'Dégradé'}</div>
                        </div>
                        <div className="api-actions">
                           <button 
                             className="icon-btn-gray sa-clickable" 
                             onClick={() => setEditingApi(api)}
                           >
                             <Settings size={14} />
                           </button>
                           <button className="icon-btn-gray sa-clickable"><RefreshCw size={14} /></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="sa-card">
                <h3>Gestion de l'IA & Chat Live (Oracle AI)</h3>
                <div className="oracle-ai-config mt-4">
                   <div className="config-grid">
                      <div className="config-item">
                         <div className="config-label">OpenAI API Key</div>
                         <div className="config-input-fake text-slate-400">sk-•••••••••••••••••••••••••••••</div>
                      </div>
                      <div className="config-item">
                         <div className="config-label">Modèle Actif</div>
                         <div className="config-input-fake">GPT-4o (Oracle Optimized)</div>
                      </div>
                   </div>
                   <div className="doc-grid mt-6">
                      <div className="doc-item sa-clickable"><FileText size={18}/> Logs Oracle AI</div>
                      <div className="doc-item sa-clickable"><FileText size={18}/> Training Dataset</div>
                      <div className="doc-item sa-clickable"><FileText size={18}/> Live Chat Routing</div>
                   </div>
                </div>
             </div>
          </div>
        );
      default: return <div className="sa-card">En cours de développement...</div>;
    }
  };

  return (
    <div className={`sa-omni-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
      
      <aside className="sa-sidebar">
        <div className="sa-sidebar-top">
          <div className="sa-logo-brand">
             <div className="logo-box">HF</div>
             {!isSidebarCollapsed && (
               <div className="brand-text">
                  <strong>HOSFLOW</strong>
                  <span>SUPER ADMIN</span>
               </div>
             )}
             
             <button className="mobile-close-btn" onClick={() => setIsMobileMenuOpen(false)}>
               <XCircle size={24} />
             </button>
          </div>
          
          <SelecteurMode mode={mode} setMode={setMode} />
        </div>

        <nav className="sa-sidebar-nav hide-scrollbar">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            {!isSidebarCollapsed && <span>Tableau de Bord</span>}
          </div>

          {navigation.map((section, idx) => (
            <div key={idx} className="nav-section">
              {!isSidebarCollapsed && <div className="section-label">{section.section}</div>}
              {section.items.map(item => !item.hidden && (
                <div 
                  key={item.id} 
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false); // Close on mobile navigation
                  }}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  {item.icon}
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
           <div className="nav-item sa-clickable" onClick={toggleSidebar}>
             {isSidebarCollapsed ? <Plus size={18} style={{ transform: 'rotate(45deg)' }} /> : (
               <><Settings size={18}/> <span>Paramètres</span></>
             )}
           </div>
           <div className="nav-item sa-clickable" onClick={toggleTheme}>
             {isDarkMode ? <Star size={18} /> : <Star size={18} fill="currentColor" />}
             {!isSidebarCollapsed && <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa-main-wrap">
        <header className="sa-top-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <div className="bar" />
              <div className="bar" />
              <div className="bar" />
            </button>
            <h1 className="sa-page-title">
              {navigation.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de Bord'}
            </h1>
            <div className="sa-breadcrumb">HosFlow HQ / {activeTab}</div>
          </div>

          <div className="header-center">
             <div className="sa-global-search">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Recherche globale (Tenants, APIs, Factures)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="header-right">
             <div className="header-notif sa-clickable">
                <Bell size={20} />
                <span className="notif-dot" />
             </div>
             <div className="admin-profile-pill sa-clickable">
                <div className="admin-avatar">AD</div>
                {!isSidebarCollapsed && (
                  <div className="admin-info">
                     <strong>Admin Tech</strong>
                     <span>HosFlow HQ</span>
                  </div>
                )}
             </div>
          </div>
        </header>

        <div className="sa-workspace hide-scrollbar">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.2 }}
             >
                {renderContent()}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>

      {/* NEW CLIENT MODAL */}
      {isNewClientModalOpen && (
        <div className="sa-modal-overlay">
           <div className="sa-config-modal sa-new-client-modal">
              <div className="modal-header">
                 <div className="provider-info">
                    <div className="provider-icon"><UserPlus size={20} /></div>
                    <div className="provider-text">
                       <h3>Créer un Nouveau Client</h3>
                       <span>Configuration de l'accès initial</span>
                    </div>
                 </div>
                 <XCircle className="sa-clickable" size={20} onClick={() => setIsNewClientModalOpen(false)} />
              </div>
              <div className="modal-body">
                 <div className="config-group">
                    <label>Nom du Client / Enseigne</label>
                    <input type="text" className="sa-modern-input" placeholder="Ex: Riad Dar El Sadaka" />
                 </div>
                 <div className="config-group">
                    <label>Email de Contact</label>
                    <input type="email" className="sa-modern-input" placeholder="contact@client.com" />
                 </div>
                 <div className="config-group">
                    <label>Module HosFlow</label>
                    <select className="sa-modern-select">
                       <option value="hot">PMS HOT (Seasonal/Villa)</option>
                       <option value="pro">PMS PRO (Agency/Complex)</option>
                       <option value="led">Client LED (Light Edition)</option>
                    </select>
                 </div>
                 <div className="config-group">
                    <label>Plan Inicial</label>
                    <select className="sa-modern-select">
                       <option value="bronze">Plan Bronze</option>
                       <option value="silver">Plan Silver</option>
                       <option value="gold">Plan Gold</option>
                       <option value="enterprise">Plan Enterprise</option>
                    </select>
                 </div>

                 <div className="config-notice mt-4">
                    <Shield size={14} />
                    <span>Un email contenant les identifiants générés sera envoyé automatiquement à l'adresse indiquée.</span>
                 </div>
              </div>
              <div className="modal-footer">
                 <button className="sa-btn text-slate-500" onClick={() => setIsNewClientModalOpen(false)}>Annuler</button>
                 <button className="sa-btn primary-cobalt" onClick={() => setIsNewClientModalOpen(false)}>
                    Générer & Envoyer Identifiants
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* API Configuration Modal */}
      {editingApi && (
        <div className="sa-modal-overlay">
           <div className="sa-config-modal">
              <div className="modal-header">
                 <div className="provider-info">
                    <div className="provider-icon">{editingApi.icon}</div>
                    <div className="provider-text">
                       <h3>Configuration {editingApi.name}</h3>
                       <span>{editingApi.type}</span>
                    </div>
                 </div>
                 <XCircle className="sa-clickable" size={20} onClick={() => setEditingApi(null)} />
              </div>

              <div className="modal-body">
                 {editingApi?.id === 'twilio' ? (
                   <>
                      <div className="config-group">
                         <label>Account SID</label>
                         <input type="text" className="sa-modern-input" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx" />
                      </div>
                      <div className="config-group">
                         <label>Auth Token</label>
                         <input type="password" className="sa-modern-input" placeholder="••••••••••••••••••••" />
                      </div>
                   </>
                 ) : (editingApi?.id === 'ttlock' || editingApi?.id === 'google') ? (
                   <>
                      <div className="config-group">
                         <label>Client ID</label>
                         <input type="text" className="sa-modern-input" placeholder="0000000-xxxx-xxxx" />
                      </div>
                      <div className="config-group">
                         <label>Client Secret</label>
                         <input type="password" className="sa-modern-input" placeholder="••••••••••••••••••••" />
                      </div>
                   </>
                 ) : (
                   <div className="config-group">
                      <label>API Key / Token d'accès</label>
                      <div className="input-with-eye">
                         <input type="password" className="sa-modern-input" placeholder="Saisir la clé API..." />
                         <Eye size={16} className="pw-eye" />
                      </div>
                   </div>
                 )}

                 <div className="config-notice mt-4">
                    <Shield size={14} />
                    <span>Vos identifiants sont chiffrés et stockés dans un coffre-fort sécurisé (AES-256).</span>
                 </div>
              </div>

              <div className="modal-footer">
                 <button className="sa-btn text-slate-500" onClick={() => setEditingApi(null)}>Annuler</button>
                 <button className="sa-btn primary-cobalt" onClick={() => setEditingApi(null)}>Sauvegarder & Connecter</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
