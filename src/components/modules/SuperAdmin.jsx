import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Globe, Calendar,
  Shield, TrendingUp, TrendingDown, Zap, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Search,
  MoreHorizontal, Plus, Lock, Unlock, Eye, EyeOff,
  Activity, Settings, Bell, Building2, Home,
  MessageSquare, Key, BarChart3, Database, Layers, Star,
  ShieldAlert, UserPlus, FileText, Share2, Terminal,
  Mail, Wallet, UserCheck, Crown, Trash2, Edit3,
  Copy, LogOut, Clock, DollarSign, Hash,
  Save, AlertCircle, ChevronRight, Package,
  ToggleLeft, ToggleRight, Server, Wifi, WifiOff,
  Download, Filter, PieChart as PieIcon, LineChart as LineIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import './SuperAdmin.css';

/* ═══════════════════════════════════════════
   STATIC DATA
   ═══════════════════════════════════════════ */
const REVENUE_MOCK = [
  { m: 'Oct', mrr: 18400 }, { m: 'Nov', mrr: 22100 }, { m: 'Dec', mrr: 26800 },
  { m: 'Jan', mrr: 31200 }, { m: 'Fév', mrr: 29700 }, { m: 'Mar', mrr: 38900 },
];

const PLAN_COLORS = {
  starter: '#94A3B8', bronze: '#CD7F32', silver: '#94A3B8',
  gold: '#F59E0B', enterprise: '#8B5CF6', pro: '#2E5BFF', lifetime: '#10B981',
};

const ROLE_COLORS = {
  super_admin: '#EF4444', admin: '#F59E0B', manager: '#3B82F6',
  support: '#8B5CF6', user: '#94A3B8',
};

const PLAN_FEATURES = [
  { id: 'ai',        label: 'Oracle AI Engine',        icon: <Zap size={13}/> },
  { id: 'iot',       label: 'IoT Smart Locks',          icon: <Key size={13}/> },
  { id: 'comms',     label: 'SMS & WhatsApp',           icon: <MessageSquare size={13}/> },
  { id: 'channex',   label: 'Channel Manager',          icon: <Globe size={13}/> },
  { id: 'reporting', label: 'Rapports Avancés',         icon: <BarChart3 size={13}/> },
  { id: 'multi',     label: 'Multi-Propriétés',         icon: <Building2 size={13}/> },
  { id: 'api',       label: 'Accès API',                icon: <Terminal size={13}/> },
  { id: 'support',   label: 'Support Prioritaire',      icon: <UserCheck size={13}/> },
];

const INITIAL_PLANS = {
  starter:    { price: 0,   features: [],                                          propertiesLimit: 1,   trial: 14  },
  silver:     { price: 149, features: ['channex', 'iot'],                          propertiesLimit: 5,   trial: 7   },
  gold:       { price: 349, features: ['channex', 'iot', 'comms', 'reporting'],    propertiesLimit: 20,  trial: 0   },
  enterprise: { price: 899, features: ['ai','iot','comms','channex','reporting','multi','api','support'], propertiesLimit: 999, trial: 0 },
};

const API_PROVIDERS = [
  { id: 'channex', name: 'Channex.io',        type: 'Channel Manager',  status: 'operational', uptime: 99.99, latency: 120, icon: <Globe size={16}/> },
  { id: 'stripe',  name: 'Stripe Payments',   type: 'Gateway',          status: 'operational', uptime: 99.97, latency: 82,  icon: <CreditCard size={16}/> },
  { id: 'ttlock',  name: 'TTLock / TTHotel',  type: 'Smart Lock',       status: 'degraded',    uptime: 96.44, latency: 980, icon: <Key size={16}/> },
  { id: 'twilio',  name: 'Twilio Cloud',      type: 'SMS & WhatsApp',   status: 'operational', uptime: 99.9,  latency: 145, icon: <MessageSquare size={16}/> },
  { id: 'openai',  name: 'OpenAI GPT-4o',     type: 'Intelligence AI',  status: 'operational', uptime: 99.98, latency: 380, icon: <Zap size={16}/> },
  { id: 'google',  name: 'Google OAuth',      type: 'Authentication',   status: 'operational', uptime: 100,   latency: 45,  icon: <Shield size={16}/> },
];

const PERMISSIONS = {
  super_admin: { dashboard: true, clients: true, plans: true, payments: true, apis: true, analytics: true, roles: true, logs: true, system: true },
  admin:       { dashboard: true, clients: true, plans: true, payments: true, apis: false, analytics: true, roles: false, logs: true, system: false },
  manager:     { dashboard: true, clients: true, plans: false, payments: false, apis: false, analytics: true, roles: false, logs: false, system: false },
  support:     { dashboard: true, clients: true, plans: false, payments: false, apis: false, analytics: false, roles: false, logs: true, system: false },
  user:        { dashboard: false, clients: false, plans: false, payments: false, apis: false, analytics: false, roles: false, logs: false, system: false },
};

const PIE_COLORS = ['#2E5BFF', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#94A3B8'];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) : '—';
const fmtAmt  = (n) => Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0 });

const StatusPill = ({ status }) => {
  const map = {
    active:'#10B981', inactive:'#94A3B8', suspended:'#EF4444', trial:'#F59E0B',
    succeeded: '#10B981', paid: '#10B981', failed: '#EF4444', pending: '#F59E0B', refunded: '#8B5CF6',
  };
  const color = map[status] || '#94A3B8';
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}40`, borderRadius: 5, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const PlanPill = ({ plan }) => {
  const color = PLAN_COLORS[plan] || '#94A3B8';
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}40`, borderRadius: 5, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
      {plan || 'starter'}
    </span>
  );
};

const RolePill = ({ role }) => {
  const color = ROLE_COLORS[role] || '#94A3B8';
  return (
    <span style={{ background: color + '18', color, borderRadius: 5, padding: '2px 8px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>
      {role || 'user'}
    </span>
  );
};

const KPICard = ({ label, value, sub, icon, color = '#2E5BFF', trend }) => (
  <div className="sa-card sa-interactive-card" style={{ flex: 1, minWidth: 160 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div className="card-lbl">{label}</div>
        <div className="card-val" style={{ color }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
        {trend !== undefined && (
          <div style={{ fontSize: '0.72rem', color: trend >= 0 ? '#10B981' : '#EF4444', fontWeight: 700, marginTop: 4 }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% ce mois
          </div>
        )}
      </div>
      <div style={{ color, opacity: 0.3, fontSize: 28 }}>{icon}</div>
    </div>
  </div>
);

const Spinner = () => (
  <div style={{ width: 16, height: 16, border: '2px solid #E2E8F0', borderTopColor: '#2E5BFF', borderRadius: '50%', animation: 'sa-spin 0.7s linear infinite', display: 'inline-block' }} />
);

const EmptyState = ({ icon, title, desc, action }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#64748B', marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: '0.78rem', marginBottom: action ? 16 : 0 }}>{desc}</div>
    {action}
  </div>
);

const ErrorBanner = ({ msg }) => msg ? (
  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem', color: '#991B1B', marginBottom: 12 }}>
    <AlertCircle size={14}/> {msg}
  </div>
) : null;

/* ═══════════════════════════════════════════
   MODE SELECTOR
   ═══════════════════════════════════════════ */
const SelecteurMode = ({ mode, setMode }) => (
  <div className="mode-selector-container">
    <div className="mode-selector-track">
      <button className={`mode-btn ${mode === 'global' ? 'active' : ''}`} onClick={() => setMode('global')}>GLOBAL</button>
      <button className={`mode-btn ${mode === 'hot' ? 'active' : ''}`} onClick={() => setMode('hot')}>HÔTE</button>
      <button className={`mode-btn ${mode === 'pro' ? 'active' : ''}`} onClick={() => setMode('pro')}>PRO</button>
      <div className={`mode-slider mode-${mode}`} />
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   CREATE / EDIT CLIENT MODAL
   ═══════════════════════════════════════════ */
const ClientModal = ({ client, onClose, onSave, loading, error }) => {
  const isEdit = !!client?.id;
  const [form, setForm] = useState({
    full_name: client?.full_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    role: client?.role || 'user',
    plan: client?.plan || 'starter',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="sa-modal-overlay">
      <div className="sa-config-modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div className="provider-info">
            <div className="provider-icon"><UserPlus size={20}/></div>
            <div className="provider-text">
              <h3>{isEdit ? 'Modifier le Client' : 'Nouveau Client'}</h3>
              <span>{isEdit ? client.email : 'Création d\'un nouveau compte'}</span>
            </div>
          </div>
          <XCircle className="sa-clickable" size={20} onClick={onClose}/>
        </div>
        <div className="modal-body">
          <ErrorBanner msg={error}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="config-group">
              <label>Nom complet *</label>
              <input className="sa-modern-input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jean Dupont"/>
            </div>
            <div className="config-group">
              <label>Email *</label>
              <input className="sa-modern-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jean@exemple.com" disabled={isEdit}/>
            </div>
            <div className="config-group">
              <label>Téléphone</label>
              <input className="sa-modern-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+212 6 00 00 00 00"/>
            </div>
            <div className="config-group">
              <label>Entreprise</label>
              <input className="sa-modern-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Mon Hôtel SAS"/>
            </div>
            <div className="config-group">
              <label>Rôle système</label>
              <select className="sa-modern-select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="user">Utilisateur</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="config-group">
              <label>Plan d'accès</label>
              <select className="sa-modern-select" value={form.plan} onChange={e => set('plan', e.target.value)}>
                <option value="starter">Starter (Gratuit)</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="config-notice mt-4"><Shield size={13}/><span>Un mot de passe temporaire sécurisé sera envoyé à l'email indiqué.</span></div>
        </div>
        <div className="modal-footer">
          <button className="sa-btn text-slate-500" onClick={onClose}>Annuler</button>
          <button className="sa-btn primary-cobalt sa-clickable" onClick={() => onSave(form)} disabled={loading}>
            {loading ? <><Spinner/> Enregistrement...</> : isEdit ? <><Save size={14}/> Sauvegarder</> : <><UserPlus size={14}/> Créer le compte</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function SuperAdmin({ onLogout }) {
  /* ── UI State ── */
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [mode, setMode]                       = useState('global');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode]               = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [search, setSearch]                   = useState('');

  /* ── Data State ── */
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading]   = useState({});
  const [errors, setErrors]     = useState({});

  /* ── Plans State ── */
  const [plans, setPlans]       = useState(INITIAL_PLANS);

  /* ── Client CRUD State ── */
  const [clientModal, setClientModal] = useState(null); // null | { mode:'create'|'edit', client? }
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSaving, setClientSaving]     = useState(false);
  const [clientSaveErr, setClientSaveErr]   = useState('');
  const [deletingId, setDeletingId]         = useState(null);
  const [createdPasswords, setCreatedPasswords] = useState({});

  /* ── Stripe config ── */
  const [stripeMode, setStripeMode] = useState(() => localStorage.getItem('sa_stripe_mode') || 'test');
  const [stripeTestPk, setStripeTestPk] = useState(() => localStorage.getItem('sa_stripe_test_pk') || '');
  const [stripeLivePk, setStripeLivePk] = useState(() => localStorage.getItem('sa_stripe_live_pk') || '');
  const [stripeShowPk, setStripeShowPk] = useState(false);
  const [stripeSaved, setStripeSaved]   = useState(false);

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }));
  const setErr  = (k, v) => setErrors(p => ({ ...p, [k]: v }));

  /* ════════════════════════
     DATA FETCHING
     ════════════════════════ */
  const fetchUsers = useCallback(async (q = '') => {
    setLoad('users', true); setErr('users', '');
    try {
      const r = await fetch(`/api/admin/users?search=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setUsers(d.users || []);
    } catch (e) { setErr('users', e.message); }
    finally { setLoad('users', false); }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoad('stats', true);
    try {
      const [sR, aR] = await Promise.all([fetch('/api/admin/stats'), fetch('/api/admin/analytics')]);
      if (sR.ok) setStats(await sR.json());
      if (aR.ok) setAnalytics(await aR.json());
    } catch (_) {}
    finally { setLoad('stats', false); }
  }, []);

  const fetchPayments = useCallback(async () => {
    setLoad('payments', true); setErr('payments', '');
    try {
      const r = await fetch('/api/admin/payments');
      const d = await r.json();
      if (d.error && !d.payments) throw new Error(d.error);
      setPayments(d.payments || []);
      setSubs(d.subscriptions || []);
    } catch (e) { setErr('payments', e.message); }
    finally { setLoad('payments', false); }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setLoad('logs', true);
    try {
      const r = await fetch('/api/admin/audit-logs?limit=50');
      const d = await r.json();
      setAuditLogs(d.logs || []);
    } catch (_) {}
    finally { setLoad('logs', false); }
  }, []);

  useEffect(() => { fetchStats(); fetchUsers(); }, [fetchStats, fetchUsers]);
  useEffect(() => {
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'logs')     fetchAuditLogs();
  }, [activeTab, fetchPayments, fetchAuditLogs]);

  /* ════════════════════════
     CLIENT CRUD
     ════════════════════════ */
  const handleSaveClient = async (form) => {
    setClientSaving(true); setClientSaveErr('');
    try {
      if (clientModal?.mode === 'create') {
        const r = await fetch('/api/admin/create-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        if (d.user?.password) setCreatedPasswords(p => ({ ...p, [d.user.id]: d.user.password }));
      } else {
        const r = await fetch(`/api/admin/users/${clientModal.client.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
      }
      setClientModal(null);
      await fetchUsers();
      await fetchStats();
    } catch (e) { setClientSaveErr(e.message); }
    finally { setClientSaving(false); }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Supprimer définitivement ce compte ?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (selectedClient?.id === id) setSelectedClient(null);
      await fetchUsers();
      await fetchStats();
    } catch (_) {}
    finally { setDeletingId(null); }
  };

  /* ════════════════════════
     FILTERED DATA
     ════════════════════════ */
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.company || '').toLowerCase().includes(q));
  }, [users, search]);

  /* ════════════════════════
     NAVIGATION
     ════════════════════════ */
  const NAV = [
    { section: 'FINANCE', items: [
      { id: 'payments',   label: 'Paiements',        icon: <CreditCard size={18}/> },
      { id: 'plans',      label: 'Plans & Abonnements', icon: <Layers size={18}/> },
      { id: 'stripe',     label: 'Config Stripe',    icon: <Wallet size={18}/> },
    ]},
    { section: 'UTILISATEURS', items: [
      { id: 'clients',    label: 'Clients',          icon: <Users size={18}/> },
      { id: 'roles',      label: 'Rôles & Droits',   icon: <Shield size={18}/> },
    ]},
    { section: 'OPÉRATIONS', items: [
      { id: 'apis',       label: 'APIs & Fournisseurs', icon: <Terminal size={18}/> },
      { id: 'analytics',  label: 'Analytics',         icon: <BarChart3 size={18}/> },
    ]},
    { section: 'SYSTÈME', items: [
      { id: 'logs',       label: 'Journal d\'Activité', icon: <FileText size={18}/> },
      { id: 'settings',   label: 'Paramètres',        icon: <Settings size={18}/> },
    ]},
  ];

  /* ════════════════════════
     SECTION RENDERERS
     ════════════════════════ */

  /* ─── DASHBOARD ─── */
  const renderDashboard = () => {
    const signupData = analytics?.signupTrend?.length ? analytics.signupTrend : REVENUE_MOCK.map(r => ({ month: r.m, count: Math.floor(r.mrr / 3000) }));
    const planData   = analytics?.planDist?.length ? analytics.planDist : [{ name: 'STARTER', value: 1 }];
    const revenueData = REVENUE_MOCK;

    return (
      <div className="sa-dashboard-view">
        <div className="sa-widget-row">
          <KPICard label="CLIENTS ACTIFS"     value={stats?.activeUsers     ?? '—'} sub={`${stats?.totalUsers ?? 0} total`}      icon={<Users/>}     color="#2E5BFF" trend={12} />
          <KPICard label="PROPRIÉTÉS"         value={stats?.totalProperties ?? '—'} sub={`${stats?.activeProperties ?? 0} actives`} icon={<Building2/>} color="#10B981" />
          <KPICard label="RÉSERVATIONS"       value={stats?.totalReservations ?? '—'} sub="dans Supabase"                          icon={<Calendar/>}  color="#8B5CF6" />
          <KPICard label="REVENUE CUMULÉ"     value={stats?.totalRevenue ? fmtAmt(stats.totalRevenue) + ' MAD' : '0'} sub="Supabase"  icon={<DollarSign/>} color="#F59E0B" />
        </div>

        <div className="sa-dashboard-grid">
          <div className="sa-card sa-chart-card">
            <div className="sa-card-header">
              <h3>Inscriptions Clients (6 derniers mois)</h3>
              {loading.stats && <Spinner/>}
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }}/>
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}/>
                  <Bar dataKey="count" fill="#2E5BFF" radius={[4,4,0,0]} name="Inscriptions"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="sa-card">
            <div className="sa-card-header"><h3>Distribution des Plans</h3></div>
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {planData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                      {planData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]}/>
                    <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{v}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={<PieIcon/>} title="Aucune donnée" desc="Ajoutez des clients pour voir la distribution"/>}
            </div>
          </div>
        </div>

        <div className="sa-card mt-4">
          <div className="sa-card-header">
            <h3>Revenue Projeté (Données Statiques)</h3>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, background: '#F1F5F9', padding: '2px 8px', borderRadius: 5 }}>MOCK — connectez Stripe pour les données réelles</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E5BFF" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2E5BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }}/>
                <YAxis hide/>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}/>
                <Area type="monotone" dataKey="mrr" stroke="#2E5BFF" strokeWidth={2} fill="url(#gMRR)" name="MRR (MAD)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  /* ─── CLIENTS ─── */
  const renderClients = () => (
    <div className={`sa-management-view`}>
      <div className={`sa-management-main ${selectedClient ? 'with-panel' : ''}`}>
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Gestion des Clients <span style={{ fontWeight: 400, color: '#94A3B8', fontSize: '0.8rem' }}>({filteredUsers.length})</span></h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {loading.users && <Spinner/>}
              <button className="white-action-btn sa-clickable" onClick={() => fetchUsers(search)}><RefreshCw size={13}/></button>
              <button className="white-action-btn primary-cobalt sa-clickable" onClick={() => { setClientSaveErr(''); setClientModal({ mode: 'create' }); }}>
                <UserPlus size={14}/> Nouveau Client
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
            <div className="sa-search-mini" style={{ flex: 1, maxWidth: 320 }}>
              <Search size={14}/>
              <input type="text" placeholder="Chercher par nom, email, entreprise..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
          </div>

          <ErrorBanner msg={errors.users}/>

          {filteredUsers.length === 0 && !loading.users ? (
            <EmptyState icon={<Users/>} title="Aucun client" desc={search ? 'Aucun résultat pour cette recherche.' : 'Créez votre premier client.'} action={
              <button className="white-action-btn primary-cobalt sa-clickable" onClick={() => setClientModal({ mode: 'create' })}>
                <UserPlus size={13}/> Ajouter un client
              </button>
            }/>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-modern-table">
                <thead>
                  <tr>
                    <th>CLIENT</th><th>EMAIL</th><th>RÔLE</th><th>PLAN</th><th>INSCRIT LE</th><th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className={selectedClient?.id === u.id ? 'active-row' : ''}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${PLAN_COLORS[u.plan] || '#2E5BFF'}40, ${PLAN_COLORS[u.plan] || '#2E5BFF'}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: PLAN_COLORS[u.plan] || '#2E5BFF', flexShrink: 0 }}>
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="sa-clickable font-bold" style={{ fontSize: '0.85rem' }} onClick={() => setSelectedClient(u)}>{u.full_name || '—'}</div>
                            {u.company && <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{u.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B' }}>{u.email}</td>
                      <td><RolePill role={u.role}/></td>
                      <td><PlanPill plan={u.plan}/></td>
                      <td style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{fmtDate(u.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="icon-btn-gray sa-clickable" title="Voir détails" onClick={() => setSelectedClient(u)}><Eye size={13}/></button>
                          <button className="icon-btn-gray sa-clickable" title="Modifier" onClick={() => { setClientSaveErr(''); setClientModal({ mode: 'edit', client: u }); }}><Edit3 size={13}/></button>
                          <button className="icon-btn-gray sa-clickable" title="Supprimer" onClick={() => handleDeleteClient(u.id)} disabled={deletingId === u.id} style={{ color: '#EF4444' }}>
                            {deletingId === u.id ? <Spinner/> : <Trash2 size={13}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {Object.keys(createdPasswords).length > 0 && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#065F46', marginBottom: 8 }}>Mots de passe temporaires générés</div>
              {Object.entries(createdPasswords).map(([id, pw]) => {
                const u = users.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem', marginBottom: 4 }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{u?.email || id}</span>
                    <code style={{ background: '#D1FAE5', padding: '1px 8px', borderRadius: 4, fontWeight: 700 }}>{pw}</code>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedClient && (
        <div className="sa-side-panel">
          <div className="panel-header">
            <h4>Profil : {selectedClient.full_name || selectedClient.email}</h4>
            <XCircle className="sa-clickable" size={18} onClick={() => setSelectedClient(null)}/>
          </div>
          <div className="panel-content">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${PLAN_COLORS[selectedClient.plan] || '#2E5BFF'}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: 'white', margin: '0 auto 12px' }}>
                {(selectedClient.full_name || selectedClient.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{selectedClient.full_name}</div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>{selectedClient.email}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                <RolePill role={selectedClient.role}/>
                <PlanPill plan={selectedClient.plan}/>
              </div>
            </div>

            {[
              { label: 'Entreprise', val: selectedClient.company || '—' },
              { label: 'Téléphone', val: selectedClient.phone || '—' },
              { label: 'ID Supabase', val: selectedClient.id?.slice(0,16) + '...' },
              { label: 'Inscrit le', val: fmtDate(selectedClient.created_at) },
              { label: 'Mis à jour', val: fmtDate(selectedClient.updated_at) },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>
                <span style={{ color: '#94A3B8', fontWeight: 600 }}>{f.label}</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{f.val}</span>
              </div>
            ))}

            <div className="override-section mt-6">
              <label className="section-title">Modifier le Plan</label>
              <select className="sa-modern-select mt-3 w-full" defaultValue={selectedClient.plan} onChange={async e => {
                await fetch(`/api/admin/users/${selectedClient.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: e.target.value }) });
                setSelectedClient(p => ({ ...p, plan: e.target.value }));
                fetchUsers();
              }}>
                <option value="starter">Starter</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="override-section mt-4">
              <label className="section-title">Modifier le Rôle</label>
              <select className="sa-modern-select mt-3 w-full" defaultValue={selectedClient.role} onChange={async e => {
                await fetch(`/api/admin/users/${selectedClient.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: e.target.value }) });
                setSelectedClient(p => ({ ...p, role: e.target.value }));
                fetchUsers();
              }}>
                <option value="user">Utilisateur</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="panel-divider my-6"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="sa-btn action-alert-btn w-full sa-clickable" onClick={() => { setClientSaveErr(''); setClientModal({ mode: 'edit', client: selectedClient }); }}>
                <Edit3 size={13}/> Modifier le profil
              </button>
              <button className="sa-btn action-danger-btn w-full sa-clickable" onClick={() => handleDeleteClient(selectedClient.id)}>
                <Trash2 size={13}/> Supprimer le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ─── PLANS ─── */
  const renderPlans = () => (
    <div className="sa-plan-builder-view">
      <div className="sa-card">
        <div className="sa-card-header">
          <h3>Matrice des Plans & Offres</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="white-action-btn sa-clickable" onClick={() => setPlans(INITIAL_PLANS)}>Réinitialiser</button>
            <button className="white-action-btn primary-cobalt sa-clickable">Sauvegarder</button>
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
                    <input type="number" className="sa-price-input" value={plans[p].price}
                      onChange={e => setPlans(prev => ({ ...prev, [p]: { ...prev[p], price: parseInt(e.target.value) || 0 } }))}/>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-bold">Essai Gratuit (jours)</td>
                {Object.keys(plans).map(p => (
                  <td key={p} className="text-center" style={{ fontWeight: 700, color: '#64748B' }}>
                    {plans[p].trial > 0 ? `${plans[p].trial}j` : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="font-bold">Limite Propriétés</td>
                {Object.keys(plans).map(p => (
                  <td key={p} className="text-center font-bold" style={{ color: '#64748B' }}>
                    {plans[p].propertiesLimit === 999 ? '∞' : plans[p].propertiesLimit}
                  </td>
                ))}
              </tr>
              {PLAN_FEATURES.map(f => (
                <tr key={f.id}>
                  <td className="feature-cell">{f.icon}<span>{f.label}</span></td>
                  {Object.keys(plans).map(p => (
                    <td key={p} className="text-center">
                      <label className="sa-mini-toggle">
                        <input type="checkbox" checked={plans[p].features.includes(f.id)} onChange={() => setPlans(prev => ({
                          ...prev, [p]: { ...prev[p], features: prev[p].features.includes(f.id) ? prev[p].features.filter(x => x !== f.id) : [...prev[p].features, f.id] }
                        }))}/>
                        <span className="toggle-slider"/>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sa-widget-row mt-6">
        {Object.entries(plans).map(([key, plan]) => (
          <div key={key} className="sa-card" style={{ flex: 1, minWidth: 140 }}>
            <PlanPill plan={key}/>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: PLAN_COLORS[key] || '#2E5BFF', margin: '8px 0 4px' }}>
              {plan.price === 0 ? 'Gratuit' : `€${plan.price}`}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{plan.features.length} fonctionnalités</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{plan.propertiesLimit === 999 ? '∞' : plan.propertiesLimit} propriétés</div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── PAYMENTS ─── */
  const renderPayments = () => {
    const totalOk = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0);
    const totalFailed = payments.filter(p => p.status === 'failed').length;
    return (
      <div className="sa-content-placeholder">
        <div className="sa-widget-row mb-4">
          <KPICard label="REVENUE (Stripe)" value={`€${fmtAmt(totalOk)}`} sub={`${payments.filter(p => p.status==='succeeded').length} paiements réussis`} icon={<DollarSign/>} color="#10B981"/>
          <KPICard label="ABONNEMENTS" value={subscriptions.filter(s => s.status === 'active').length} sub={`${subscriptions.length} total`} icon={<CreditCard/>} color="#2E5BFF"/>
          <KPICard label="ÉCHOUÉS" value={totalFailed} sub="Nécessitent attention" icon={<AlertCircle/>} color="#EF4444"/>
        </div>

        <div className="sa-card mb-4">
          <div className="sa-card-header">
            <h3>Transactions Stripe</h3>
            <button className="white-action-btn sa-clickable" onClick={fetchPayments}>{loading.payments ? <Spinner/> : <RefreshCw size={13}/>}</button>
          </div>
          <ErrorBanner msg={errors.payments}/>
          {loading.payments && payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}><Spinner/></div>
          ) : payments.length === 0 ? (
            <EmptyState icon={<CreditCard/>} title="Aucun paiement Stripe" desc="Connectez votre compte Stripe pour voir les transactions."/>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-modern-table">
                <thead><tr><th>ID</th><th>EMAIL</th><th>MONTANT</th><th>STATUT</th><th>DESCRIPTION</th><th>DATE</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td><code style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{p.id.slice(0, 18)}...</code></td>
                      <td style={{ fontSize: '0.78rem' }}>{p.email}</td>
                      <td className="font-bold">{p.currency} {fmtAmt(p.amount)}</td>
                      <td><StatusPill status={p.status}/></td>
                      <td style={{ fontSize: '0.78rem', color: '#64748B', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</td>
                      <td style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{fmtDate(p.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sa-card">
          <div className="sa-card-header"><h3>Abonnements Actifs</h3></div>
          {subscriptions.length === 0 ? (
            <EmptyState icon={<Package/>} title="Aucun abonnement" desc="Les abonnements Stripe apparaîtront ici."/>
          ) : (
            <div className="sa-table-wrap">
              <table className="sa-modern-table">
                <thead><tr><th>ID</th><th>CLIENT</th><th>PLAN</th><th>MONTANT</th><th>STATUT</th><th>RENOUVELLEMENT</th></tr></thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id}>
                      <td><code style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{s.id.slice(0, 14)}...</code></td>
                      <td style={{ fontSize: '0.78rem' }}>{s.email}</td>
                      <td><span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#EFF6FF', color: '#3B82F6', padding: '2px 7px', borderRadius: 4 }}>{s.plan}</span></td>
                      <td className="font-bold">{s.currency} {fmtAmt(s.amount)}/mois</td>
                      <td><StatusPill status={s.status}/></td>
                      <td style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{fmtDate(s.current_period_end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ─── STRIPE CONFIG ─── */
  const renderStripe = () => (
    <div className="sa-content-placeholder">
      <div className="sa-card mb-4">
        <div className="sa-card-header">
          <h3><Wallet size={15} style={{ display:'inline', marginRight:6 }}/>Configuration Stripe</h3>
          <span className={`plan-pill ${stripeMode === 'test' ? 'silver' : 'gold'}`}>{stripeMode === 'test' ? 'MODE TEST' : 'MODE LIVE'}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className={`white-action-btn sa-clickable ${stripeMode==='test' ? 'primary-cobalt' : ''}`} style={{ flex:1 }} onClick={() => setStripeMode('test')}>
            {stripeMode==='test' ? <CheckCircle size={13}/> : <ToggleLeft size={13}/>} Stripe TEST
          </button>
          <button className={`white-action-btn sa-clickable ${stripeMode==='live' ? 'primary-cobalt' : ''}`} style={{ flex:1 }} onClick={() => setStripeMode('live')}>
            {stripeMode==='live' ? <CheckCircle size={13}/> : <ToggleRight size={13}/>} Stripe LIVE
          </button>
        </div>
        {stripeMode === 'test' && (
          <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:'0.78rem', color:'#92400E', display:'flex', gap:8 }}>
            <AlertTriangle size={14} style={{flexShrink:0, marginTop:1}}/> Mode TEST — carte test : <strong>4242 4242 4242 4242</strong> · exp <strong>12/28</strong> · CVC <strong>123</strong>
          </div>
        )}
        <div className="config-group">
          <label>Clé Publique ({stripeMode === 'test' ? 'pk_test_...' : 'pk_live_...'})</label>
          <div className="input-with-eye">
            <input type={stripeShowPk ? 'text' : 'password'} className="sa-modern-input"
              placeholder={stripeMode === 'test' ? 'pk_test_51...' : 'pk_live_51...'}
              value={stripeMode === 'test' ? stripeTestPk : stripeLivePk}
              onChange={e => stripeMode === 'test' ? setStripeTestPk(e.target.value) : setStripeLivePk(e.target.value)}/>
            <button type="button" onClick={() => setStripeShowPk(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}>
              {stripeShowPk ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
        </div>
        <div className="config-group mt-4">
          <label>Clé Secrète — Backend uniquement</label>
          <div className="config-input-fake" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ flex:1, color:'#94A3B8' }}>{stripeMode==='test' ? 'sk_test_••••••••••••' : 'sk_live_••••••••••••'}</span>
            <span style={{ background:'#FEF3C7', color:'#B45309', border:'1px solid #FDE68A', borderRadius:5, padding:'2px 7px', fontSize:'0.68rem', fontWeight:700 }}>BACKEND ONLY</span>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
          <button className="sa-btn primary-cobalt" onClick={() => {
            localStorage.setItem('sa_stripe_mode', stripeMode);
            localStorage.setItem('sa_stripe_test_pk', stripeTestPk);
            localStorage.setItem('sa_stripe_live_pk', stripeLivePk);
            setStripeSaved(true);
            setTimeout(() => setStripeSaved(false), 2000);
          }}>
            {stripeSaved ? <><CheckCircle size={13}/> Sauvegardé</> : <><Save size={13}/> Sauvegarder</>}
          </button>
        </div>
      </div>
      <div className="sa-card">
        <div className="sa-card-header"><h3>Cartes de Test</h3></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:10, padding:'8px 0' }}>
          {[
            { name:'Visa (succès)', num:'4242 4242 4242 4242', color:'#3B82F6' },
            { name:'Mastercard (succès)', num:'5555 5555 5555 4444', color:'#10B981' },
            { name:'Refus (fonds insuf.)', num:'4000 0000 0000 9995', color:'#EF4444' },
            { name:'3DS requis', num:'4000 0025 0000 3155', color:'#F59E0B' },
          ].map(c => (
            <div key={c.num} style={{ border:'1px solid #E2E8F0', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:800, color:c.color, marginBottom:6 }}>{c.name}</div>
              <code style={{ fontSize:'0.85rem', fontWeight:700, letterSpacing:'0.06em' }}>{c.num}</code>
              <div style={{ fontSize:'0.7rem', color:'#94A3B8', marginTop:4 }}>Exp: 12/28 · CVC: 123</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── APIS ─── */
  const renderApis = () => (
    <div className="sa-integrations-view">
      <div className="sa-card mb-6">
        <div className="sa-card-header">
          <h3>Hub d'Intégrations & APIs</h3>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#10B981', animation:'sa-pulse 2s infinite' }}/>
            <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#10B981' }}>Système opérationnel</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'8px 0' }}>
          {API_PROVIDERS.map(api => (
            <div key={api.id} className="api-row-detailed sa-interactive-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', border:'1px solid #E2E8F0', borderRadius:12 }}>
              <div className="api-icon-wrap" style={{ color: api.status === 'operational' ? '#10B981' : '#F59E0B' }}>{api.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:'0.88rem', color:'#0F172A' }}>{api.name}</div>
                <div style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{api.type}</div>
              </div>
              <div style={{ textAlign:'center', minWidth:70 }}>
                <div style={{ fontWeight:800, fontSize:'0.88rem' }}>{api.uptime}%</div>
                <div style={{ fontSize:'0.68rem', color:'#94A3B8' }}>Uptime</div>
              </div>
              <div style={{ textAlign:'center', minWidth:70 }}>
                <div style={{ fontWeight:800, fontSize:'0.88rem' }}>{api.latency}ms</div>
                <div style={{ fontSize:'0.68rem', color:'#94A3B8' }}>Latence</div>
              </div>
              <span style={{
                background: api.status === 'operational' ? '#D1FAE5' : '#FEF3C7',
                color: api.status === 'operational' ? '#065F46' : '#92400E',
                borderRadius: 5, padding:'3px 10px', fontSize:'0.7rem', fontWeight:800, whiteSpace:'nowrap'
              }}>
                {api.status === 'operational' ? '● En ligne' : '⚠ Dégradé'}
              </span>
              <button className="icon-btn-gray sa-clickable"><Settings size={14}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="sa-card">
        <div className="sa-card-header"><h3>Ajouter une Intégration</h3></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:10, padding:'8px 0' }}>
          {['Beds24', 'Airbnb Direct', 'Booking.com', 'Zapier', 'Make.com', 'Mailchimp', 'HubSpot', 'Salesforce'].map(name => (
            <button key={name} className="white-action-btn sa-clickable" style={{ justifyContent:'flex-start', gap:8 }}>
              <Plus size={13}/> {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─── ANALYTICS ─── */
  const renderAnalytics = () => {
    const signupTrend = analytics?.signupTrend?.length ? analytics.signupTrend : [{ month: '--', count: 0 }];
    const planDist = analytics?.planDist?.length ? analytics.planDist : [];
    const roleDist = analytics?.roleDist?.length ? analytics.roleDist : [];
    return (
      <div className="sa-content-placeholder">
        <div className="sa-widget-row mb-6">
          <KPICard label="TOTAL UTILISATEURS" value={analytics?.totalUsers ?? stats?.totalUsers ?? '—'} icon={<Users/>}     color="#2E5BFF"/>
          <KPICard label="TOTAL PROPRIÉTÉS"   value={analytics?.totalProps  ?? stats?.totalProperties ?? '—'} icon={<Building2/>} color="#10B981"/>
          <KPICard label="PLANS ACTIFS"        value={Object.keys(INITIAL_PLANS).length} sub="Plans configurés" icon={<Package/>}   color="#8B5CF6"/>
        </div>

        <div className="sa-dashboard-grid mb-6">
          <div className="sa-card sa-chart-card">
            <div className="sa-card-header"><h3>Croissance — Nouvelles Inscriptions</h3></div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signupTrend}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94A3B8', fontSize:11 }}/>
                  <YAxis hide allowDecimals={false}/>
                  <Tooltip contentStyle={{ borderRadius:12, border:'none', boxShadow:'0 8px 32px rgba(0,0,0,.08)' }}/>
                  <Bar dataKey="count" name="Inscriptions" fill="#2E5BFF" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="sa-card">
            <div className="sa-card-header"><h3>Répartition par Plan</h3></div>
            <div style={{ height: 220 }}>
              {planDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {planDist.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState icon={<PieIcon/>} title="Pas de données" desc="Ajoutez des clients pour voir la répartition."/>}
            </div>
          </div>
        </div>

        <div className="sa-card">
          <div className="sa-card-header"><h3>Répartition par Rôle</h3></div>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', padding:'8px 0' }}>
            {roleDist.length > 0 ? roleDist.map(r => (
              <div key={r.name} style={{ flex:1, minWidth:100, border:'1px solid #E2E8F0', borderRadius:12, padding:'14px 16px', textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:'1.6rem', color: ROLE_COLORS[r.name] || '#94A3B8' }}>{r.value}</div>
                <RolePill role={r.name}/>
              </div>
            )) : (
              <EmptyState icon={<Shield/>} title="Pas de données" desc="Les rôles apparaîtront après l'ajout de clients."/>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─── ROLES ─── */
  const renderRoles = () => (
    <div className="sa-content-placeholder">
      <div className="sa-card mb-6">
        <div className="sa-card-header">
          <h3>Rôles & Permissions du Système</h3>
          <button className="white-action-btn primary-cobalt sa-clickable"><Plus size={13}/> Nouveau Rôle</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, padding:'8px 0' }}>
          {Object.entries(ROLE_COLORS).map(([role, color]) => {
            const perms = PERMISSIONS[role] || {};
            const permCount = Object.values(perms).filter(Boolean).length;
            return (
              <div key={role} style={{ border:`1.5px solid ${color}30`, borderRadius:12, padding:'16px', background:`${color}08` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <RolePill role={role}/>
                  {role === 'super_admin' && <Crown size={14} color={color}/>}
                </div>
                <div style={{ fontSize:'1.8rem', fontWeight:900, color, marginBottom:4 }}>{permCount}</div>
                <div style={{ fontSize:'0.72rem', color:'#94A3B8' }}>permissions actives</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sa-card">
        <div className="sa-card-header"><h3>Matrice des Permissions</h3></div>
        <div className="sa-table-wrap">
          <table className="sa-modern-table">
            <thead>
              <tr>
                <th>MODULE</th>
                {Object.keys(PERMISSIONS).map(r => <th key={r} className="text-center"><RolePill role={r}/></th>)}
              </tr>
            </thead>
            <tbody>
              {['dashboard','clients','plans','payments','apis','analytics','roles','logs','system'].map(mod => (
                <tr key={mod}>
                  <td className="font-bold" style={{ textTransform:'capitalize' }}>{mod}</td>
                  {Object.keys(PERMISSIONS).map(role => (
                    <td key={role} className="text-center">
                      {PERMISSIONS[role][mod]
                        ? <CheckCircle size={16} color="#10B981"/>
                        : <XCircle size={16} color="#E2E8F0"/>}
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

  /* ─── AUDIT LOGS ─── */
  const renderLogs = () => {
    const TC = { auth:'#3B82F6', billing:'#10B981', api:'#8B5CF6', user:'#F59E0B', security:'#EF4444', ai:'#EC4899', system:'#94A3B8' };
    return (
      <div className="sa-content-placeholder">
        <div className="sa-card">
          <div className="sa-card-header">
            <h3>Journal d'Activité Système</h3>
            <div style={{ display:'flex', gap:8 }}>
              {loading.logs && <Spinner/>}
              <button className="white-action-btn sa-clickable" onClick={fetchAuditLogs}><RefreshCw size={13}/></button>
              <button className="white-action-btn sa-clickable"><Share2 size={13}/> Exporter</button>
            </div>
          </div>
          {auditLogs.length === 0 && !loading.logs ? (
            <EmptyState icon={<FileText/>} title="Aucune entrée" desc="Les actions importantes seront enregistrées ici automatiquement."/>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', padding:'4px 0' }}>
              {auditLogs.map((log, i) => {
                const color = TC[log.type] || '#94A3B8';
                const labels = { auth:'AUTH', billing:'BILLING', api:'API', user:'USER', security:'SEC', ai:'AI', system:'SYS' };
                return (
                  <div key={log.id || i} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom: i < auditLogs.length-1 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }}/>
                    <div style={{ width:52, textAlign:'center' }}>
                      <span style={{ background:color+'20', color, borderRadius:4, padding:'1px 5px', fontSize:'0.62rem', fontWeight:800 }}>{labels[log.type]||'SYS'}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.82rem', color:'#0F172A' }}>{log.action}</div>
                      <div style={{ fontSize:'0.72rem', color:'#94A3B8' }}>{log.resource}</div>
                    </div>
                    <div style={{ fontSize:'0.74rem', color:'#64748B', fontWeight:600 }}>{log.user_email || 'system'}</div>
                    <div style={{ fontSize:'0.72rem', color:'#CBD5E1', minWidth:80, textAlign:'right' }}>{fmtDate(log.created_at)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ─── SETTINGS ─── */
  const renderSettings = () => (
    <div className="sa-content-placeholder">
      <div className="sa-card mb-4">
        <div className="sa-card-header"><h3>Paramètres Généraux</h3></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:'8px 0' }}>
          {[
            { label:'Nom de la Plateforme', value:'HosFlow / Hova' },
            { label:'Devise par défaut', value:'MAD (Dirham Marocain)' },
            { label:'Fuseau Horaire', value:'Africa/Casablanca (GMT+1)' },
            { label:'Langue Interface', value:'Français (FR)' },
          ].map(f => (
            <div key={f.label} className="config-group">
              <label>{f.label}</label>
              <input type="text" className="sa-modern-input" defaultValue={f.value}/>
            </div>
          ))}
        </div>
      </div>
      <div className="sa-card mb-4">
        <div className="sa-card-header"><h3>Sécurité & Accès</h3></div>
        {[
          { label:'Authentification 2FA',  desc:'Requérir 2FA pour tous les admins',           enabled:false },
          { label:'Session auto-expire',    desc:'Déconnexion après 8h d\'inactivité',          enabled:true  },
          { label:'Logs d\'accès étendus',  desc:'Enregistrer toutes les actions utilisateurs', enabled:true  },
          { label:'Mode maintenance',       desc:'Bloquer l\'accès utilisateurs (admin seul)',  enabled:false },
        ].map((s,i,arr) => (
          <div key={s.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 0', borderBottom: i<arr.length-1 ? '1px solid #F1F5F9' : 'none' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#0F172A' }}>{s.label}</div>
              <div style={{ fontSize:'0.74rem', color:'#94A3B8' }}>{s.desc}</div>
            </div>
            <label className="sa-mini-toggle"><input type="checkbox" defaultChecked={s.enabled}/><span className="toggle-slider"/></label>
          </div>
        ))}
      </div>
      <div className="sa-card">
        <div className="sa-card-header"><h3>Informations Système</h3></div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, padding:'8px 0' }}>
          {[
            { label:'Version App',     value:'v2.5.0' },
            { label:'Framework',       value:'React 19 + Vite 8' },
            { label:'Base de Données', value:'Supabase PostgreSQL' },
            { label:'Backend',         value:'Node.js + Express' },
            { label:'Déploiement',     value:'Replit Cloud' },
            { label:'Build',           value: new Date().toLocaleDateString('fr-FR') },
          ].map(f => (
            <div key={f.label} style={{ border:'1px solid #E2E8F0', borderRadius:9, padding:'10px 12px' }}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#94A3B8', marginBottom:4, textTransform:'uppercase' }}>{f.label}</div>
              <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#0F172A' }}>{f.value}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button className="white-action-btn sa-clickable"><Database size={13}/> Sauvegarde BDD</button>
          <button className="white-action-btn sa-clickable"><RefreshCw size={13}/> Vider le Cache</button>
          <button className="white-action-btn sa-clickable" style={{ color:'#EF4444', borderColor:'#FECACA' }}><AlertTriangle size={13}/> Mode Maintenance</button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════
     RENDER SWITCH
     ════════════════════════ */
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'clients':   return renderClients();
      case 'plans':     return renderPlans();
      case 'payments':  return renderPayments();
      case 'stripe':    return renderStripe();
      case 'apis':      return renderApis();
      case 'analytics': return renderAnalytics();
      case 'roles':     return renderRoles();
      case 'logs':      return renderLogs();
      case 'settings':  return renderSettings();
      default:          return renderDashboard();
    }
  };

  /* ════════════════════════
     LAYOUT
     ════════════════════════ */
  const currentLabel = NAV.flatMap(s => s.items).find(i => i.id === activeTab)?.label || 'Tableau de Bord';

  return (
    <div className={`sa-omni-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-theme' : 'light-theme'} ${mobileOpen ? 'mobile-menu-open' : ''}`}>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)}/>}

      {/* ── SIDEBAR ── */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-top">
          <div className="sa-logo-brand">
            <div className="logo-box">HF</div>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <strong>HOSFLOW</strong>
                <span>SUPER ADMIN</span>
              </div>
            )}
            <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}><XCircle size={22}/></button>
          </div>
          <SelecteurMode mode={mode} setMode={setMode}/>
        </div>

        <nav className="sa-sidebar-nav hide-scrollbar">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setMobileOpen(false); }}>
            <LayoutDashboard size={18}/>
            {!sidebarCollapsed && <span>Tableau de Bord</span>}
          </div>

          {NAV.map((section, idx) => (
            <div key={idx} className="nav-section">
              {!sidebarCollapsed && <div className="section-label">{section.section}</div>}
              {section.items.map(item => (
                <div key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => { setActiveTab(item.id); setMobileOpen(false); }}
                  title={sidebarCollapsed ? item.label : ''}>
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          {onLogout && (
            <div className="nav-item sa-clickable" onClick={onLogout}>
              <LogOut size={18}/>
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </div>
          )}
          <div className="nav-item sa-clickable" onClick={() => setSidebarCollapsed(v => !v)}>
            <Settings size={18}/>
            {!sidebarCollapsed && <span>Réduire</span>}
          </div>
          <div className="nav-item sa-clickable" onClick={() => setDarkMode(v => !v)}>
            <Star size={18} fill={darkMode ? 'currentColor' : 'none'}/>
            {!sidebarCollapsed && <span>{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="sa-main-wrap">
        <header className="sa-top-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
              <div className="bar"/><div className="bar"/><div className="bar"/>
            </button>
            <h1 className="sa-page-title">{currentLabel}</h1>
            <div className="sa-breadcrumb">HosFlow HQ / {activeTab}</div>
          </div>
          <div className="header-center">
            <div className="sa-global-search">
              <Search size={15}/>
              <input type="text" placeholder="Recherche globale..." value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && activeTab === 'clients' && fetchUsers(search)}/>
            </div>
          </div>
          <div className="header-right">
            <button className="header-notif sa-clickable" onClick={() => fetchStats()}>
              <RefreshCw size={18} className={loading.stats ? 'animate-spin' : ''}/>
            </button>
            <div className="header-notif sa-clickable"><Bell size={20}/><span className="notif-dot"/></div>
            <div className="admin-profile-pill sa-clickable">
              <div className="admin-avatar">SA</div>
              {!sidebarCollapsed && (
                <div className="admin-info">
                  <strong>Super Admin</strong>
                  <span>HosFlow HQ</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="sa-workspace hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-8 }} transition={{ duration:0.15 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── CLIENT MODAL ── */}
      {clientModal && (
        <ClientModal
          client={clientModal.client}
          onClose={() => setClientModal(null)}
          onSave={handleSaveClient}
          loading={clientSaving}
          error={clientSaveErr}
        />
      )}

      <style>{`
        @keyframes sa-spin  { to { transform: rotate(360deg); } }
        @keyframes sa-pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.4 } }
      `}</style>
    </div>
  );
}
