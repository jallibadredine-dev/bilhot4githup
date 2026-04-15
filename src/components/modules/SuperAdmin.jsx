import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, CreditCard, Globe, HeadphonesIcon,
  Shield, TrendingUp, TrendingDown, Server, Zap, RefreshCw,
  AlertTriangle, CheckCircle, XCircle, Search, Filter,
  ChevronDown, MoreHorizontal, Plus, Lock, Unlock, Eye,
  Wifi, WifiOff, Activity, Settings, Bell, ArrowUpRight,
  Building2, Home, MessageSquare, Key, Package, BarChart3,
  CheckCheck, Clock, LogOut, Database, Layers, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './SuperAdmin.css';

/* ────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────── */
const revenueData = [
  { m: 'Oct', mrr: 18400, hot: 6200, pro: 12200 },
  { m: 'Nov', mrr: 22100, hot: 7800, pro: 14300 },
  { m: 'Dec', mrr: 26800, hot: 9200, pro: 17600 },
  { m: 'Jan', mrr: 31200, hot: 10800, pro: 20400 },
  { m: 'Feb', mrr: 29700, hot: 9900, pro: 19800 },
  { m: 'Mar', mrr: 38900, hot: 13200, pro: 25700 },
];

const pieData = [
  { name: 'Gold', value: 28, color: '#f59e0b' },
  { name: 'Silver', value: 42, color: '#b0b0ba' },
  { name: 'Bronze', value: 18, color: '#cd7f32' },
  { name: 'Enterprise', value: 12, color: '#6366f1' },
];

const TENANTS = [
  { id: 1, name: 'Résidence Elysée', email: 'admin@elysee.fr', plan: 'gold', mode: 'pro', status: 'active', mrr: 2990, apis: { stripe: true, whatsapp: true, ttlock: true, channels: true }, created: '2024-08-14', properties: 12 },
  { id: 2, name: 'Villa Horizon', email: 'contact@villa-horizon.com', plan: 'silver', mode: 'hot', status: 'active', mrr: 890, apis: { stripe: true, whatsapp: true, ttlock: false, channels: true }, created: '2025-01-22', properties: 3 },
  { id: 3, name: 'Atlas Suites', email: 'ops@atlas-suites.ma', plan: 'enterprise', mode: 'pro', status: 'active', mrr: 5490, apis: { stripe: true, whatsapp: true, ttlock: true, channels: true }, created: '2024-05-03', properties: 47 },
  { id: 4, name: 'Dar Nour', email: 'info@darnour.tn', plan: 'bronze', mode: 'hot', status: 'warning', mrr: 290, apis: { stripe: true, whatsapp: false, ttlock: false, channels: false }, created: '2025-03-01', properties: 1 },
  { id: 5, name: 'Mövenpick Casablanca', email: 'it@movenpick-casa.com', plan: 'enterprise', mode: 'pro', status: 'active', mrr: 8900, apis: { stripe: true, whatsapp: true, ttlock: true, channels: true }, created: '2023-11-10', properties: 220 },
  { id: 6, name: 'Nomad Stays', email: 'hello@nomad-stays.io', plan: 'silver', mode: 'hot', status: 'suspended', mrr: 0, apis: { stripe: false, whatsapp: false, ttlock: false, channels: false }, created: '2025-02-18', properties: 5 },
  { id: 7, name: 'Riad Andalou', email: 'booking@riad-andalou.com', plan: 'gold', mode: 'hot', status: 'active', mrr: 1490, apis: { stripe: true, whatsapp: true, ttlock: true, channels: false }, created: '2024-10-05', properties: 8 },
];

const APIS = [
  {
    id: 'stripe', name: 'Stripe Payments', type: 'Payment Gateway', icon: '💳',
    color: '#635bff', bg: 'rgba(99,91,255,0.12)',
    status: 'operational', uptime: 99.97, successRate: 99.2, rps: 184, latency: 82,
    lastError: null
  },
  {
    id: 'whatsapp', name: 'WhatsApp Business', type: 'Messaging Platform', icon: '💬',
    color: '#25d366', bg: 'rgba(37,211,102,0.12)',
    status: 'operational', uptime: 99.81, successRate: 98.7, rps: 312, latency: 145,
    lastError: null
  },
  {
    id: 'ttlock', name: 'TTLock Smart Locks', type: 'IoT / Access Control', icon: '🔐',
    color: '#6366f1', bg: 'rgba(99,102,241,0.12)',
    status: 'degraded', uptime: 96.44, successRate: 87.3, rps: 56, latency: 980,
    lastError: 'Token refresh failed – 3 tenants affected'
  },
  {
    id: 'airbnb', name: 'Airbnb Channel Sync', type: 'Channel Manager', icon: '🏡',
    color: '#ff5a5f', bg: 'rgba(255,90,95,0.12)',
    status: 'operational', uptime: 99.62, successRate: 99.8, rps: 28, latency: 230,
    lastError: null
  },
  {
    id: 'booking', name: 'Booking.com OTA', type: 'Channel Manager', icon: '🌐',
    color: '#003580', bg: 'rgba(0,53,128,0.1)',
    status: 'operational', uptime: 99.55, successRate: 99.1, rps: 41, latency: 196,
    lastError: null
  },
  {
    id: 'cloudbeds', name: 'Cloudbeds PMS Sync', type: 'PMS Bridge', icon: '☁️',
    color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',
    status: 'error', uptime: 88.12, successRate: 62.4, rps: 0, latency: null,
    lastError: 'OAuth token expired – all sync paused'
  },
];

const LOGS = [
  { id: 1, type: 'success', title: 'Tenant Provisioned', detail: 'Mövenpick Casablanca – Enterprise plan activated, 220 properties seeded.', time: '2 min ago' },
  { id: 2, type: 'error', title: 'TTLock Token Failure', detail: 'connect.ttlock.com returned 401. 3 tenants affected. Auto-retry in 5 min.', time: '14 min ago' },
  { id: 3, type: 'warning', title: 'High Latency Detected', detail: 'WhatsApp API p95 latency spike to 1.2s. SLA threshold is 800ms.', time: '37 min ago' },
  { id: 4, type: 'info', title: 'Plan Upgrade', detail: 'Riad Andalou upgraded from Silver → Gold. Prorated invoice sent via Stripe.', time: '1h ago' },
  { id: 5, type: 'warning', title: 'Cloudbeds OAuth Expired', detail: 'Token expired for 3 properties. Webhook sent to tenant IT team.', time: '1h 22m ago' },
  { id: 6, type: 'success', title: 'Stripe Webhook Verified', detail: 'Batch of 18 payment webhooks processed successfully.', time: '2h ago' },
  { id: 7, type: 'info', title: 'New Tenant Signup', detail: 'Nomad Stays registered on Silver/HOT plan. Provisioning initiated.', time: '3h ago' },
  { id: 8, type: 'error', title: 'Tenant Suspended', detail: 'Nomad Stays – payment failed after 3 retries. Access revoked.', time: '3h 40m ago' },
];

const FEATURES_HOT = [
  { key: 'ttlock', label: 'TTLock Smart Access', category: 'IoT', icon: <Key size={13} /> },
  { key: 'airbnb', label: 'Airbnb Sync', category: 'Channel', icon: <Globe size={13} /> },
  { key: 'whatsapp', label: 'WhatsApp Automation', category: 'Messaging', icon: <MessageSquare size={13} /> },
  { key: 'dynamic_pricing', label: 'Dynamic Pricing AI', category: 'Revenue', icon: <Zap size={13} /> },
  { key: 'website_builder', label: 'Booking Engine Builder', category: 'Marketing', icon: <Layers size={13} /> },
  { key: 'workflow', label: 'Automation Workflows', category: 'Ops', icon: <Activity size={13} /> },
];
const FEATURES_PRO = [
  { key: 'housekeeping', label: 'Housekeeping Module', category: 'Ops', icon: <CheckCheck size={13} /> },
  { key: 'fnb', label: 'F&B / POS Service Hub', category: 'Revenue', icon: <Package size={13} /> },
  { key: 'staff', label: 'Staff & HR Manager', category: 'HR', icon: <Users size={13} /> },
  { key: 'revenue_mgmt', label: 'Revenue Management AI', category: 'Revenue', icon: <BarChart3 size={13} /> },
  { key: 'ttlock', label: 'TTLock Smart Access', category: 'IoT', icon: <Key size={13} /> },
  { key: 'multi_property', label: 'Multi-Property Chain', category: 'Scale', icon: <Building2 size={13} /> },
];

const PLANS_INIT = {
  bronze:     { price: '49', features: { ttlock: false, airbnb: false, whatsapp: false, dynamic_pricing: false, website_builder: false, workflow: false, housekeeping: false, fnb: false, staff: false, revenue_mgmt: false, multi_property: false } },
  silver:     { price: '149', features: { ttlock: true, airbnb: true, whatsapp: false, dynamic_pricing: false, website_builder: true, workflow: false, housekeeping: false, fnb: false, staff: false, revenue_mgmt: false, multi_property: false } },
  gold:       { price: '349', features: { ttlock: true, airbnb: true, whatsapp: true, dynamic_pricing: true, website_builder: true, workflow: true, housekeeping: true, fnb: false, staff: true, revenue_mgmt: false, multi_property: false } },
  enterprise: { price: '999', features: { ttlock: true, airbnb: true, whatsapp: true, dynamic_pricing: true, website_builder: true, workflow: true, housekeeping: true, fnb: true, staff: true, revenue_mgmt: true, multi_property: true } },
};

const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f97316'];

/* ────────────────────────────────────────
   CONFIRMATION MODAL
   ──────────────────────────────────────── */
function ConfirmModal({ modal, onConfirm, onCancel }) {
  if (!modal) return null;
  return (
    <div className="sa-modal-overlay" onClick={onCancel}>
      <div className="sa-modal" onClick={e => e.stopPropagation()}>
        <div className="sa-modal-icon" style={{ background: modal.iconBg || 'rgba(239,68,68,0.12)' }}>
          {modal.icon}
        </div>
        <div className="sa-modal-title">{modal.title}</div>
        <div className="sa-modal-desc">{modal.desc}</div>
        <div className="sa-modal-actions">
          <button className="sa-btn sa-btn-ghost" onClick={onCancel}>Annuler</button>
          <button className={`sa-btn ${modal.danger ? 'sa-btn-danger' : 'sa-btn-primary'}`} onClick={onConfirm}>
            {modal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   TAB: DASHBOARD
   ──────────────────────────────────────── */
function TabDashboard() {
  const kpis = [
    { label: 'MRR Total', value: '$38,900', delta: '+24%', up: true, icon: <TrendingUp size={16} />, iconBg: 'rgba(99,102,241,0.12)', iconColor: '#6366f1' },
    { label: 'Tenants Actifs', value: '247', delta: '+12', up: true, icon: <Users size={16} />, iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981' },
    { label: 'API Uptime Moy.', value: '98.4%', delta: '-0.3%', up: false, icon: <Activity size={16} />, iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b' },
    { label: 'Tickets Ouverts', value: '7', delta: '-3', up: true, icon: <HeadphonesIcon size={16} />, iconBg: 'rgba(239,68,68,0.12)', iconColor: '#ef4444' },
  ];

  const servers = [
    { name: 'API Gateway (EU-West)', latency: '18ms', uptime: '100%', status: 'green' },
    { name: 'PMS Core DB (PostgreSQL)', latency: '4ms', uptime: '99.99%', status: 'green' },
    { name: 'TTLock Bridge', latency: '980ms', uptime: '96.4%', status: 'yellow' },
    { name: 'Webhook Dispatcher', latency: '32ms', uptime: '99.8%', status: 'green' },
    { name: 'Cloudbeds Sync Worker', latency: '—', uptime: '88.1%', status: 'red' },
  ];

  return (
    <>
      <div className="sa-kpi-grid">
        {kpis.map(k => (
          <div className="sa-kpi-card" key={k.label}>
            <div className="sa-kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>{k.icon}</div>
            <div className="sa-kpi-label">{k.label}</div>
            <div className="sa-kpi-value">{k.value}</div>
            <span className={`sa-kpi-delta ${k.up ? 'up' : 'down'}`}>
              {k.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {k.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="sa-chart-grid">
        <div className="sa-chart-wrapper">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Évolution MRR</div>
              <div className="sa-card-subtitle">PMS Hot vs PMS Pro – 6 derniers mois</div>
            </div>
            <button className="sa-btn sa-btn-ghost" style={{ fontSize: 11 }}><ArrowUpRight size={12} /> Exporter</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(240,240,245,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, color: '#f0f0f5', fontSize: 11 }} formatter={(v,n) => [`$${v.toLocaleString()}`, n === 'pro' ? 'PMS Pro' : 'PMS Hot']} />
              <Area type="monotone" dataKey="pro" stroke="#6366f1" strokeWidth={2} fill="url(#gradPro)" name="pro" />
              <Area type="monotone" dataKey="hot" stroke="#f59e0b" strokeWidth={2} fill="url(#gradHot)" name="hot" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sa-chart-wrapper">
          <div className="sa-card-header">
            <div>
              <div className="sa-card-title">Répartition Plans</div>
              <div className="sa-card-subtitle">247 tenants actifs</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} strokeWidth={0}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181f', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(240,240,245,0.6)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
                {p.name} ({p.value}%)
              </div>
            ))}
          </div>

          <div className="sa-section-title" style={{ marginTop: 18 }}>Santé Serveurs</div>
          <div className="sa-server-health-list">
            {servers.map(s => (
              <div className="sa-server-row" key={s.name}>
                <div className={`sa-server-dot ${s.status}`} />
                <div className="sa-server-name">{s.name}</div>
                <div className="sa-server-latency">{s.latency}</div>
                <div className="sa-server-uptime">{s.uptime}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────
   TAB: TENANTS
   ──────────────────────────────────────── */
function TabTenants() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const filtered = useMemo(() => TENANTS.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'all' || t.plan === planFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  }), [search, planFilter, statusFilter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSuspend = (t) => setModal({
    title: `Suspendre ${t.name} ?`,
    desc: `L'accès au PMS sera immédiatement révoqué. Les données sont conservées. Cette action est réversible.`,
    icon: <Lock size={22} color="#ef4444" />,
    iconBg: 'rgba(239,68,68,0.12)',
    confirm: 'Suspendre',
    danger: true,
    onConfirm: () => { showToast(`${t.name} suspendu`); setModal(null); }
  });

  const handleReactivate = (t) => setModal({
    title: `Réactiver ${t.name} ?`,
    desc: `L'accès PMS sera rétabli immédiatement et une nouvelle tentative de paiement sera initiée.`,
    icon: <Unlock size={22} color="#10b981" />,
    iconBg: 'rgba(16,185,129,0.12)',
    confirm: 'Réactiver',
    danger: false,
    onConfirm: () => { showToast(`${t.name} réactivé`); setModal(null); }
  });

  const api健康 = (apis) => Object.values(apis).filter(Boolean).length;

  return (
    <>
      {toast && (
        <div className={`sa-alert ${toast.type}`} style={{ marginBottom: 14 }}>
          <CheckCircle size={14} /> {toast.msg}
        </div>
      )}

      <div className="sa-table-toolbar">
        <div className="sa-search-wrapper">
          <Search size={13} className="search-icon" />
          <input className="sa-search-input" placeholder="Rechercher client, email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sa-filter-select" value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
          <option value="all">Tous les plans</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select className="sa-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="warning">Avertissement</option>
          <option value="suspended">Suspendu</option>
        </select>
        <button className="sa-btn sa-btn-primary" style={{ marginLeft: 'auto' }}>
          <Plus size={13} /> Nouveau Tenant
        </button>
      </div>

      <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sa-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Plan</th>
              <th>Mode PMS</th>
              <th>MRR</th>
              <th>Propriétés</th>
              <th>APIs Actives</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id}>
                <td>
                  <div className="sa-avatar-cell">
                    <div className="sa-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="sa-tenant-name">{t.name}</div>
                      <div className="sa-tenant-email">{t.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`sa-plan-badge ${t.plan}`}><Star size={8} />{t.plan.charAt(0).toUpperCase() + t.plan.slice(1)}</span></td>
                <td><span className={`sa-chip pms-${t.mode}`}>{t.mode === 'pro' ? <Building2 size={9} /> : <Home size={9} />} PMS {t.mode.toUpperCase()}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--sa-text)' }}>${t.mrr.toLocaleString()}</td>
                <td style={{ textAlign: 'center', fontWeight: 600 }}>{t.properties}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span className={`sa-chip ${apiHealthColor(t.apis)}`}>{apiSante(t.apis)}/4</span>
                  </div>
                </td>
                <td>
                  <span className={`sa-status-badge ${t.status}`}>
                    <span className="sa-status-dot" />
                    {t.status === 'active' ? 'Actif' : t.status === 'warning' ? 'Alerte' : 'Suspendu'}
                  </span>
                </td>
                <td>
                  <div className="sa-action-btns">
                    <button className="sa-btn sa-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}><Eye size={11} /></button>
                    {t.status === 'suspended'
                      ? <button className="sa-btn sa-btn-success" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => handleReactivate(t)}><Unlock size={11} /></button>
                      : <button className="sa-btn sa-btn-danger" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => handleSuspend(t)}><Lock size={11} /></button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal modal={modal} onConfirm={modal?.onConfirm} onCancel={() => setModal(null)} />
    </>
  );
}

function apiSante(apis) { return Object.values(apis).filter(Boolean).length; }
function apiHealthColor(apis) {
  const v = apiSante(apis);
  if (v === 4) return 'api-ok';
  if (v >= 2) return 'pms-hot';
  return 'api-err';
}

/* ────────────────────────────────────────
   TAB: PLANS & PRICING
   ──────────────────────────────────────── */
function TabPlans() {
  const [plans, setPlans] = useState(PLANS_INIT);
  const [selectedPlan, setSelectedPlan] = useState('gold');
  const [pmsMode, setPmsMode] = useState('hot');
  const [modal, setModal] = useState(null);
  const [saved, setSaved] = useState(false);

  const features = pmsMode === 'hot' ? FEATURES_HOT : FEATURES_PRO;

  const toggle = (plan, key) => setPlans(p => ({
    ...p,
    [plan]: { ...p[plan], features: { ...p[plan].features, [key]: !p[plan].features[key] } }
  }));

  const setPrice = (plan, val) => setPlans(p => ({
    ...p, [plan]: { ...p[plan], price: val }
  }));

  const handleSave = () => setModal({
    title: 'Publier les tarifs ?',
    desc: 'Les nouveaux prix s\'appliqueront immédiatement aux prochains renouvellements. Les abonnements en cours ne sont pas affectés.',
    icon: <CreditCard size={22} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.12)',
    confirm: 'Publier',
    danger: false,
    onConfirm: () => { setSaved(true); setModal(null); setTimeout(() => setSaved(false), 3000); }
  });

  const planColors = { bronze: '#cd7f32', silver: '#b0b0ba', gold: '#f59e0b', enterprise: '#6366f1' };

  return (
    <>
      {saved && <div className="sa-alert success"><CheckCircle size={14} /> Tarifs publiés avec succès sur la plateforme.</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: 'var(--sa-text-muted)', fontWeight: 600 }}>Mode PMS :</span>
        {['hot', 'pro'].map(m => (
          <button key={m} onClick={() => setPmsMode(m)}
            className={`sa-btn ${pmsMode === m ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: 12 }}>
            {m === 'hot' ? <Home size={12} /> : <Building2 size={12} />}
            PMS {m.toUpperCase()}
          </button>
        ))}
        <button className="sa-btn sa-btn-primary" style={{ marginLeft: 'auto' }} onClick={handleSave}>
          <CheckCheck size={13} /> Publier les tarifs
        </button>
      </div>

      <div className="sa-plan-builder">
        {['bronze', 'silver', 'gold', 'enterprise'].map(plan => (
          <div key={plan} className={`sa-plan-card ${selectedPlan === plan ? 'selected' : ''}`} onClick={() => setSelectedPlan(plan)}>
            <div className="sa-plan-header">
              <span className="sa-plan-name" style={{ color: planColors[plan] }}>
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </span>
              <span className={`sa-plan-badge ${plan}`}>${plans[plan].price}/mo</span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--sa-text-muted)', marginBottom: 4, fontWeight: 600 }}>PRIX MENSUEL (€)</div>
              <input
                className="sa-plan-price-input"
                value={plans[plan].price}
                onChange={e => setPrice(plan, e.target.value)}
                onClick={e => e.stopPropagation()}
                type="number"
                min="0"
              />
            </div>

            <div className="sa-plan-features">
              {features.map(f => (
                <div className="sa-feature-toggle-row" key={f.key} onClick={e => e.stopPropagation()}>
                  <div className="sa-feature-info">
                    <span style={{ color: 'var(--sa-accent)' }}>{f.icon}</span>
                    <div>
                      <div>{f.label}</div>
                      <div className="sa-feature-category">{f.category}</div>
                    </div>
                  </div>
                  <label className="sa-toggle">
                    <input type="checkbox" checked={!!plans[plan].features[f.key]} onChange={() => toggle(plan, f.key)} />
                    <div className="sa-toggle-track" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal modal={modal} onConfirm={modal?.onConfirm} onCancel={() => setModal(null)} />
    </>
  );
}

/* ────────────────────────────────────────
   TAB: API COMMAND CENTER
   ──────────────────────────────────────── */
function TabAPI() {
  const [refreshing, setRefreshing] = useState(null);
  const [modal, setModal] = useState(null);

  const handleRefresh = (api) => setModal({
    title: `Rafraîchir ${api.name} ?`,
    desc: `Cette action régénérera les tokens OAuth pour tous les tenants connectés à ${api.name}. Interruption max ~30s.`,
    icon: <RefreshCw size={22} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.12)',
    confirm: 'Rafraîchir',
    danger: false,
    onConfirm: () => {
      setModal(null);
      setRefreshing(api.id);
      setTimeout(() => setRefreshing(null), 2500);
    }
  });

  const statusLabel = { operational: 'Opérationnel', degraded: 'Dégradé', error: 'Erreur' };
  const statusCls = { operational: 'active', degraded: 'warning', error: 'suspended' };

  return (
    <>
      {APIS.some(a => a.status === 'error') && (
        <div className="sa-alert error">
          <AlertTriangle size={14} /> {APIS.filter(a => a.status === 'error').length} intégration(s) en erreur critique – intervention requise.
        </div>
      )}
      {APIS.some(a => a.status === 'degraded') && (
        <div className="sa-alert warning">
          <AlertTriangle size={14} /> {APIS.filter(a => a.status === 'degraded').length} intégration(s) dégradée(s) – performances réduites.
        </div>
      )}

      <div className="sa-api-grid">
        {APIS.map(api => (
          <div className="sa-api-card" key={api.id}>
            <div className="sa-api-header">
              <div className="sa-api-icon" style={{ background: api.bg, fontSize: 22 }}>{api.icon}</div>
              <div>
                <div className="sa-api-name">{api.name}</div>
                <div className="sa-api-type">{api.type}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className={`sa-status-badge ${statusCls[api.status]}`}>
                  <span className="sa-status-dot" />
                  {statusLabel[api.status]}
                </span>
              </div>
            </div>

            <div className="sa-api-metrics">
              <div className="sa-api-metric">
                <div className="sa-api-metric-val" style={{ color: api.uptime > 99 ? 'var(--sa-green)' : api.uptime > 95 ? 'var(--sa-gold)' : 'var(--sa-red)' }}>
                  {api.uptime}%
                </div>
                <div className="sa-api-metric-label">Uptime</div>
              </div>
              <div className="sa-api-metric">
                <div className="sa-api-metric-val">{api.successRate}%</div>
                <div className="sa-api-metric-label">Succès</div>
              </div>
              <div className="sa-api-metric">
                <div className="sa-api-metric-val">{api.latency ? `${api.latency}ms` : '—'}</div>
                <div className="sa-api-metric-label">Latence</div>
              </div>
            </div>

            <div className="sa-progress-bar">
              <div className="sa-progress-fill" style={{
                width: `${api.successRate}%`,
                background: api.successRate > 98 ? 'var(--sa-green)' : api.successRate > 90 ? 'var(--sa-gold)' : 'var(--sa-red)'
              }} />
            </div>

            {api.lastError && (
              <div className="sa-alert error" style={{ marginBottom: 10, padding: '8px 10px', fontSize: 11 }}>
                <XCircle size={11} /> {api.lastError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="sa-btn sa-btn-ghost"
                style={{ fontSize: 11, flex: 1, justifyContent: 'center' }}
                onClick={() => handleRefresh(api)}
                disabled={refreshing === api.id}
              >
                <RefreshCw size={11} className={refreshing === api.id ? 'spin' : ''} />
                {refreshing === api.id ? 'Rafraîchissement…' : 'Rafraîchir tokens'}
              </button>
              <button className="sa-btn sa-btn-ghost" style={{ padding: '6px 10px' }}>
                <Settings size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal modal={modal} onConfirm={modal?.onConfirm} onCancel={() => setModal(null)} />
    </>
  );
}

/* ────────────────────────────────────────
   TAB: MULTI-TENANT SWITCHER
   ──────────────────────────────────────── */
function TabSwitcher() {
  const [hotModules, setHotModules] = useState({ ttlock: true, airbnb: true, whatsapp: true, dynamic_pricing: true, website_builder: true, workflow: false });
  const [proModules, setProModules] = useState({ housekeeping: true, fnb: true, staff: true, revenue_mgmt: true, ttlock: true, multi_property: false });

  const toggle = (setter, key) => setter(prev => ({ ...prev, [key]: !prev[key] }));

  const renderSection = (title, desc, modules, features, setter, badge) => (
    <div className="sa-pms-card active-pms">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="sa-pms-title">{title}</div>
          <div className="sa-pms-desc">{desc}</div>
        </div>
        <span className={`sa-chip pms-${badge}`}>{badge === 'hot' ? <Home size={9} /> : <Building2 size={9} />} PMS {badge.toUpperCase()}</span>
      </div>
      <div className="sa-module-list">
        {features.map(f => (
          <div className="sa-module-row" key={f.key}>
            <div className="sa-module-info">
              <div className="sa-module-icon" style={{ background: modules[f.key] ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: modules[f.key] ? 'var(--sa-accent)' : 'var(--sa-text-muted)' }}>
                {f.icon}
              </div>
              <div>
                <div className="sa-module-name">{f.label}</div>
                <div className="sa-module-tag">{f.category}</div>
              </div>
            </div>
            <label className="sa-toggle">
              <input type="checkbox" checked={!!modules[f.key]} onChange={() => toggle(setter, f.key)} />
              <div className="sa-toggle-track" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="sa-switcher-grid">
      {renderSection('PMS Hot', 'Particuliers, villas saisonnières, locations courtes durée.', hotModules, FEATURES_HOT, setHotModules, 'hot')}
      {renderSection('PMS Pro', 'Hôtels, résidences, complexes multi-propriétés.', proModules, FEATURES_PRO, setProModules, 'pro')}
    </div>
  );
}

/* ────────────────────────────────────────
   TAB: SUPPORT & LOGS
   ──────────────────────────────────────── */
function TabLogs() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? LOGS : LOGS.filter(l => l.type === filter);

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'success', 'info', 'warning', 'error'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`sa-btn ${filter === f ? 'sa-btn-primary' : 'sa-btn-ghost'}`}
            style={{ padding: '6px 14px', fontSize: 11, textTransform: 'capitalize' }}>
            {f === 'all' ? 'Tous' : f}
          </button>
        ))}
      </div>
      <div className="sa-card" style={{ padding: '0 20px' }}>
        <div className="sa-log-timeline">
          {filtered.map(log => (
            <div className="sa-log-item" key={log.id}>
              <div className={`sa-log-dot ${log.type}`} />
              <div className="sa-log-content">
                <div className="sa-log-header">
                  <span className="sa-log-title">{log.title}</span>
                  <span className="sa-log-time"><Clock size={10} style={{ display: 'inline', marginRight: 3 }} />{log.time}</span>
                </div>
                <div className="sa-log-detail">{log.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────
   TAB: PROVISIONING
   ──────────────────────────────────────── */
function TabProvisioning() {
  const steps = [
    { label: 'Paiement\nConfirmé', icon: <CreditCard size={20} />, status: 'done' },
    { label: 'Instance\nCréée', icon: <Database size={20} />, status: 'done' },
    { label: 'Plan\nAttribué', icon: <Star size={20} />, status: 'done' },
    { label: 'APIs\nConnectées', icon: <Wifi size={20} />, status: 'active' },
    { label: 'Accès\nEnvoyés', icon: <Bell size={20} />, status: 'idle' },
    { label: 'Onboarding\nLancé', icon: <Zap size={20} />, status: 'idle' },
  ];

  const recentProvisions = [
    { name: 'Mövenpick Casablanca', plan: 'enterprise', time: '2 min ago', status: 'done' },
    { name: 'Nomad Stays', plan: 'silver', time: '3h ago', status: 'error' },
    { name: 'Riad Andalou', plan: 'gold', time: '12h ago', status: 'done' },
    { name: 'Atlas Suites', plan: 'enterprise', time: '2 days ago', status: 'done' },
  ];

  return (
    <>
      <div className="sa-card" style={{ marginBottom: 20 }}>
        <div className="sa-card-header">
          <div>
            <div className="sa-card-title">Flux de Provisioning Zero-Touch</div>
            <div className="sa-card-subtitle">Automatisation complète à la souscription</div>
          </div>
          <span className="sa-status-badge active"><span className="sa-status-dot" /> Actif</span>
        </div>
        <div className="sa-provision-flow">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className="sa-provision-step">
                <div className={`sa-provision-icon ${s.status}`}>
                  {s.status === 'done' ? <CheckCircle size={22} /> : s.icon}
                </div>
                <div className="sa-provision-label">{s.label}</div>
              </div>
              {i < steps.length - 1 && <div className={`sa-provision-connector ${s.status === 'done' ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="sa-card-title" style={{ marginBottom: 14, fontSize: 12 }}>PROVISIONS RÉCENTES</div>
      <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sa-table">
          <thead><tr><th>Tenant</th><th>Plan</th><th>Déclenchement</th><th>Statut</th></tr></thead>
          <tbody>
            {recentProvisions.map(p => (
              <tr key={p.name}>
                <td style={{ fontWeight: 600, color: 'var(--sa-text)' }}>{p.name}</td>
                <td><span className={`sa-plan-badge ${p.plan}`}>{p.plan}</span></td>
                <td style={{ color: 'var(--sa-text-muted)', fontSize: 11 }}><Clock size={10} style={{ display: 'inline', marginRight: 4 }} />{p.time}</td>
                <td>
                  {p.status === 'done'
                    ? <span className="sa-status-badge active"><span className="sa-status-dot" />Complété</span>
                    : <span className="sa-status-badge suspended"><span className="sa-status-dot" />Échoué</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ============================================================
   TAB: INTEGRATIONS HUB
   Full catalogue of all provider categories + per-tenant history
   ============================================================ */

const INTEGRATION_PROVIDERS = {
  channels: [
    { id: 'airbnb',    name: 'Airbnb',         logo: '🏡', status: 'operational', tenants: 142, plan: ['silver','gold','enterprise'], type: 'OTA',           docs: 'https://airbnb.com/api', tokenType: 'OAuth2', uptime: 99.8, successRate: 99.8 },
    { id: 'booking',   name: 'Booking.com',    logo: '🌐', status: 'operational', tenants: 118, plan: ['silver','gold','enterprise'], type: 'OTA',           docs: 'https://developers.booking.com', tokenType: 'API Key', uptime: 99.5, successRate: 99.1 },
    { id: 'vrbo',      name: 'VRBO / Expedia', logo: '🛖', status: 'operational', tenants: 67,  plan: ['gold','enterprise'],          type: 'OTA',           docs: '', tokenType: 'OAuth2', uptime: 98.9, successRate: 97.4 },
    { id: 'agoda',     name: 'Agoda',          logo: '🌏', status: 'degraded',    tenants: 34,  plan: ['gold','enterprise'],          type: 'OTA',           docs: '', tokenType: 'API Key', uptime: 94.2, successRate: 88.1 },
    { id: 'tripadv',   name: 'TripAdvisor',    logo: '🦉', status: 'operational', tenants: 22,  plan: ['enterprise'],                 type: 'OTA',           docs: '', tokenType: 'API Key', uptime: 99.1, successRate: 98.5 },
    { id: 'cloudbeds', name: 'Cloudbeds',      logo: '☁️', status: 'error',       tenants: 18,  plan: ['enterprise'],                 type: 'PMS Bridge',    docs: '', tokenType: 'OAuth2', uptime: 88.1, successRate: 62.4 },
    { id: 'siteminder',name: 'SiteMinder',     logo: '📡', status: 'operational', tenants: 41,  plan: ['enterprise'],                 type: 'Channel Manager', docs: '', tokenType: 'Webhook+Key', uptime: 99.6, successRate: 99.2 },
  ],
  email: [
    { id: 'sendgrid',  name: 'SendGrid',       logo: '📧', status: 'operational', tenants: 201, plan: ['bronze','silver','gold','enterprise'], type: 'Transactionnel', tokenType: 'API Key', uptime: 99.97, successRate: 99.6 },
    { id: 'mailgun',   name: 'Mailgun',        logo: '🔫', status: 'operational', tenants: 38,  plan: ['gold','enterprise'],          type: 'Transactionnel', tokenType: 'API Key', uptime: 99.82, successRate: 99.1 },
    { id: 'brevo',     name: 'Brevo (Sendinblue)', logo: '💌', status: 'operational', tenants: 47, plan: ['silver','gold'], type: 'Marketing + Transac.', tokenType: 'API Key', uptime: 99.71, successRate: 98.7 },
    { id: 'smtp2go',   name: 'SMTP2GO',        logo: '📨', status: 'operational', tenants: 12,  plan: ['bronze','silver'],            type: 'SMTP Relay',     tokenType: 'SMTP Creds', uptime: 99.5, successRate: 98.0 },
    { id: 'mailchimp', name: 'Mailchimp',      logo: '🐒', status: 'degraded',    tenants: 9,   plan: ['gold','enterprise'],          type: 'Marketing',      tokenType: 'OAuth2', uptime: 95.4, successRate: 91.2 },
  ],
  whatsapp: [
    { id: 'waba_meta', name: 'WhatsApp Business API (Meta)', logo: '💬', status: 'operational', tenants: 178, plan: ['silver','gold','enterprise'], type: 'Officiel Meta', tokenType: 'Permanent Token', uptime: 99.8, successRate: 98.7 },
    { id: 'twilio_wa', name: 'Twilio WhatsApp',  logo: '🔴', status: 'operational', tenants: 54,  plan: ['gold','enterprise'],          type: 'Via Twilio',    tokenType: 'API Key+SID', uptime: 99.9, successRate: 99.3 },
    { id: 'wati',      name: 'WATI.io',          logo: '🤖', status: 'operational', tenants: 29,  plan: ['silver','gold'],              type: 'No-code WA',    tokenType: 'API Key', uptime: 99.2, successRate: 97.8 },
    { id: 'tyntec',    name: 'Tyntec',           logo: '📞', status: 'degraded',    tenants: 8,   plan: ['enterprise'],                 type: 'Entreprise',    tokenType: 'OAuth2', uptime: 93.1, successRate: 85.4 },
  ],
  apps: [
    { id: 'ttlock',    name: 'TTLock Smart Locks', logo: '🔐', status: 'degraded', tenants: 87,  plan: ['silver','gold','enterprise'], type: 'IoT / Accès',   tokenType: 'OAuth2', uptime: 96.4, successRate: 87.3 },
    { id: 'stripe',    name: 'Stripe Payments',   logo: '💳', status: 'operational', tenants: 247, plan: ['bronze','silver','gold','enterprise'], type: 'Paiement', tokenType: 'API Key+Webhook', uptime: 99.97, successRate: 99.2 },
    { id: 'nuki',      name: 'Nuki Locks',        logo: '🗝️', status: 'operational', tenants: 14,  plan: ['gold','enterprise'],         type: 'IoT / Accès',   tokenType: 'OAuth2', uptime: 99.1, successRate: 98.5 },
    { id: 'dormakaba', name: 'dormakaba® Oracode',logo: '🏢', status: 'operational', tenants: 7,   plan: ['enterprise'],                type: 'Serrure Hôtel', tokenType: 'API Key', uptime: 99.5, successRate: 99.0 },
    { id: 'operto',    name: 'Operto Guest',      logo: '🛎️', status: 'operational', tenants: 22,  plan: ['gold','enterprise'],         type: 'Digital Concierge', tokenType: 'OAuth2', uptime: 99.3, successRate: 98.1 },
    { id: 'duve',      name: 'Duve Guest App',    logo: '📱', status: 'operational', tenants: 31,  plan: ['silver','gold','enterprise'], type: 'Guest Journey', tokenType: 'API Key', uptime: 99.6, successRate: 98.9 },
    { id: 'pricelabs', name: 'PriceLabs',         logo: '📊', status: 'operational', tenants: 68,  plan: ['gold','enterprise'],         type: 'Revenue Mgmt',  tokenType: 'API Key', uptime: 99.7, successRate: 99.4 },
  ],
};

const INT_HISTORY = [
  { id: 1,  time: '2 min ago',    tenant: 'Mövenpick Casablanca', category: 'channels',  provider: 'SiteMinder',   action: 'Sync inventory', status: 'success', detail: '220 rooms synced across 4 OTAs' },
  { id: 2,  time: '8 min ago',    tenant: 'Atlas Suites',         category: 'whatsapp',  provider: 'WABA Meta',    action: 'Message sent',   status: 'success', detail: 'Check-in reminder → 47 guests' },
  { id: 3,  time: '14 min ago',   tenant: 'Villa Horizon',        category: 'apps',      provider: 'TTLock',       action: 'Token refresh',  status: 'error',   detail: 'connect.ttlock.com 401 – retry scheduled' },
  { id: 4,  time: '22 min ago',   tenant: 'Riad Andalou',         category: 'email',     provider: 'SendGrid',     action: 'Booking confirm', status: 'success', detail: '8 emails dispatched, 0 bounces' },
  { id: 5,  time: '35 min ago',   tenant: 'Dar Nour',             category: 'channels',  provider: 'Airbnb',       action: 'Rate push',      status: 'warning', detail: 'Rate update delayed 4 min (API queue)' },
  { id: 6,  time: '48 min ago',   tenant: 'Résidence Elysée',     category: 'apps',      provider: 'Stripe',       action: 'Webhook recv',   status: 'success', detail: 'payment_intent.succeeded – €1,850' },
  { id: 7,  time: '1h ago',       tenant: 'Atlas Suites',         category: 'channels',  provider: 'Booking.com',  action: 'Reservation sync', status: 'success', detail: '3 new bookings pulled' },
  { id: 8,  time: '1h 12m ago',   tenant: 'Nomad Stays',          category: 'email',     provider: 'Brevo',        action: 'Campaign send',  status: 'error',   detail: 'API key revoked – account suspended' },
  { id: 9,  time: '1h 30m ago',   tenant: 'Mövenpick Casablanca', category: 'whatsapp',  provider: 'Twilio WA',    action: 'Bulk message',   status: 'success', detail: 'Late checkout alert → 34 guests' },
  { id: 10, time: '2h ago',       tenant: 'Résidence Elysée',     category: 'apps',      provider: 'PriceLabs',    action: 'Price suggestion', status: 'success', detail: 'Dynamic rates applied to 12 properties' },
  { id: 11, time: '2h 45m ago',   tenant: 'Villa Horizon',        category: 'channels',  provider: 'VRBO',         action: 'Availability sync', status: 'success', detail: '3 properties updated' },
  { id: 12, time: '3h ago',       tenant: 'Atlas Suites',         category: 'apps',      provider: 'Nuki',         action: 'Code generated', status: 'success', detail: 'Guest access code #4821 emitted' },
];

const CATEGORY_META = {
  channels:  { label: 'Channel Managers & OTAs', icon: '🌐', color: '#6366f1' },
  email:     { label: 'Fournisseurs Email',       icon: '📧', color: '#10b981' },
  whatsapp:  { label: 'WhatsApp Providers',       icon: '💬', color: '#25d366' },
  apps:      { label: 'Apps & Intégrations',      icon: '⚡', color: '#f59e0b' },
};

function ProviderStatusDot({ status }) {
  const cls = status === 'operational' ? 'green' : status === 'degraded' ? 'yellow' : 'red';
  return <span className={`sa-server-dot ${cls}`} style={{ width: 7, height: 7, flexShrink: 0 }} />;
}

function ProviderCard({ p, onRefresh }) {
  const statusCls = { operational: 'active', degraded: 'warning', error: 'suspended' };
  const statusLabel = { operational: 'Opérationnel', degraded: 'Dégradé', error: 'Erreur' };
  return (
    <div className="sa-int-provider-card">
      <div className="sa-int-provider-header">
        <span style={{ fontSize: 22 }}>{p.logo}</span>
        <div style={{ flex: 1 }}>
          <div className="sa-int-provider-name">{p.name}</div>
          <div className="sa-int-provider-type">{p.type} · {p.tokenType}</div>
        </div>
        <span className={`sa-status-badge ${statusCls[p.status]}`}>
          <span className="sa-status-dot" />{statusLabel[p.status]}
        </span>
      </div>
      <div className="sa-int-provider-metrics">
        <div className="sa-int-metric">
          <div className="sa-int-metric-val" style={{ color: p.uptime > 99 ? 'var(--sa-green)' : p.uptime > 95 ? 'var(--sa-gold)' : 'var(--sa-red)' }}>{p.uptime}%</div>
          <div className="sa-int-metric-lbl">Uptime</div>
        </div>
        <div className="sa-int-metric">
          <div className="sa-int-metric-val" style={{ color: p.successRate > 98 ? 'var(--sa-green)' : p.successRate > 90 ? 'var(--sa-gold)' : 'var(--sa-red)' }}>{p.successRate}%</div>
          <div className="sa-int-metric-lbl">Succès</div>
        </div>
        <div className="sa-int-metric">
          <div className="sa-int-metric-val">{p.tenants}</div>
          <div className="sa-int-metric-lbl">Tenants</div>
        </div>
      </div>
      <div className="sa-progress-bar" style={{ marginBottom: 10 }}>
        <div className="sa-progress-fill" style={{ width: `${p.successRate}%`, background: p.successRate > 98 ? 'var(--sa-green)' : p.successRate > 90 ? 'var(--sa-gold)' : 'var(--sa-red)' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {p.plan.map(pl => <span key={pl} className={`sa-plan-badge ${pl}`}>{pl}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="sa-btn sa-btn-ghost" style={{ fontSize: 11, flex: 1, justifyContent: 'center' }} onClick={() => onRefresh(p)}>
          <RefreshCw size={11} /> Rafraîchir tokens
        </button>
        <button className="sa-btn sa-btn-ghost" style={{ padding: '6px 10px' }}><Settings size={11} /></button>
      </div>
    </div>
  );
}

function TabIntegrations() {
  const [category, setCategory] = useState('channels');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [tenantSearch, setTenantSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [view, setView] = useState('catalogue'); // 'catalogue' | 'history'

  const providers = INTEGRATION_PROVIDERS[category] || [];

  const filteredHistory = useMemo(() => INT_HISTORY.filter(h => {
    const matchCat = historyFilter === 'all' || h.category === historyFilter;
    const matchTenant = !tenantSearch || h.tenant.toLowerCase().includes(tenantSearch.toLowerCase());
    return matchCat && matchTenant;
  }), [historyFilter, tenantSearch]);

  const handleRefresh = (p) => setModal({
    title: `Rafraîchir ${p.name} ?`,
    desc: `Tous les tokens OAuth de ${p.name} seront régénérés pour les ${p.tenants} tenants connectés. Interruption max ~30s.`,
    icon: <RefreshCw size={22} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.12)',
    confirm: 'Rafraîchir',
    danger: false,
    onConfirm: () => setModal(null),
  });

  const totalProviders = Object.values(INTEGRATION_PROVIDERS).flat().length;
  const errorCount = Object.values(INTEGRATION_PROVIDERS).flat().filter(p => p.status === 'error').length;
  const degradedCount = Object.values(INTEGRATION_PROVIDERS).flat().filter(p => p.status === 'degraded').length;

  return (
    <>
      {/* Top KPI strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Fournisseurs actifs', value: totalProviders, sub: '4 catégories', color: 'var(--sa-accent)' },
          { label: 'Erreurs critiques', value: errorCount, sub: 'intervention requise', color: 'var(--sa-red)' },
          { label: 'Dégradés', value: degradedCount, sub: 'performance réduite', color: 'var(--sa-gold)' },
          { label: 'Événements / 24h', value: '1,842', sub: 'toutes catégories', color: 'var(--sa-green)' },
        ].map(k => (
          <div key={k.label} className="sa-kpi-card" style={{ flex: 1, minWidth: 0 }}>
            <div className="sa-kpi-label">{k.label}</div>
            <div className="sa-kpi-value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: 'var(--sa-text-muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button className={`sa-btn ${view === 'catalogue' ? 'sa-btn-primary' : 'sa-btn-ghost'}`} style={{ fontSize: 12 }} onClick={() => setView('catalogue')}>
          <Globe size={12} /> Catalogue Fournisseurs
        </button>
        <button className={`sa-btn ${view === 'history' ? 'sa-btn-primary' : 'sa-btn-ghost'}`} style={{ fontSize: 12 }} onClick={() => setView('history')}>
          <Clock size={12} /> Historique Global
        </button>
        {errorCount > 0 && (
          <div className="sa-alert error" style={{ marginBottom: 0, padding: '6px 12px', fontSize: 11, marginLeft: 'auto' }}>
            <AlertTriangle size={12} /> {errorCount} fournisseur(s) en erreur
          </div>
        )}
      </div>

      {view === 'catalogue' ? (
        <>
          {/* Category tabs */}
          <div className="sa-int-cat-tabs">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const list = INTEGRATION_PROVIDERS[key];
              const errCnt = list.filter(p => p.status === 'error').length;
              const degCnt = list.filter(p => p.status === 'degraded').length;
              return (
                <button key={key} className={`sa-int-cat-btn ${category === key ? 'active' : ''}`} onClick={() => setCategory(key)}>
                  <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{meta.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--sa-text-muted)' }}>{list.length} fournisseurs</div>
                  </div>
                  {(errCnt > 0 || degCnt > 0) && (
                    <span style={{ marginLeft: 'auto', background: errCnt > 0 ? 'var(--sa-red)' : 'var(--sa-gold)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>
                      {errCnt > 0 ? `${errCnt} err` : `${degCnt} ⚠`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Provider cards grid */}
          <div className="sa-int-provider-grid">
            {providers.map(p => <ProviderCard key={p.id} p={p} onRefresh={handleRefresh} />)}
          </div>
        </>
      ) : (
        // ── HISTORY VIEW ──
        <>
          <div className="sa-table-toolbar" style={{ marginBottom: 14 }}>
            <div className="sa-search-wrapper">
              <Search size={13} className="search-icon" />
              <input className="sa-search-input" placeholder="Filtrer par tenant…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)} />
            </div>
            <select className="sa-filter-select" value={historyFilter} onChange={e => setHistoryFilter(e.target.value)}>
              <option value="all">Toutes catégories</option>
              <option value="channels">Channel Managers</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="apps">Apps & IoT</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--sa-text-muted)' }}>{filteredHistory.length} événements</span>
          </div>

          <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Temps</th>
                  <th>Tenant</th>
                  <th>Catégorie</th>
                  <th>Fournisseur</th>
                  <th>Action</th>
                  <th>Statut</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontSize: 11, color: 'var(--sa-text-muted)', whiteSpace: 'nowrap' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />{h.time}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--sa-text)', fontSize: 12 }}>{h.tenant}</td>
                    <td>
                      <span style={{ fontSize: 14 }}>{CATEGORY_META[h.category]?.icon}</span>
                      <span style={{ fontSize: 10, color: 'var(--sa-text-muted)', marginLeft: 5 }}>{CATEGORY_META[h.category]?.label.split(' ')[0]}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--sa-text-soft)', fontWeight: 600 }}>{h.provider}</td>
                    <td style={{ fontSize: 11, color: 'var(--sa-text-muted)' }}>{h.action}</td>
                    <td>
                      <span className={`sa-status-badge ${h.status === 'success' ? 'active' : h.status === 'warning' ? 'warning' : 'suspended'}`}>
                        <span className="sa-status-dot" />
                        {h.status === 'success' ? 'OK' : h.status === 'warning' ? 'Alerte' : 'Erreur'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--sa-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmModal modal={modal} onConfirm={modal?.onConfirm} onCancel={() => setModal(null)} />
    </>
  );
}

/* ────────────────────────────────────────
   MAIN SHELL
   ──────────────────────────────────────── */
const TABS = [
  { id: 'dashboard',     label: 'Dashboard',           icon: <LayoutDashboard size={15} /> },
  { id: 'tenants',       label: 'Tenants',              icon: <Users size={15} /> },
  { id: 'plans',         label: 'Plans & Pricing',      icon: <CreditCard size={15} /> },
  { id: 'integrations',  label: 'Intégrations Hub',     icon: <Globe size={15} /> },
  { id: 'api',           label: 'API Command Center',   icon: <Activity size={15} /> },
  { id: 'switcher',      label: 'Module Switcher',      icon: <Layers size={15} /> },
  { id: 'provisioning',  label: 'Provisioning',         icon: <Zap size={15} /> },
  { id: 'logs',          label: 'Support & Logs',       icon: <HeadphonesIcon size={15} /> },
];

const TAB_TITLES = {
  dashboard:    { title: 'Dashboard Pilote',         sub: 'Vue d\'ensemble de la plateforme AntiGravity' },
  tenants:      { title: 'Gestion Tenants',           sub: 'Clients, plans, accès et revenus' },
  plans:        { title: 'Plans & Pricing Builder',  sub: 'Configurez les offres et activez les modules en temps réel' },
  integrations: { title: 'Intégrations Hub',          sub: 'Catalogue Channels · Email · WhatsApp · Apps — historique global cross-tenants' },
  api:          { title: 'API Command Center',        sub: 'Surveillance et santé des intégrations tierces' },
  switcher:     { title: 'Multi-Tenant Switcher',    sub: 'Activez/désactivez les modules par version PMS' },
  provisioning: { title: 'Workflow Provisioning',    sub: 'Automatisation Zero-Touch à la souscription' },
  logs:         { title: 'Support & Logs',           sub: 'Journal d\'événements système en temps réel' },
};

export default function SuperAdmin() {
  const [tab, setTab] = useState('dashboard');

  const renderTab = () => {
    switch (tab) {
      case 'dashboard':    return <TabDashboard />;
      case 'tenants':      return <TabTenants />;
      case 'plans':        return <TabPlans />;
      case 'integrations': return <TabIntegrations />;
      case 'api':          return <TabAPI />;
      case 'switcher':     return <TabSwitcher />;
      case 'provisioning': return <TabProvisioning />;
      case 'logs':         return <TabLogs />;
      default:             return <TabDashboard />;
    }
  };

  return (
    <div className="sa-shell">
      {/* Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-logo">
          <div className="sa-sidebar-logo-icon">AG</div>
          <div className="sa-sidebar-logo-text">
            <strong>AntiGravity</strong>
            <span>Super Admin</span>
          </div>
        </div>

        <div className="sa-nav-group-label">Navigation</div>
        {TABS.map(t => (
          <button key={t.id} className={`sa-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon}
            {t.label}
            {t.id === 'api' && <span className="nav-badge">1</span>}
          </button>
        ))}

        <div className="sa-sidebar-footer">
          <div className="sa-nav-group-label">Système</div>
          <button className="sa-nav-item"><Settings size={15} /> Paramètres</button>
          <button className="sa-nav-item"><LogOut size={15} /> Déconnexion</button>
        </div>
      </aside>

      {/* Main */}
      <div className="sa-main">
        <div className="sa-topbar">
          <div className="sa-topbar-left">
            <div className="sa-topbar-title">{TAB_TITLES[tab]?.title}</div>
            <div className="sa-topbar-subtitle">{TAB_TITLES[tab]?.sub}</div>
          </div>
          <div className="sa-topbar-right">
            <span className="sa-status-badge active" style={{ padding: '5px 12px' }}>
              <span className="sa-status-dot" /> Plateforme opérationnelle
            </span>
            <button className="sa-btn sa-btn-ghost" style={{ padding: '8px 10px' }}>
              <Bell size={14} />
            </button>
          </div>
        </div>
        <div className="sa-content">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
