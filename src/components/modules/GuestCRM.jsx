import React, { useState, useMemo, useCallback } from 'react';
import EmptyState from '../common/EmptyState';
import {
  Search, Filter, Phone, Mail, MessageCircle, MoreVertical,
  Star, TrendingUp, TrendingDown, Zap, Sparkles,
  Calendar, CreditCard, Tag, Plus, Send, History,
  ShieldCheck, AlertTriangle, ChevronRight, User,
  Settings, Trash2, Share2, Lock, Wallet, Users2,
  MapPin, Globe, Bed, LogIn, LogOut, Receipt, X,
  ClipboardList, MessageSquare, Activity, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  deriveGuestsFromReservations,
  SOURCE_CFG,
} from '../../lib/reservationStore';
import { useAppStore } from '../../store/appStore';
import './GuestCRM.css';

/* ─── KPI header (static, could be derived) ──────────────── */
const computeKPI = (guests) => {
  if (!guests.length) return [
    { label: 'Satisfaction', value: '—', unit: '/10', trend: '—', up: true, color: '#10B981' },
    { label: 'Rétention', value: '—', unit: '%', trend: '—', up: true, color: '#3B82F6' },
    { label: 'NPS Moyen', value: '—', unit: '/10', trend: '—', up: true, color: '#F59E0B' },
    { label: 'Revenu / Client', value: '—', unit: ' €', trend: '—', up: true, color: '#8B5CF6' },
  ];
  const avgScore = Math.round(guests.reduce((s, g) => s + g.score, 0) / guests.length);
  const loyal = guests.filter(g => g.status === 'Loyal' || g.visits >= 2).length;
  const retentionPct = Math.round((loyal / guests.length) * 100);
  const avgNps = (guests.reduce((s, g) => s + g.nps, 0) / guests.length).toFixed(1);
  const totalRevRaw = guests.reduce((s, g) => {
    const n = parseFloat(g.totalSpent.replace(/[^\d.]/g, ''));
    return s + (isNaN(n) ? 0 : n);
  }, 0);
  const avgRev = guests.length ? Math.round(totalRevRaw / guests.length) : 0;
  return [
    { label: 'Score Moyen', value: String(avgScore), unit: '/100', trend: '+2', up: true, color: '#10B981' },
    { label: 'Rétention', value: String(retentionPct), unit: '%', trend: '+4%', up: true, color: '#3B82F6' },
    { label: 'NPS Moyen', value: avgNps, unit: '/10', trend: '+0.3', up: true, color: '#F59E0B' },
    { label: 'Rev. / Client', value: avgRev.toLocaleString('fr-FR'), unit: ' €', trend: '+8%', up: true, color: '#8B5CF6' },
  ];
};

/* ─── Config ──────────────────────────────────────────────── */
const TIER_COLORS = {
  Platinum: { bg: '#1E293B', text: '#fff' },
  Gold:     { bg: '#D97706', text: '#fff' },
  Silver:   { bg: '#64748B', text: '#fff' },
  Bronze:   { bg: '#92400E', text: '#fff' },
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

const BOOKING_STATUS = {
  upcoming:  { label: 'À venir',  color: '#3B82F6', bg: '#EFF6FF' },
  inhouse:   { label: 'En cours', color: '#10B981', bg: '#ECFDF5' },
  completed: { label: 'Terminé',  color: '#94A3B8', bg: '#F1F5F9' },
};

const STATUS_FILTERS = ['Tous', 'Loyal', 'Présent', 'À venir', 'Nouveau'];

/* ─── Score ring ──────────────────────────────────────────── */
const ScoreRing = ({ score, size = 64, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (1 - score / 100);
  const color = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} className="crm2-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.22} fontWeight="800">{score}</text>
    </svg>
  );
};

/* ─── Timeline icon ──────────────────────────────────────── */
const TLIcon = ({ type }) => {
  const map = {
    review:   { icon: <Star size={10}/>,          bg: '#FEF3C7', color: '#D97706' },
    checkout: { icon: <LogOut size={10}/>,        bg: '#F0FDF4', color: '#16A34A' },
    checkin:  { icon: <LogIn size={10}/>,         bg: '#EFF6FF', color: '#2563EB' },
    email:    { icon: <Mail size={10}/>,          bg: '#F5F3FF', color: '#7C3AED' },
    alert:    { icon: <AlertTriangle size={10}/>, bg: '#FEF2F2', color: '#DC2626' },
  };
  const cfg = map[type] || map.email;
  return <div className="crm2-tl-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>;
};

/* ─── Source badge ──────────────────────────────────────── */
const SourceBadge = ({ source, size = 'sm' }) => {
  const cfg = SOURCE_CFG[source] || { bg: '#64748B', text: '#fff', abbr: '?', flag: '?' };
  return (
    <span className="crm2-source-badge" style={{ background: cfg.bg, color: cfg.text }}>
      {size === 'sm' ? cfg.abbr : <>{cfg.flag} {source}</>}
    </span>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const GuestCRM = () => {
  // Read directly from the centralized store — reactive to realtime updates
  const reservations = useAppStore(s => s.reservations);

  const [selected,     setSelected]     = useState(null);
  const [tab,          setTab]          = useState('overview');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [filterSource, setFilterSource] = useState('all');
  const [draft,        setDraft]        = useState('');
  const [drafting,     setDrafting]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [refreshing,   setRefreshing]   = useState(false);

  /* ── Derive guests from reservations ────────────────────── */
  const allGuests = useMemo(
    () => deriveGuestsFromReservations(reservations),
    [reservations]
  );

  const kpis = useMemo(() => computeKPI(allGuests), [allGuests]);

  /* ── All sources present in data ────────────────────────── */
  const availableSources = useMemo(() => {
    const s = new Set(reservations.map(r => r.source).filter(Boolean));
    return ['all', ...Array.from(s)];
  }, [reservations]);

  /* ── Filtered list ──────────────────────────────────────── */
  const filtered = useMemo(() => allGuests.filter(g => {
    const matchSearch = !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Tous' || g.status === filterStatus;
    const matchSource = filterSource === 'all' || g.sources?.includes(filterSource);
    return matchSearch && matchStatus && matchSource;
  }), [allGuests, search, filterStatus, filterSource]);

  const handleSelect = useCallback((g) => {
    setSelected(g);
    setTab('overview');
    setDraft('');
    setMenuOpen(false);
  }, []);

  /* ── Refresh manually — store is already kept live by realtime ─ */
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  /* ── Generate draft ─────────────────────────────────────── */
  const generateDraft = () => {
    if (!selected) return;
    setDrafting(true);
    setDraft('');
    setTimeout(() => {
      const firstName = selected.name.split(' ')[0];
      const sourceList = selected.sources?.join(', ') || 'nos canaux';
      setDraft(
        `Bonjour ${firstName},\n\n` +
        `En tant que membre ${selected.tier} avec ${selected.visits} séjour${selected.visits > 1 ? 's' : ''} confirmé${selected.visits > 1 ? 's' : ''} chez nous` +
        (sourceList !== 'nos canaux' ? ` (via ${sourceList})` : '') + `,\n` +
        `nous souhaitons vous remercier pour votre fidélité.\n\n` +
        (selected.sentiment === 'negative'
          ? `Nous avons noté quelques points d'amélioration lors de votre dernier séjour et souhaitons vous offrir un geste commercial exclusif : une nuit offerte sur votre prochaine réservation directe.\n\n`
          : `Nous serions heureux de vous accueillir à nouveau et vous proposons un accès prioritaire à nos meilleures disponibilités, avec un sur-classement offert sous réserve de disponibilité.\n\n`) +
        `N'hésitez pas à réserver directement pour bénéficier de ce privilège.\n\n` +
        `Cordialement,\nL'équipe Hova`
      );
      setDrafting(false);
    }, 1600);
  };

  const tc = selected ? TIER_COLORS[selected.tier] : null;

  return (
    <div className="crm2-root">

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="crm2-topbar">
        <div className="crm2-topbar-left">
          <div className="crm2-topbar-icon"><Users2 size={18}/></div>
          <div>
            <div className="crm2-topbar-title">Intelligence Client</div>
            <div className="crm2-topbar-sub">
              {allGuests.length} client{allGuests.length > 1 ? 's' : ''} · {reservations.length} réservations · Booking.com · Airbnb · Expedia · Direct
            </div>
          </div>
        </div>

        <div className="crm2-kpi-row">
          {kpis.map(k => (
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

        <div className="crm2-topbar-actions">
          <button className={`crm2-refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh} title="Synchroniser">
            <RefreshCw size={14}/>
          </button>
          <button className="crm2-campaign-btn">
            <Zap size={14}/> Campagne IA
          </button>
        </div>
      </header>

      {/* ── SOURCE CHANNEL FILTER BAR ───────────────────────── */}
      <div className="crm2-channel-bar">
        <span className="crm2-channel-label">Canal :</span>
        {availableSources.map(src => (
          <button key={src}
            className={`crm2-channel-btn ${filterSource === src ? 'active' : ''}`}
            onClick={() => setFilterSource(src)}
            style={filterSource === src && src !== 'all'
              ? { background: SOURCE_CFG[src]?.bg, color: SOURCE_CFG[src]?.text }
              : {}}>
            {src === 'all' ? 'Tous les canaux' : <>{SOURCE_CFG[src]?.flag} {src}</>}
          </button>
        ))}
      </div>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div className="crm2-body">

        {/* ── LEFT PANEL ──────────────────────────────────────── */}
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
                  transition={{ duration: 0.12 }}>
                  <div className={`crm2-avatar tier-${g.tier.toLowerCase()}`}>{g.initials}</div>
                  <div className="crm2-row-info">
                    <div className="crm2-row-top">
                      <span className="crm2-row-name">{g.name}</span>
                      <span className="crm2-row-score" style={{ color: sc.color, background: sc.bg }}>
                        {sc.icon} {g.score}
                      </span>
                    </div>
                    <div className="crm2-row-sub">{g.email || g._raw?.guest}</div>
                    <div className="crm2-row-meta">
                      <span className="crm2-row-tier"
                        style={{ background: TIER_COLORS[g.tier].bg, color: TIER_COLORS[g.tier].text }}>
                        {g.tier}
                      </span>
                      <span className="crm2-row-visits"><Bed size={11}/> {g.visits} séj.</span>
                      <span className="crm2-row-spent">{g.totalSpent}</span>
                    </div>
                    {/* Source badges mini */}
                    <div className="crm2-row-sources">
                      {g.sources?.slice(0, 3).map(src => (
                        <SourceBadge key={src} source={src} size="sm"/>
                      ))}
                    </div>
                  </div>
                  <ChevronRight size={14} className="crm2-row-arrow"/>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <EmptyState
                icon="👤"
                title={search ? `Aucun client pour "${search}"` : 'Aucun client'}
                description={search ? 'Essayez un autre terme de recherche.' : 'Les clients apparaissent ici dès que des réservations sont importées.'}
              />
            )}
          </div>

          <div className="crm2-left-footer">
            <div className="crm2-left-footer-count">
              {filtered.length} / {allGuests.length} client{allGuests.length > 1 ? 's' : ''}
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <main className="crm2-right">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} className="crm2-detail"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Profile hero */}
                <div className="crm2-hero"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS[selected.tier].bg}18 0%, #F8FAFC 100%)` }}>
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
                        <span className={`crm2-badge-status ${
                          selected.status === 'À risque' ? 'risk' :
                          selected.status === 'Loyal' || selected.status === 'Présent' ? 'loyal' : 'new'}`}>
                          {selected.status === 'Présent' ? '🟢 En séjour' : selected.status}
                        </span>
                        <span className="crm2-badge-id">#{`G-${selected.id.slice(0,6).toUpperCase()}`}</span>
                      </div>
                      <div className="crm2-hero-contact">
                        {selected.phone && <span><Phone size={11}/>{selected.phone}</span>}
                        {selected.email && <span><Mail size={11}/>{selected.email}</span>}
                        <span><Globe size={11}/>{selected.nationality}</span>
                      </div>
                      {/* Source channels */}
                      <div className="crm2-hero-sources">
                        {selected.sources?.map(src => <SourceBadge key={src} source={src} size="lg"/>)}
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
                        <div className="crm2-qs-val">{selected.points.toLocaleString('fr-FR')}</div>
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

                {/* Tags + context */}
                <div className="crm2-tags-bar">
                  {selected.tags?.map(t => (
                    <span key={t} className="crm2-tag"><Tag size={10}/> {t}</span>
                  ))}
                  <button className="crm2-tag-add"><Plus size={10}/></button>
                  <span className="crm2-tags-sep"/>
                  <span className="crm2-next-stay">
                    <Calendar size={11}/> Prochain : <strong>{selected.nextStay}</strong>
                  </span>
                  {selected.room && selected.room !== '—' && (
                    <span className="crm2-room-tag"><Bed size={11}/> {selected.room}</span>
                  )}
                </div>

                {/* Tabs */}
                <nav className="crm2-tabs">
                  {[
                    { id: 'overview', label: 'Vue générale',   icon: <Activity size={13}/> },
                    { id: 'bookings', label: `Réservations (${selected.bookings?.length || 0})`, icon: <Calendar size={13}/> },
                    { id: 'comms',    label: 'Communication',  icon: <MessageSquare size={13}/> },
                    { id: 'history',  label: 'Historique',     icon: <History size={13}/> },
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

                    {/* ── Overview ── */}
                    {tab === 'overview' && (
                      <motion.div key="overview" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-overview-grid">

                          {/* Prédictions */}
                          <div className="crm2-card">
                            <div className="crm2-card-title"><Sparkles size={14}/> Prédictions Oracle IA</div>
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
                                    ? 'Envoyer un geste commercial immédiatement. Ce profil présente un risque de churn élevé.'
                                    : selected.visits >= 3
                                      ? `Proposer un sur-classement ou une offre fidélité pour le prochain séjour.`
                                      : 'Envoyer une invitation programme fidélité pour convertir ce nouveau client.'
                                  }</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Wallet & Fidélité */}
                          <div className="crm2-card">
                            <div className="crm2-card-title"><Wallet size={14}/> Valeur & Fidélité</div>
                            <div className="crm2-wallet-grid">
                              <div className="crm2-wallet-item">
                                <div className="crm2-wi-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                                  <Receipt size={16}/>
                                </div>
                                <div>
                                  <div className="crm2-wi-val">{selected.totalSpent}</div>
                                  <div className="crm2-wi-label">CA Total généré</div>
                                </div>
                              </div>
                              <div className="crm2-wallet-item">
                                <div className="crm2-wi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                                  <Star size={16}/>
                                </div>
                                <div>
                                  <div className="crm2-wi-val">{selected.points.toLocaleString('fr-FR')} pts</div>
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
                            <div className="crm2-channel-summary">
                              <span className="crm2-cs-label">Canaux utilisés :</span>
                              {selected.sources?.map(src => <SourceBadge key={src} source={src} size="lg"/>)}
                            </div>
                          </div>

                          {/* Upsell */}
                          <div className="crm2-card full-width">
                            <div className="crm2-card-title"><TrendingUp size={14}/> Opportunités d'upsell</div>
                            <div className="crm2-upsell-list">
                              {[
                                { title: 'Réservation directe', desc: selected.sources?.some(s => s !== 'Direct') ? `Client actif sur ${selected.sources?.filter(s => s !== 'Direct').join(', ')}. Proposer un code promo direct pour économiser la commission.` : 'Client déjà en direct. Proposer newsletter privilèges.', gain: '-15% commission', hot: selected.sources?.some(s => s !== 'Direct') },
                                { title: 'Spa & Bien-être', desc: 'Fréquence de séjour détectée. Proposer package spa pré-séjour.', gain: '+120 €', hot: selected.visits >= 2 },
                                { title: 'Suite upgrade', desc: selected.tier !== 'Platinum' ? 'Upgrade disponible pour son prochain séjour selon disponibilité.' : 'Déjà en suite présidentielle. Proposer services conciergerie.', gain: '+200 €', hot: selected.tier !== 'Platinum' && selected.visits >= 2 },
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

                    {/* ── Bookings ── */}
                    {tab === 'bookings' && (
                      <motion.div key="bookings" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        {selected.bookings?.length === 0 ? (
                          <div className="crm2-empty-list" style={{ padding: '40px' }}>
                            <Calendar size={28}/><p>Aucune réservation trouvée</p>
                          </div>
                        ) : (
                          <div className="crm2-bookings-list">
                            {selected.bookings?.map(b => {
                              const sc = BOOKING_STATUS[b.status];
                              const srcCfg = SOURCE_CFG[b.source] || {};
                              return (
                                <div key={b.id} className="crm2-booking-card">
                                  <div className="crm2-bk-left">
                                    <div className="crm2-bk-id-row">
                                      <span className="crm2-bk-id">{b.id}</span>
                                      <span className="crm2-source-badge"
                                        style={{ background: srcCfg.bg, color: srcCfg.text }}>
                                        {srcCfg.flag} {b.source}
                                      </span>
                                    </div>
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
                        )}
                      </motion.div>
                    )}

                    {/* ── Communications ── */}
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
                                <span>Oracle analyse l'historique de {selected.name.split(' ')[0]}…</span>
                              </div>
                            ) : draft ? (
                              <>
                                <textarea className="crm2-textarea" value={draft}
                                  onChange={e => setDraft(e.target.value)} rows={10}/>
                                <div className="crm2-composer-actions">
                                  <button className="crm2-btn-ghost">Brouillon</button>
                                  <button className="crm2-btn-primary"><Send size={13}/> Envoyer</button>
                                </div>
                              </>
                            ) : (
                              <div className="crm2-composer-empty">
                                <MessageCircle size={36}/>
                                <p>Cliquez sur <strong>Générer avec IA</strong> pour rédiger un message personnalisé basé sur {selected.visits} réservation{selected.visits > 1 ? 's' : ''} et les canaux : {selected.sources?.join(', ')}.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── History ── */}
                    {tab === 'history' && (
                      <motion.div key="history" className="crm2-tc"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                        <div className="crm2-card">
                          <div className="crm2-card-title"><History size={14}/> Activité & Séjours</div>
                          <div className="crm2-timeline">
                            {selected.timeline?.map((ev, i) => (
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
                <p>
                  {allGuests.length} client{allGuests.length !== 1 ? 's' : ''} dérivé{allGuests.length !== 1 ? 's' : ''} automatiquement
                  depuis {reservations.length} réservation{reservations.length !== 1 ? 's' : ''} —
                  Booking.com, Airbnb, Expedia, Direct et autres canaux.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default GuestCRM;
