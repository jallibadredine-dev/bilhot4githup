import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, TrendingDown, Users, BedDouble, CreditCard,
  MessageSquare, Key, Zap, Activity, BellRing, CheckCircle2, AlertTriangle,
  Clock, ArrowRight, Wifi, WifiOff, Globe2, RefreshCw, Sparkles,
  BarChart3, Shield, ChevronRight, Unlock, Lock, Battery, BatteryLow,
  UserCheck, LogOut, Star, Inbox, MoreHorizontal, DollarSign, Percent,
  CalendarDays, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlanningCalendar from './PlanningCalendar';
import './ModularDashboard.css';

const now = new Date();
const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const CHANNELS = [
  { name: 'Booking.com', color: '#003580', bg: '#EFF6FF', reservations: 12, pending: 2, synced: true, lastSync: 'Il y a 2 min', logo: 'B.' },
  { name: 'Airbnb',      color: '#FF5A5F', bg: '#FFF1F2', reservations: 5,  pending: 1, synced: true, lastSync: 'Il y a 4 min', logo: 'A.' },
  { name: 'Expedia',     color: '#FFC72C', bg: '#FFFBEB', reservations: 3,  pending: 0, synced: true, lastSync: 'Il y a 8 min', logo: 'E.' },
  { name: 'Direct',      color: '#2563EB', bg: '#EFF6FF', reservations: 8,  pending: 0, synced: true, lastSync: 'Il y a 1 min', logo: 'D.' },
];

const LOCKS = [
  { room: '101', name: 'Suite Panorama', status: 'online',  battery: 87, lastEvent: 'Ouverture 08:12', guest: 'M. Dupont' },
  { room: '102', name: 'Chambre Standard', status: 'online', battery: 62, lastEvent: 'Ouverture 09:30', guest: 'Libre' },
  { room: '201', name: 'Junior Suite',   status: 'online',  battery: 91, lastEvent: 'Verrouillé 07:45', guest: 'S. Martin' },
  { room: '202', name: 'Suite Deluxe',   status: 'offline', battery: 12, lastEvent: 'Hors ligne 06:00', guest: 'Check-in 15h' },
  { room: '304', name: 'Penthouse VIP',  status: 'online',  battery: 44, lastEvent: 'Code généré 10:00', guest: 'R. Chen' },
  { room: '305', name: 'Chambre Vue Mer',status: 'online',  battery: 78, lastEvent: 'Ouverture 08:55', guest: 'Libre' },
];

const ALERTS = [
  { id: 1, type: 'error',   title: 'Serrure Ch. 202 hors ligne', desc: 'Batterie critique (12%). Remplacement requis avant check-in 15h.', module: 'locks', time: 'Urgent', auto: false },
  { id: 2, type: 'warning', title: '3 clés digitales à générer', desc: 'Arrivées cet après-midi sans code d\'accès IoT configuré.', module: 'locks', time: 'Il y a 5 min', auto: false },
  { id: 3, type: 'success', title: 'Sync Channel Manager OK', desc: '28 réservations synchronisées — Booking, Airbnb, Expedia, Direct.', module: 'distribution', time: 'Il y a 2 min', auto: true },
  { id: 4, type: 'warning', title: 'Nettoyage VIP Ch. 304', desc: 'M. Chen arrive à 14h. Femme de chambre assignée: Marie K.', module: 'housekeeping', time: 'Il y a 10 min', auto: true },
  { id: 5, type: 'info',    title: 'Acompte Booking.com reçu', desc: '2 paiements Stripe traités (€340). Folios mis à jour.', module: 'billing-engine', time: '11:42', auto: true },
  { id: 6, type: 'success', title: 'Check-in Digital Validé', desc: 'Mme Leroy (Ch. 201) — formulaire police envoyé automatiquement.', module: 'checkin-manager', time: '09:30', auto: true },
];

const ARRIVALS = [
  { name: 'Chen, Robert',  room: '304', time: '14:00', nights: 3, source: 'Booking.com',  status: 'pending',   vip: true  },
  { name: 'Dupont, Alice', room: '101', time: '15:30', nights: 2, source: 'Direct',       status: 'checked-in', vip: false },
  { name: 'Smith, John',   room: '202', time: '16:00', nights: 1, source: 'Airbnb',       status: 'pending',   vip: false },
  { name: 'Müller, Hans',  room: '103', time: '18:00', nights: 5, source: 'Expedia',      status: 'late',      vip: false },
];

const DEPARTURES = [
  { name: 'Martin, Sophie', room: '201', time: '11:00', status: 'checked-out' },
  { name: 'Leblanc, Paul',  room: '102', time: '12:00', status: 'pending'     },
];

const REVENUE_DAYS = [
  { day: 'Lun', amount: 1240, occ: 74 },
  { day: 'Mar', amount: 1580, occ: 82 },
  { day: 'Mer', amount: 1320, occ: 76 },
  { day: 'Jeu', amount: 1890, occ: 91 },
  { day: 'Ven', amount: 2100, occ: 97 },
  { day: 'Sam', amount: 1960, occ: 94 },
  { day: 'Auj', amount: 1745, occ: 88 },
];

const AUTOMATIONS = [
  { icon: <Bot size={14}/>,       label: 'Msg. bienvenue envoyé',    target: 'M. Chen (Ch.304)',    time: '10:02', color: '#8B5CF6' },
  { icon: <Key size={14}/>,       label: 'Code TTLock généré',       target: 'Mme Dupont (Ch.101)', time: '09:58', color: '#2563EB' },
  { icon: <CreditCard size={14}/>, label: 'Facture générée auto.',   target: 'Booking #28341',      time: '09:45', color: '#16A34A' },
  { icon: <Shield size={14}/>,    label: 'Fiche police soumise',     target: 'Mme Leroy (Ch.201)',  time: '09:30', color: '#F59E0B' },
  { icon: <Star size={14}/>,      label: 'Demande avis envoyée',     target: 'M. Leblanc (Ch.102)', time: '08:55', color: '#EC4899' },
  { icon: <RefreshCw size={14}/>, label: 'Sync OTA complète',        target: '28 réservations',     time: '08:30', color: '#0EA5E9' },
];

const maxRevenue = Math.max(...REVENUE_DAYS.map(d => d.amount));

const KPICard = ({ title, value, unit, sub, trend, trendUp, icon, bg, onClick }) => (
  <motion.div
    className="kpi-card"
    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="kpi-top">
      <span className="kpi-label">{title}</span>
      <div className="kpi-icon-wrap" style={{ background: bg }}>{icon}</div>
    </div>
    <div className="kpi-value-row">
      <span className="kpi-value">{value}</span>
      {unit && <span className="kpi-unit">{unit}</span>}
    </div>
    {sub && <div className="kpi-sub">{sub}</div>}
    {trend && (
      <div className={`kpi-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
        {trendUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        <span>{trend}</span>
      </div>
    )}
  </motion.div>
);

const PulseDot = ({ color = '#16A34A' }) => (
  <span className="pulse-dot" style={{ background: color, boxShadow: `0 0 0 3px ${color}33` }}/>
);

const ModularDashboard = ({ pmsMode, onModuleSelect }) => {
  const [tab, setTab]           = useState('arrivals');
  const [syncing, setSyncing]   = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const nav = (route) => onModuleSelect && onModuleSelect(route);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const visibleAlerts = ALERTS.filter(a => !dismissedAlerts.includes(a.id));
  const locksOnline   = LOCKS.filter(l => l.status === 'online').length;
  const locksBatLow   = LOCKS.filter(l => l.battery < 20).length;

  return (
    <div className="db-root">

      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}
      <div className="db-header">
        <div className="db-header-left">
          <div className="db-hotel-badge">
            <Building2 size={18} color="#2563EB"/>
            <div>
              <span className="db-hotel-name">Hôtel Hova — Villa Sunrise</span>
              <span className="db-hotel-date">{dateStr}</span>
            </div>
          </div>
        </div>
        <div className="db-header-center">
          <div className="db-live-pill">
            <PulseDot />
            <span>Système opérationnel</span>
            <span className="db-live-time">{timeStr}</span>
          </div>
        </div>
        <div className="db-header-right">
          <button className={`db-btn-secondary ${syncing ? 'syncing' : ''}`} onClick={handleSync}>
            <RefreshCw size={14} className={syncing ? 'spin' : ''}/>
            <span>{syncing ? 'Sync...' : 'Sync OTA'}</span>
          </button>
          <button className="db-btn-primary" onClick={() => nav('checkin-manager')}>
            <UserCheck size={14}/>
            <span>Check-in</span>
          </button>
          <button className="db-btn-icon" onClick={() => nav('unified-inbox')} title="Inbox">
            <Inbox size={16}/>
            <span className="db-notif-badge">2</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 1 — KPIs
      ══════════════════════════════════════════════════ */}
      <div className="db-kpi-row">
        <KPICard
          title="Taux d'Occupation"
          value="88%" unit="" sub="30 / 34 chambres"
          trend="+6% vs hier" trendUp
          icon={<Percent size={18} color="#2563EB"/>} bg="#EFF6FF"
          onClick={() => nav('frontdesk')}
        />
        <KPICard
          title="RevPAR Aujourd'hui"
          value="162" unit="€"
          trend="+14% vs semaine" trendUp
          icon={<DollarSign size={18} color="#16A34A"/>} bg="#F0FDF4"
          onClick={() => nav('revenue')}
        />
        <KPICard
          title="Arrivées / Départs"
          value="4 / 2" unit=""
          sub="2 en retard"
          trend="2 check-ins en attente" trendUp={false}
          icon={<Users size={18} color="#D97706"/>} bg="#FFFBEB"
          onClick={() => nav('checkin-manager')}
        />
        <KPICard
          title="Revenu du Jour"
          value="1 745" unit="€"
          trend="+8% vs hier" trendUp
          icon={<TrendingUp size={18} color="#7C3AED"/>} bg="#F5F3FF"
          onClick={() => nav('billing-engine')}
        />
        <KPICard
          title="Serrures Connectées"
          value={`${locksOnline}`} unit={`/ ${LOCKS.length}`}
          sub={locksBatLow > 0 ? `${locksBatLow} batterie critique` : 'Toutes opérationnelles'}
          trend={locksBatLow > 0 ? 'Action requise' : 'Statut OK'} trendUp={locksBatLow === 0}
          icon={<Key size={18} color={locksBatLow > 0 ? '#DC2626' : '#2563EB'}/>}
          bg={locksBatLow > 0 ? '#FEF2F2' : '#EFF6FF'}
          onClick={() => nav('locks')}
        />
        <KPICard
          title="Messages Non Lus"
          value="7" unit=""
          sub="Booking (3), Airbnb (2), Direct (2)"
          trend="3 urgents" trendUp={false}
          icon={<MessageSquare size={18} color="#0EA5E9"/>} bg="#F0F9FF"
          onClick={() => nav('unified-inbox')}
        />
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 2 — Channel Manager | Smart Locks | Alertes
      ══════════════════════════════════════════════════ */}
      <div className="db-triple-row">

        {/* ─── CHANNEL MANAGER ─── */}
        <div className="db-card db-channels">
          <div className="db-card-header">
            <div className="db-card-title">
              <Globe2 size={16} color="#2563EB"/>
              <span>Channel Manager</span>
              <PulseDot/>
            </div>
            <button className="db-card-action" onClick={() => nav('distribution')}>
              Gérer <ChevronRight size={14}/>
            </button>
          </div>
          <div className="db-card-body">
            <div className="db-channels-grid">
              {CHANNELS.map((ch, i) => (
                <div className="db-channel-item" key={i}>
                  <div className="db-ch-logo" style={{ background: ch.bg, color: ch.color }}>{ch.logo}</div>
                  <div className="db-ch-info">
                    <span className="db-ch-name">{ch.name}</span>
                    <span className="db-ch-sync">{ch.lastSync}</span>
                  </div>
                  <div className="db-ch-stats">
                    <span className="db-ch-count">{ch.reservations}</span>
                    {ch.pending > 0 && <span className="db-ch-pending">{ch.pending} en attente</span>}
                  </div>
                  {ch.synced
                    ? <CheckCircle2 size={14} color="#16A34A" className="db-ch-status"/>
                    : <AlertTriangle size={14} color="#DC2626" className="db-ch-status"/>
                  }
                </div>
              ))}
            </div>
            <div className="db-channels-footer">
              <span className="db-channels-total">
                <strong>{CHANNELS.reduce((s, c) => s + c.reservations, 0)}</strong> réservations actives
              </span>
              <span className="db-channels-pending">
                <AlertTriangle size={12} color="#D97706"/>
                {CHANNELS.reduce((s, c) => s + c.pending, 0)} en attente
              </span>
            </div>
          </div>
        </div>

        {/* ─── SMART LOCKS ─── */}
        <div className="db-card db-locks">
          <div className="db-card-header">
            <div className="db-card-title">
              <Key size={16} color="#7C3AED"/>
              <span>Smart Access (IoT)</span>
              <span className="db-locks-badge">{locksOnline}/{LOCKS.length}</span>
            </div>
            <button className="db-card-action" onClick={() => nav('locks')}>
              Gérer <ChevronRight size={14}/>
            </button>
          </div>
          <div className="db-card-body">
            <div className="db-locks-list">
              {LOCKS.map((lk, i) => (
                <div className={`db-lock-item ${lk.status}`} key={i}>
                  <div className={`db-lock-icon ${lk.status}`}>
                    {lk.status === 'online' ? <Unlock size={13}/> : <WifiOff size={13}/>}
                  </div>
                  <div className="db-lock-info">
                    <span className="db-lock-room">Ch. {lk.room}</span>
                    <span className="db-lock-event">{lk.lastEvent}</span>
                  </div>
                  <div className="db-lock-right">
                    <span className="db-lock-guest">{lk.guest}</span>
                    <div className={`db-battery ${lk.battery < 20 ? 'critical' : lk.battery < 40 ? 'low' : ''}`}>
                      {lk.battery < 20 ? <BatteryLow size={11}/> : <Battery size={11}/>}
                      <span>{lk.battery}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ALERTES & TÂCHES ─── */}
        <div className="db-card db-alerts">
          <div className="db-card-header">
            <div className="db-card-title">
              <BellRing size={16} color="#F59E0B"/>
              <span>Alertes & Actions</span>
              {visibleAlerts.filter(a => a.type === 'error' || a.type === 'warning').length > 0 && (
                <span className="db-alerts-count">
                  {visibleAlerts.filter(a => a.type === 'error' || a.type === 'warning').length}
                </span>
              )}
            </div>
          </div>
          <div className="db-card-body db-alerts-list">
            <AnimatePresence>
              {visibleAlerts.map((al) => (
                <motion.div
                  key={al.id}
                  className={`db-alert-item db-alert-${al.type}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  layout
                >
                  <div className={`db-alert-dot db-alert-dot-${al.type}`}/>
                  <div className="db-alert-body">
                    <div className="db-alert-title-row">
                      <span className="db-alert-title">{al.title}</span>
                      {al.auto && <span className="db-auto-badge"><Zap size={9}/> Auto</span>}
                    </div>
                    <p className="db-alert-desc">{al.desc}</p>
                    <div className="db-alert-footer">
                      <span className="db-alert-time"><Clock size={10}/>{al.time}</span>
                      {al.module && (
                        <button className="db-alert-action" onClick={() => nav(al.module)}>
                          Voir <ArrowRight size={10}/>
                        </button>
                      )}
                    </div>
                  </div>
                  <button className="db-alert-dismiss" onClick={() => setDismissedAlerts(p => [...p, al.id])}>×</button>
                </motion.div>
              ))}
            </AnimatePresence>
            {visibleAlerts.length === 0 && (
              <div className="db-empty-alerts">
                <CheckCircle2 size={28} color="#16A34A"/>
                <span>Toutes les alertes traitées</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 3 — TIMELINE
      ══════════════════════════════════════════════════ */}
      <div className="db-card db-timeline-card">
        <div className="db-timeline-embed">
          <PlanningCalendar/>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ROW 4 — Revenue | Arrivals/Departures | Automation
      ══════════════════════════════════════════════════ */}
      <div className="db-bottom-row">

        {/* ─── REVENUE 7 JOURS ─── */}
        <div className="db-card db-revenue-card">
          <div className="db-card-header">
            <div className="db-card-title">
              <BarChart3 size={16} color="#7C3AED"/>
              <span>Revenus — 7 derniers jours</span>
            </div>
            <button className="db-card-action" onClick={() => nav('revenue')}>
              Détails <ChevronRight size={14}/>
            </button>
          </div>
          <div className="db-card-body">
            <div className="db-revenue-total">
              <span className="db-revenue-sum">11 835 €</span>
              <span className="db-revenue-trend trend-up"><TrendingUp size={13}/> +11% vs semaine dernière</span>
            </div>
            <div className="db-bar-chart">
              {REVENUE_DAYS.map((d, i) => (
                <div className="db-bar-col" key={i}>
                  <div className="db-bar-tooltip">{d.amount.toLocaleString('fr-FR')}€<br/>{d.occ}% occ.</div>
                  <div
                    className={`db-bar ${i === REVENUE_DAYS.length - 1 ? 'today' : ''}`}
                    style={{ height: `${(d.amount / maxRevenue) * 100}%` }}
                  />
                  <span className="db-bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── ARRIVÉES / DÉPARTS ─── */}
        <div className="db-card db-guestflow-card">
          <div className="db-card-header">
            <div className="db-card-title">
              <Users size={16} color="#2563EB"/>
              <span>Flux Clients Aujourd'hui</span>
            </div>
            <div className="db-tabs">
              <button className={tab === 'arrivals'   ? 'active' : ''} onClick={() => setTab('arrivals')}>
                Arrivées ({ARRIVALS.length})
              </button>
              <button className={tab === 'departures' ? 'active' : ''} onClick={() => setTab('departures')}>
                Départs ({DEPARTURES.length})
              </button>
            </div>
          </div>
          <div className="db-card-body">
            {(tab === 'arrivals' ? ARRIVALS : DEPARTURES).map((g, i) => (
              <div className="db-guest-row" key={i} onClick={() => nav('checkin-manager')} style={{ cursor: 'pointer' }}>
                <div className={`db-guest-status-bar status-${g.status}`}/>
                <div className="db-guest-avatar">
                  {g.name.split(',')[0][0]}{g.name.split(',')[1]?.trim()[0] || ''}
                </div>
                <div className="db-guest-info">
                  <span className="db-guest-name">
                    {g.name}
                    {g.vip && <span className="db-vip-tag">VIP</span>}
                  </span>
                  <span className="db-guest-meta">
                    Ch. {g.room} · {g.time} · {g.source || ''}
                    {g.nights && ` · ${g.nights} nuit${g.nights > 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className={`db-guest-badge badge-${g.status}`}>
                  {g.status === 'checked-in'  && <><UserCheck size={11}/> Arrivé</>}
                  {g.status === 'checked-out' && <><LogOut size={11}/> Parti</>}
                  {g.status === 'pending'     && <><Clock size={11}/> Attendu</>}
                  {g.status === 'late'        && <><AlertTriangle size={11}/> Retard</>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── AUTOMATISATIONS ─── */}
        <div className="db-card db-automation-card">
          <div className="db-card-header">
            <div className="db-card-title">
              <Zap size={16} color="#6366F1"/>
              <span>Automatisations Récentes</span>
            </div>
            <button className="db-card-action" onClick={() => nav('automation-hub')}>
              Gérer <ChevronRight size={14}/>
            </button>
          </div>
          <div className="db-card-body">
            {AUTOMATIONS.map((au, i) => (
              <div className="db-auto-row" key={i}>
                <div className="db-auto-icon" style={{ background: au.color + '18', color: au.color }}>
                  {au.icon}
                </div>
                <div className="db-auto-info">
                  <span className="db-auto-label">{au.label}</span>
                  <span className="db-auto-target">{au.target}</span>
                </div>
                <span className="db-auto-time">{au.time}</span>
              </div>
            ))}
            <div className="db-auto-footer">
              <Zap size={12} color="#6366F1"/>
              <span>24 actions automatisées aujourd'hui</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModularDashboard;
