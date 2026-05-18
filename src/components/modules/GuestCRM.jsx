import React, { useState, useMemo } from 'react';
import {
  Search, Filter, Phone, Mail, MessageCircle, MoreVertical,
  Star, TrendingUp, TrendingDown, Minus, Zap, Sparkles,
  Calendar, CreditCard, Tag, Plus, Send, History,
  ShieldCheck, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, User, Settings, Trash2, Share2, Lock,
  ArrowUpRight, Wallet, BarChart3, Users2, Heart,
  MapPin, Globe, Bed, LogIn, LogOut, Receipt, X,
  ClipboardList, MessageSquare, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GuestCRM.css';

/* ─── Data ──────────────────────────────────────────────── */
const GUESTS = [
  {
    id: 1, initials: 'AM', name: 'Alice Mertens', email: 'alice.m@example.com',
    phone: '+33 6 12 34 56 78', nationality: '🇫🇷 France',
    tier: 'Gold', status: 'Loyal', sentiment: 'positive', score: 92,
    totalSpent: '4 250 €', visits: 8, lastStay: 'Il y a 2 jours',
    nextStay: '12 Juin 2026', room: '204 – Suite Supérieure',
    wallet: '150,00 €', points: 1250, probability: 92,
    tags: ['VIP', 'Spa', 'Business'],
    churn: 'low', nps: 9,
    timeline: [
      { date: 'Auj.', icon: 'review', text: 'Avis 5★ laissé sur Google Maps' },
      { date: '15 Mars', icon: 'checkout', text: 'Check-out chambre 204. Paiement validé.' },
      { date: '10 Mars', icon: 'checkin', text: 'Check-in automatisé via app mobile.' },
      { date: '2 Fév.', icon: 'email', text: 'Email de bienvenue envoyé (ouverture 98%).' },
    ],
    bookings: [
      { id: 'RES-0812', dates: '10–15 Mars 2026', room: '204 – Suite', amount: '850 €', status: 'completed' },
      { id: 'RES-0744', dates: '12–14 Juin 2026', room: '301 – Junior Suite', amount: '480 €', status: 'upcoming' },
    ],
  },
  {
    id: 2, initials: 'MT', name: 'Mark Thompson', email: 'm.thompson@web.de',
    phone: '+49 176 9876 5432', nationality: '🇩🇪 Allemagne',
    tier: 'Bronze', status: 'Nouveau', sentiment: 'neutral', score: 55,
    totalSpent: '850 €', visits: 1, lastStay: 'Mois dernier',
    nextStay: '—', room: '102 – Chambre Standard',
    wallet: '0,00 €', points: 50, probability: 45,
    tags: ['Famille', 'Premier séjour'],
    churn: 'medium', nps: 7,
    timeline: [
      { date: '10 Avr.', icon: 'checkout', text: 'Check-out chambre 102.' },
      { date: '7 Avr.', icon: 'checkin', text: 'Check-in (arrivée tardive 23h).' },
    ],
    bookings: [
      { id: 'RES-0780', dates: '7–10 Avr. 2026', room: '102 – Standard', amount: '850 €', status: 'completed' },
    ],
  },
  {
    id: 3, initials: 'ER', name: 'Elena Rodriguez', email: 'elena.rod@icloud.com',
    phone: '+34 600 112 233', nationality: '🇪🇸 Espagne',
    tier: 'Silver', status: 'À risque', sentiment: 'negative', score: 28,
    totalSpent: '1 120 €', visits: 3, lastStay: 'Aujourd\'hui',
    nextStay: '—', room: '408 – Chambre Deluxe',
    wallet: '45,50 €', points: 320, probability: 12,
    tags: ['Fréquente', 'Late check-out'],
    churn: 'high', nps: 4,
    timeline: [
      { date: 'Auj.', icon: 'alert', text: 'Plainte room-service reçue. Action requise.' },
      { date: 'Auj.', icon: 'checkin', text: 'Check-in chambre 408.' },
      { date: '2 Fév.', icon: 'checkout', text: 'Check-out — note interne : mécontente du ménage.' },
    ],
    bookings: [
      { id: 'RES-0901', dates: 'Auj. – 20 Mai 2026', room: '408 – Deluxe', amount: '360 €', status: 'inhouse' },
      { id: 'RES-0820', dates: '1–5 Fév. 2026', room: '211 – Standard', amount: '420 €', status: 'completed' },
    ],
  },
  {
    id: 4, initials: 'JD', name: 'Jean-Pierre Dubois', email: 'jp.dubois@corporation.fr',
    phone: '+33 7 44 55 66 77', nationality: '🇫🇷 France',
    tier: 'Platinum', status: 'Loyal', sentiment: 'positive', score: 95,
    totalSpent: '12 800 €', visits: 15, lastStay: 'Il y a 1 semaine',
    nextStay: '3 Juil. 2026', room: '501 – Suite Présidentielle',
    wallet: '1 200,00 €', points: 8500, probability: 95,
    tags: ['Corporate', 'High LTV', 'Ambassadeur'],
    churn: 'low', nps: 10,
    timeline: [
      { date: '10 Mai', icon: 'checkout', text: 'Check-out Suite 501. Avis 10/10 NPS.' },
      { date: '5 Mai', icon: 'checkin', text: 'Check-in — sur-classement offert automatiquement.' },
      { date: '1 Avr.', icon: 'email', text: 'Invitation cercle Ambassadeurs envoyée.' },
    ],
    bookings: [
      { id: 'RES-0933', dates: '3–8 Juil. 2026', room: '501 – Présidentielle', amount: '2 400 €', status: 'upcoming' },
      { id: 'RES-0900', dates: '5–10 Mai 2026', room: '501 – Présidentielle', amount: '2 400 €', status: 'completed' },
    ],
  },
];

const KPI = [
  { label: 'Satisfaction', value: '8.4', unit: '/10', trend: '+0.3', up: true, color: '#10B981' },
  { label: 'Rétention', value: '62', unit: '%', trend: '+4%', up: true, color: '#3B82F6' },
  { label: 'NPS Moyen', value: '7.5', unit: '/10', trend: '-0.2', up: false, color: '#F59E0B' },
  { label: 'Revenu / Séjour', value: '890', unit: ' €', trend: '+12%', up: true, color: '#8B5CF6' },
];

const STATUS_FILTERS = ['Tous', 'Loyal', 'Nouveau', 'À risque'];

const TIER_COLORS = {
  Platinum: { bg: '#1E293B', text: '#fff', accent: '#94A3B8' },
  Gold:     { bg: '#D97706', text: '#fff', accent: '#FDE68A' },
  Silver:   { bg: '#64748B', text: '#fff', accent: '#CBD5E1' },
  Bronze:   { bg: '#92400E', text: '#fff', accent: '#D6D3D1' },
};

const SENTIMENT_CONFIG = {
  positive: { label: 'Positif',  color: '#10B981', bg: '#ECFDF5', icon: '↑' },
  neutral:  { label: 'Neutre',   color: '#F59E0B', bg: '#FFFBEB', icon: '→' },
  negative: { label: 'Négatif',  color: '#EF4444', bg: '#FEF2F2', icon: '↓' },
};

const CHURN_CONFIG = {
  low:    { label: 'Faible',  color: '#10B981', bg: '#ECFDF5' },
  medium: { label: 'Modéré',  color: '#F59E0B', bg: '#FFFBEB' },
  high:   { label: 'Élevé',   color: '#EF4444', bg: '#FEF2F2' },
};

const STATUS_CONFIG = {
  upcoming:  { label: 'À venir',     color: '#3B82F6', bg: '#EFF6FF' },
  inhouse:   { label: 'En cours',    color: '#10B981', bg: '#ECFDF5' },
  completed: { label: 'Terminé',     color: '#94A3B8', bg: '#F1F5F9' },
};

/* ─── Score ring ─────────────────────────────────────────── */
const ScoreRing = ({ score, size = 64, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} className="crm2-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={fill}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="800">{score}</text>
    </svg>
  );
};

/* ─── Timeline icon ──────────────────────────────────────── */
const TLIcon = ({ type }) => {
  const map = {
    review:   { icon: <Star size={10}/>,        bg: '#FEF3C7', color: '#D97706' },
    checkout: { icon: <LogOut size={10}/>,      bg: '#F0FDF4', color: '#16A34A' },
    checkin:  { icon: <LogIn size={10}/>,       bg: '#EFF6FF', color: '#2563EB' },
    email:    { icon: <Mail size={10}/>,        bg: '#F5F3FF', color: '#7C3AED' },
    alert:    { icon: <AlertTriangle size={10}/>, bg: '#FEF2F2', color: '#DC2626' },
  };
  const cfg = map[type] || map.email;
  return (
    <div className="crm2-tl-icon" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */
const GuestCRM = () => {
  const [selected,      setSelected]      = useState(null);
  const [tab,           setTab]           = useState('overview');
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('Tous');
  const [draft,         setDraft]         = useState('');
  const [drafting,      setDrafting]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);

  const filtered = useMemo(() => GUESTS.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
                        g.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || g.status === filterStatus;
    return matchSearch && matchStatus;
  }), [search, filterStatus]);

  const handleSelect = (g) => { setSelected(g); setTab('overview'); setDraft(''); setMenuOpen(false); };

  const generateDraft = () => {
    if (!selected) return;
    setDrafting(true);
    setDraft('');
    setTimeout(() => {
      setDraft(`Bonjour ${selected.name.split(' ')[0]},\n\nEn tant que membre ${selected.tier}, nous souhaitons vous remercier pour votre fidélité au cours de vos ${selected.visits} séjour${selected.visits > 1 ? 's' : ''} avec nous.\n\nNous sommes heureux de vous proposer une offre exclusive réservée à nos membres ${selected.tier} : accès prioritaire à nos suites premium lors de votre prochain séjour.\n\nNous espérons vous accueillir très prochainement.\n\nCordialement,\nL'équipe Hova`);
      setDrafting(false);
    }, 1600);
  };

  const tc = selected ? TIER_COLORS[selected.tier] : null;

  return (
    <div className="crm2-root">

      {/* ── TOP BAR ── */}
      <header className="crm2-topbar">
        <div className="crm2-topbar-left">
          <div className="crm2-topbar-icon"><Users2 size={18}/></div>
          <div>
            <div className="crm2-topbar-title">Intelligence Client</div>
            <div className="crm2-topbar-sub">Analyse comportementale · Fidélisation · Upsell IA</div>
          </div>
        </div>
        <div className="crm2-kpi-row">
          {KPI.map(k => (
            <div key={k.label} className="crm2-kpi">
              <div className="crm2-kpi-val" style={{ color: k.color }}>
                {k.value}<span className="crm2-kpi-unit">{k.unit}</span>
              </div>
              <div className="crm2-kpi-label">{k.label}</div>
              <div className={`crm2-kpi-trend ${k.up ? 'up' : 'down'}`}>
                {k.up ? <TrendingUp size={10}/> : <TrendingDown size={10}/>} {k.trend}
              </div>
            </div>
          ))}
        </div>
        <button className="crm2-campaign-btn">
          <Zap size={14}/> Campagne IA
        </button>
      </header>

      {/* ── BODY ── */}
      <div className="crm2-body">

        {/* ── LEFT PANEL ── */}
        <aside className="crm2-left">
          <div className="crm2-search-wrap">
            <div className="crm2-search">
              <Search size={14}/>
              <input placeholder="Rechercher un client…" value={search}
                onChange={e => setSearch(e.target.value)}/>
              {search && <button onClick={() => setSearch('')}><X size={12}/></button>}
            </div>
            <button className="crm2-filter-btn"><Filter size={14}/></button>
          </div>

          <div className="crm2-status-tabs">
            {STATUS_FILTERS.map(s => (
              <button key={s}
                className={`crm2-status-tab ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>

          <div className="crm2-list">
            {filtered.map(g => {
              const sc = SENTIMENT_CONFIG[g.sentiment];
              const isActive = selected?.id === g.id;
              return (
                <motion.div key={g.id}
                  className={`crm2-guest-row ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(g)}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.12 }}
                >
                  <div className={`crm2-avatar tier-${g.tier.toLowerCase()}`}>{g.initials}</div>
                  <div className="crm2-row-info">
                    <div className="crm2-row-top">
                      <span className="crm2-row-name">{g.name}</span>
                      <span className="crm2-row-score" style={{ color: sc.color, background: sc.bg }}>
                        {sc.icon} {g.score}
                      </span>
                    </div>
                    <div className="crm2-row-sub">
                      <span>{g.email}</span>
                    </div>
                    <div className="crm2-row-meta">
                      <span className="crm2-row-tier"
                        style={{ background: tc && isActive ? tc.bg : TIER_COLORS[g.tier].bg,
                                 color: TIER_COLORS[g.tier].text }}>
                        {g.tier}
                      </span>
                      <span className="crm2-row-visits"><Bed size={11}/> {g.visits} séj.</span>
                      <span className="crm2-row-spent">{g.totalSpent}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="crm2-row-arrow"/>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="crm2-empty-list">
                <User size={28}/>
                <p>Aucun client trouvé</p>
              </div>
            )}
          </div>

          <div className="crm2-left-footer">
            <button className="crm2-add-btn"><Plus size={14}/> Ajouter un client</button>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="crm2-right">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} className="crm2-detail"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Profile hero */}
                <div className="crm2-hero"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS[selected.tier].bg}22 0%, #F8FAFC 100%)` }}>
                  <div className="crm2-hero-left">
                    <div className={`crm2-hero-avatar tier-${selected.tier.toLowerCase()}`}>
                      {selected.initials}
                      <div className={`crm2-hero-sentiment ${selected.sentiment}`}/>
                    </div>
                    <div className="crm2-hero-info">
                      <div className="crm2-hero-name">{selected.name}</div>
                      <div className="crm2-hero-badges">
                        <span className="crm2-badge-tier"
                          style={{ background: TIER_COLORS[selected.tier].bg, color: TIER_COLORS[selected.tier].text }}>
                          <ShieldCheck size={11}/> {selected.tier}
                        </span>
                        <span className={`crm2-badge-status ${selected.status === 'À risque' ? 'risk' : selected.status === 'Loyal' ? 'loyal' : 'new'}`}>
                          {selected.status}
                        </span>
                        <span className="crm2-badge-id">#{`G-${selected.id}092`}</span>
                      </div>
                      <div className="crm2-hero-contact">
                        <span><Phone size={11}/>{selected.phone}</span>
                        <span><Mail size={11}/>{selected.email}</span>
                        <span><Globe size={11}/>{selected.nationality}</span>
                      </div>
                    </div>
                  </div>

                  <div className="crm2-hero-right">
                    <div className="crm2-quick-stats">
                      <div className="crm2-qs">
                        <div className="crm2-qs-val">{selected.totalSpent}</div>
                        <div className="crm2-qs-label">CA Total</div>
                      </div>
                      <div className="crm2-qs-div"/>
                      <div className="crm2-qs">
                        <div className="crm2-qs-val">{selected.visits}</div>
                        <div className="crm2-qs-label">Séjours</div>
                      </div>
                      <div className="crm2-qs-div"/>
                      <div className="crm2-qs">
                        <div className="crm2-qs-val">{selected.points.toLocaleString()}</div>
                        <div className="crm2-qs-label">Points</div>
                      </div>
                      <div className="crm2-qs-div"/>
                      <div className="crm2-qs">
                        <div className="crm2-qs-val">{selected.nps}/10</div>
                        <div className="crm2-qs-label">NPS</div>
                      </div>
                    </div>

                    <div className="crm2-hero-actions">
                      <button className="crm2-action-btn" title="Appeler"><Phone size={15}/></button>
                      <button className="crm2-action-btn" title="Email"><Mail size={15}/></button>
                      <button className="crm2-action-btn" title="WhatsApp"><MessageCircle size={15}/></button>
                      <button className="crm2-action-btn" title="Tâche"><ClipboardList size={15}/></button>
                      <div className="crm2-menu-wrap">
                        <button className="crm2-action-btn" onClick={() => setMenuOpen(m => !m)}>
                          <MoreVertical size={15}/>
                        </button>
                        <AnimatePresence>
                          {menuOpen && (
                            <motion.div className="crm2-menu"
                              initial={{ opacity: 0, y: 6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.96 }}>
                              <button className="crm2-menu-item"><User size={13}/> Modifier profil</button>
                              <button className="crm2-menu-item"><Share2 size={13}/> Partager fiche</button>
                              <button className="crm2-menu-item"><Settings size={13}/> Paramètres</button>
                              <div className="crm2-menu-sep"/>
                              <button className="crm2-menu-item danger"><Lock size={13}/> Bloquer</button>
                              <button className="crm2-menu-item danger"><Trash2 size={13}/> Supprimer</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="crm2-tags-bar">
                  {selected.tags.map(t => (
                    <span key={t} className="crm2-tag"><Tag size={10}/> {t}</span>
                  ))}
                  <button className="crm2-tag-add"><Plus size={10}/></button>
                  <span className="crm2-tags-sep"/>
                  <span className="crm2-next-stay">
                    <Calendar size={11}/> Prochain séjour : <strong>{selected.nextStay}</strong>
                  </span>
                  {selected.room && (
                    <span className="crm2-room-tag">
                      <Bed size={11}/> {selected.room}
                    </span>
                  )}
                </div>

                {/* Tabs */}
                <nav className="crm2-tabs">
                  {[
                    { id: 'overview',  label: 'Vue générale',    icon: <Activity size={13}/> },
                    { id: 'bookings',  label: 'Réservations',    icon: <Calendar size={13}/> },
                    { id: 'comms',     label: 'Communication',   icon: <MessageSquare size={13}/> },
                    { id: 'history',   label: 'Historique',      icon: <History size={13}/> },
                  ].map(t => (
                    <button key={t.id}
                      className={`crm2-tab ${tab === t.id ? 'active' : ''}`}
                      onClick={() => setTab(t.id)}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </nav>

                {/* Tab content */}
                <div className="crm2-tab-content">
                  <AnimatePresence mode="wait">

                    {/* ── Overview tab ── */}
                    {tab === 'overview' && (
                      <motion.div key="overview" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-overview-grid">

                          {/* Score & Prédictions */}
                          <div className="crm2-card">
                            <div className="crm2-card-title">
                              <Sparkles size={14}/> Prédictions Oracle IA
                            </div>
                            <div className="crm2-pred-row">
                              <div className="crm2-pred-score">
                                <ScoreRing score={selected.score}/>
                                <div className="crm2-pred-score-label">Score client</div>
                              </div>
                              <div className="crm2-pred-details">
                                <div className="crm2-pred-item">
                                  <div className="crm2-pred-item-top">
                                    <span>Probabilité de retour</span>
                                    <strong style={{ color: selected.probability > 60 ? '#10B981' : '#EF4444' }}>
                                      {selected.probability}%
                                    </strong>
                                  </div>
                                  <div className="crm2-bar">
                                    <div className="crm2-bar-fill"
                                      style={{ width: `${selected.probability}%`,
                                        background: selected.probability > 60 ? '#10B981' : '#EF4444' }}/>
                                  </div>
                                </div>
                                <div className="crm2-pred-item">
                                  <div className="crm2-pred-item-top">
                                    <span>Risque de churn</span>
                                    <span className="crm2-churn-badge"
                                      style={{ background: CHURN_CONFIG[selected.churn].bg,
                                               color: CHURN_CONFIG[selected.churn].color }}>
                                      {CHURN_CONFIG[selected.churn].label}
                                    </span>
                                  </div>
                                </div>
                                <div className="crm2-rec-box">
                                  <Zap size={12}/>
                                  <p>{selected.sentiment === 'negative'
                                    ? 'Envoyer un geste commercial immédiatement. Plainte room-service détectée.'
                                    : selected.tier === 'Platinum' || selected.tier === 'Gold'
                                      ? `Proposer un sur-classement pour le prochain séjour. Potentiel upsell élevé.`
                                      : 'Envoyer une invitation programme fidélité pour convertir en client régulier.'
                                  }</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Wallet & Fidélité */}
                          <div className="crm2-card">
                            <div className="crm2-card-title">
                              <Wallet size={14}/> Portefeuille & Fidélité
                            </div>
                            <div className="crm2-wallet-grid">
                              <div className="crm2-wallet-item">
                                <div className="crm2-wi-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                                  <CreditCard size={16}/>
                                </div>
                                <div>
                                  <div className="crm2-wi-val">{selected.wallet}</div>
                                  <div className="crm2-wi-label">Solde portefeuille</div>
                                </div>
                              </div>
                              <div className="crm2-wallet-item">
                                <div className="crm2-wi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                                  <Star size={16}/>
                                </div>
                                <div>
                                  <div className="crm2-wi-val">{selected.points.toLocaleString()} pts</div>
                                  <div className="crm2-wi-label">Points fidélité</div>
                                </div>
                              </div>
                            </div>
                            <div className="crm2-tier-progress">
                              <div className="crm2-tp-label">
                                <span>Progression tier</span>
                                <span className="crm2-tp-tier">{selected.tier}</span>
                              </div>
                              <div className="crm2-bar">
                                <div className="crm2-bar-fill"
                                  style={{ width: `${selected.tier === 'Platinum' ? 100 : selected.tier === 'Gold' ? 75 : selected.tier === 'Silver' ? 50 : 25}%`,
                                    background: TIER_COLORS[selected.tier].bg }}/>
                              </div>
                            </div>
                          </div>

                          {/* Upsell */}
                          <div className="crm2-card full-width">
                            <div className="crm2-card-title">
                              <TrendingUp size={14}/> Opportunités d'upsell
                            </div>
                            <div className="crm2-upsell-list">
                              {[
                                { title: 'Spa & Bien-être', desc: 'Fréquence élevée détectée. Proposer abonnement mensuel.', gain: '+120 €', hot: true },
                                { title: 'Early Check-in', desc: 'Arrive souvent le matin. Automatiser proposition.', gain: '+25 €', hot: false },
                                { title: 'Suite upgrade', desc: selected.tier !== 'Platinum' ? 'Upgrade disponible pour son prochain séjour.' : 'Déjà en suite présidentielle.', gain: '+200 €', hot: selected.tier !== 'Platinum' },
                              ].map((u, i) => (
                                <div key={i} className={`crm2-upsell-item ${u.hot ? 'hot' : ''}`}>
                                  <div className="crm2-upsell-info">
                                    {u.hot && <span className="crm2-hot-badge">HOT</span>}
                                    <strong>{u.title}</strong>
                                    <p>{u.desc}</p>
                                  </div>
                                  <div className="crm2-upsell-right">
                                    <span className="crm2-upsell-gain">{u.gain}</span>
                                    <button className="crm2-upsell-btn">Activer</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── Bookings tab ── */}
                    {tab === 'bookings' && (
                      <motion.div key="bookings" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-bookings-list">
                          {selected.bookings.map(b => {
                            const sc = STATUS_CONFIG[b.status];
                            return (
                              <div key={b.id} className="crm2-booking-card">
                                <div className="crm2-bk-left">
                                  <div className="crm2-bk-id">{b.id}</div>
                                  <div className="crm2-bk-room"><Bed size={12}/> {b.room}</div>
                                  <div className="crm2-bk-dates"><Calendar size={12}/> {b.dates}</div>
                                </div>
                                <div className="crm2-bk-right">
                                  <div className="crm2-bk-amount">{b.amount}</div>
                                  <span className="crm2-bk-status"
                                    style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ── Comms tab ── */}
                    {tab === 'comms' && (
                      <motion.div key="comms" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-card">
                          <div className="crm2-card-title">
                            <Sparkles size={14}/> Oracle Smart-Reply
                            <button className="crm2-gen-btn" onClick={generateDraft} disabled={drafting}>
                              {drafting ? 'Génération…' : <><Zap size={12}/> Générer avec IA</>}
                            </button>
                          </div>
                          <div className="crm2-composer">
                            {drafting ? (
                              <div className="crm2-drafting">
                                <div className="crm2-drafting-dot"/>
                                <span>Oracle analyse les préférences de {selected.name.split(' ')[0]}…</span>
                              </div>
                            ) : draft ? (
                              <>
                                <textarea className="crm2-textarea" value={draft}
                                  onChange={e => setDraft(e.target.value)} rows={9}/>
                                <div className="crm2-composer-actions">
                                  <button className="crm2-btn-ghost">Brouillon</button>
                                  <button className="crm2-btn-primary"><Send size={13}/> Envoyer</button>
                                </div>
                              </>
                            ) : (
                              <div className="crm2-composer-empty">
                                <MessageCircle size={36}/>
                                <p>Cliquez sur <strong>Générer avec IA</strong> pour rédiger un message personnalisé basé sur l'historique de {selected.name.split(' ')[0]}.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── History tab ── */}
                    {tab === 'history' && (
                      <motion.div key="history" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-card">
                          <div className="crm2-card-title"><History size={14}/> Activité récente</div>
                          <div className="crm2-timeline">
                            {selected.timeline.map((ev, i) => (
                              <div key={i} className="crm2-tl-item">
                                <TLIcon type={ev.icon}/>
                                <div className="crm2-tl-line"/>
                                <div className="crm2-tl-body">
                                  <span className="crm2-tl-date">{ev.date}</span>
                                  <p>{ev.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" className="crm2-empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="crm2-empty-icon"><Users2 size={40}/></div>
                <h3>Sélectionnez un profil client</h3>
                <p>Accédez aux insights Oracle AI, à l'historique complet et aux outils d'engagement personnalisé.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default GuestCRM;
