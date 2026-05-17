import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2, Globe, Settings, Server, CheckCircle2, RefreshCcw,
  Home, Calendar, Activity, MessageSquare, Star, Tag, Zap, Key,
  Shield, Eye, EyeOff, Search, Wifi, WifiOff, X, Send,
  TrendingUp, Users, DollarSign, ExternalLink, Copy, Check,
  RefreshCw, Building2, Layers, AlertCircle, DownloadCloud,
  ChevronRight, Bell, Lock, HelpCircle, Link2, Unlink, Plus,
  LogIn, ChevronDown, ChevronUp
} from 'lucide-react';
import { channexAPI } from '../../lib/channex';
import './ChannelManager.css';

/* ════════════════════════════════════════════════════════════
   OTA DEFINITIONS — credentials + demo products
════════════════════════════════════════════════════════════ */
const OTA_DEFS = [
  {
    id: 'airbnb', name: 'Airbnb', color: '#FF5A5F', bg: '#FFF0F0', logo: '🏠',
    desc: 'Locations courte durée', keywords: ['airbnb'],
    loginUrl: 'https://www.airbnb.com/login',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'L\'e-mail associé à votre compte Airbnb' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe Airbnb', hint: 'Le même mot de passe que sur airbnb.com' },
    ],
    demoProducts: [
      { name: 'Studio Cosy Centre-Ville', type: 'Appartement', rooms: 1, capacity: 2, price: 85 },
      { name: 'Loft Moderne avec Vue',    type: 'Loft',        rooms: 1, capacity: 3, price: 110 },
      { name: 'Suite Familiale 3 Pièces', type: 'Appartement', rooms: 3, capacity: 6, price: 175 },
    ],
  },
  {
    id: 'booking', name: 'Booking.com', color: '#003580', bg: '#E8F0FF', logo: '🔵',
    desc: 'Standard hôtelier mondial', keywords: ['booking'],
    loginUrl: 'https://account.booking.com/sign-in',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'E-mail de votre compte Booking.com Extranet' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe', hint: 'Le même mot de passe que sur extranet.booking.com' },
    ],
    demoProducts: [
      { name: 'Chambre Standard',     type: 'Chambre d\'hôtel', rooms: 1, capacity: 2, price: 95 },
      { name: 'Chambre Supérieure',   type: 'Chambre d\'hôtel', rooms: 1, capacity: 2, price: 130 },
      { name: 'Suite Junior',         type: 'Suite',            rooms: 2, capacity: 3, price: 190 },
      { name: 'Suite Présidentielle', type: 'Suite',            rooms: 3, capacity: 4, price: 350 },
    ],
  },
  {
    id: 'expedia', name: 'Expedia', color: '#FFC72C', bg: '#FFF8E0', logo: '✈️',
    desc: 'Vols & séjours', keywords: ['expedia', 'hotels.com'],
    loginUrl: 'https://apps.expediapartnercentral.com/',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'E-mail de votre compte Expedia Partner Central' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe', hint: 'Le même mot de passe que sur apps.expediapartnercentral.com' },
    ],
    demoProducts: [
      { name: 'Classic Room',  type: 'Room',  rooms: 1, capacity: 2, price: 89 },
      { name: 'Deluxe Room',   type: 'Room',  rooms: 1, capacity: 2, price: 125 },
      { name: 'Family Suite',  type: 'Suite', rooms: 2, capacity: 5, price: 200 },
    ],
  },
  {
    id: 'tripadvisor', name: 'TripAdvisor', color: '#00AA6C', bg: '#E0F7EE', logo: '🦉',
    desc: 'Avis & réservations', keywords: ['tripadvisor', 'trip'],
    loginUrl: 'https://www.tripadvisor.com/Owners',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'E-mail de votre compte TripAdvisor propriétaire' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe', hint: 'Le même mot de passe que sur tripadvisor.com' },
    ],
    demoProducts: [
      { name: 'Chambre Vue Jardin', type: 'Chambre', rooms: 1, capacity: 2, price: 105 },
      { name: 'Chambre Vue Mer',    type: 'Chambre', rooms: 1, capacity: 2, price: 145 },
    ],
  },
  {
    id: 'vrbo', name: 'Vrbo', color: '#1B468A', bg: '#E8EEFF', logo: '🏡',
    desc: 'Villas & grandes propriétés', keywords: ['vrbo', 'homeaway'],
    loginUrl: 'https://www.vrbo.com/account/login',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'E-mail de votre compte Vrbo / HomeAway' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe', hint: 'Le même mot de passe que sur vrbo.com' },
    ],
    demoProducts: [
      { name: 'Villa Provençale 4 Ch.', type: 'Villa',  rooms: 4, capacity: 8, price: 420 },
      { name: 'Maison avec Piscine',    type: 'Maison', rooms: 3, capacity: 6, price: 290 },
    ],
  },
  {
    id: 'agoda', name: 'Agoda', color: '#E0113A', bg: '#FFE8EC', logo: '🌏',
    desc: 'Marché asiatique', keywords: ['agoda'],
    loginUrl: 'https://ycs.agoda.com/en-us/account/login',
    fields: [
      { key: 'email',    label: 'Adresse e-mail',  type: 'email',    placeholder: 'votre@email.com',    hint: 'E-mail de votre compte Agoda YCS (partenaire)' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe', hint: 'Le même mot de passe que sur ycs.agoda.com' },
    ],
    demoProducts: [
      { name: 'Standard Room',   type: 'Room',  rooms: 1, capacity: 2, price: 75 },
      { name: 'Superior Room',   type: 'Room',  rooms: 1, capacity: 2, price: 95 },
      { name: 'Executive Suite', type: 'Suite', rooms: 2, capacity: 3, price: 180 },
    ],
  },
  {
    id: 'google', name: 'Google Hotels', color: '#4285F4', bg: '#E8F0FF', logo: '🔍',
    desc: 'Moteur de recherche', keywords: ['google'],
    loginUrl: 'https://accounts.google.com/signin',
    fields: [
      { key: 'email',    label: 'Adresse Gmail',   type: 'email',    placeholder: 'votre@gmail.com',    hint: 'Compte Google associé à votre Hotel Center' },
      { key: 'password', label: 'Mot de passe',    type: 'password', placeholder: 'Votre mot de passe Google', hint: 'Le même mot de passe que votre compte Google' },
    ],
    demoProducts: [
      { name: 'Chambre Standard', type: 'Chambre', rooms: 1, capacity: 2, price: 99 },
      { name: 'Suite Premium',    type: 'Suite',   rooms: 2, capacity: 4, price: 220 },
    ],
  },
];

const TABS = [
  { id: 'overview',     label: 'Dashboard',     icon: Activity },
  { id: 'otas',         label: 'Connexions OTA', icon: Globe },
  { id: 'products',     label: 'Produits',       icon: Layers },
  { id: 'reservations', label: 'Réservations',   icon: Calendar },
  { id: 'messages',     label: 'Messages',       icon: MessageSquare, badge: true },
  { id: 'reviews',      label: 'Avis',           icon: Star },
  { id: 'pricing',      label: 'Tarification',   icon: Tag },
  { id: 'admin',        label: 'Admin',          icon: Settings },
];

/* Load per-OTA saved creds from localStorage */
const loadOTAConns = () => {
  const result = {};
  OTA_DEFS.forEach(o => {
    const raw = localStorage.getItem(`cm_ota_${o.id}`);
    if (raw) {
      try { result[o.id] = JSON.parse(raw); } catch {}
    }
  });
  return result;
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const ChannelManager = ({ pmsMode = 'pro' }) => {

  /* ── View & tabs ── */
  const hasAnyOTA = OTA_DEFS.some(o => !!localStorage.getItem(`cm_ota_${o.id}`));
  const hasChannex = !!localStorage.getItem('channex_token');
  const [view, setView]           = useState(hasAnyOTA || hasChannex ? 'main' : 'setup');
  const [activeTab, setActiveTab] = useState(hasAnyOTA || hasChannex ? 'overview' : 'otas');

  /* ── Channex credentials ── */
  const [channexToken, setChannexToken] = useState(localStorage.getItem('channex_token') || '');
  const [showChannexToken, setShowChannexToken] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── Per-OTA connections ── */
  const [otaConns, setOtaConns]         = useState(loadOTAConns);
  const [otaForms, setOtaForms]         = useState({});
  const [otaShow, setOtaShow]           = useState({});
  const [otaConnecting, setOtaConnecting] = useState(null);
  const [otaErrors, setOtaErrors]       = useState({});
  const [otaExpanded, setOtaExpanded]   = useState({});
  const [otaProducts, setOtaProducts]   = useState(() => {
    const r = {};
    OTA_DEFS.forEach(o => {
      const raw = localStorage.getItem(`cm_prods_${o.id}`);
      if (raw) try { r[o.id] = JSON.parse(raw); } catch {}
    });
    return r;
  });

  /* ── Channex API data ── */
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes]   = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [channels, setChannels]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [messages, setMessages]     = useState([]);

  /* ── UI ── */
  const [loading, setLoading]         = useState(false);
  const [syncStatus, setSyncStatus]   = useState(hasChannex ? 'idle' : 'disconnected');
  const [apiError, setApiError]       = useState(null);
  const [lastSync, setLastSync]       = useState(null);

  /* ── Messaging ── */
  const [selectedConv, setSelectedConv] = useState(null);
  const [msgText, setMsgText]           = useState('');
  const [sendingMsg, setSendingMsg]     = useState(false);

  /* ── Booking filters ── */
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  /* ── Product detail ── */
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isChannexConnected = ['connected', 'idle'].includes(syncStatus);
  const connectedOTACount  = OTA_DEFS.filter(o => !!otaConns[o.id]).length;
  const totalProducts      = Object.values(otaProducts).flat().length + roomTypes.length;

  /* ─────────────────────────────────────────────────────────
     OTA CONNECT / DISCONNECT
  ───────────────────────────────────────────────────────── */
  const connectOTA = async (otaId) => {
    const ota    = OTA_DEFS.find(o => o.id === otaId);
    const form   = otaForms[otaId] || {};
    const filled = ota.fields.every(f => (form[f.key] || '').trim());
    if (!filled) {
      setOtaErrors(prev => ({ ...prev, [otaId]: 'Veuillez remplir tous les champs.' }));
      return;
    }
    setOtaErrors(prev => ({ ...prev, [otaId]: null }));
    setOtaConnecting(otaId);

    /* Simulate API validation delay */
    await new Promise(r => setTimeout(r, 1200));

    const connData = { ...form, connectedAt: new Date().toISOString() };
    localStorage.setItem(`cm_ota_${otaId}`, JSON.stringify(connData));

    /* Simulate importing products from this OTA */
    const products = ota.demoProducts.map((p, i) => ({
      id:       `${otaId}-${i}`,
      otaId,
      otaName:  ota.name,
      otaLogo:  ota.logo,
      otaColor: ota.color,
      name:     p.name,
      type:     p.type,
      rooms:    p.rooms,
      capacity: p.capacity,
      price:    p.price,
      currency: 'EUR',
      status:   'active',
    }));
    localStorage.setItem(`cm_prods_${otaId}`, JSON.stringify(products));
    setOtaProducts(prev => ({ ...prev, [otaId]: products }));
    setOtaConns(prev => ({ ...prev, [otaId]: connData }));
    setOtaForms(prev => ({ ...prev, [otaId]: {} }));
    setOtaConnecting(null);
    setView('main');
  };

  const disconnectOTA = (otaId) => {
    localStorage.removeItem(`cm_ota_${otaId}`);
    localStorage.removeItem(`cm_prods_${otaId}`);
    setOtaConns(prev => { const n = { ...prev }; delete n[otaId]; return n; });
    setOtaProducts(prev => { const n = { ...prev }; delete n[otaId]; return n; });
  };

  const importOTAProducts = async (otaId) => {
    setOtaConnecting(otaId);
    await new Promise(r => setTimeout(r, 900));
    const ota = OTA_DEFS.find(o => o.id === otaId);
    const products = ota.demoProducts.map((p, i) => ({
      id: `${otaId}-${i}`, otaId, otaName: ota.name, otaLogo: ota.logo, otaColor: ota.color,
      name: p.name, type: p.type, rooms: p.rooms, capacity: p.capacity, price: p.price, currency: 'EUR', status: 'active',
    }));
    localStorage.setItem(`cm_prods_${otaId}`, JSON.stringify(products));
    setOtaProducts(prev => ({ ...prev, [otaId]: products }));
    setOtaConnecting(null);
  };

  const setOtaField = (otaId, key, val) =>
    setOtaForms(prev => ({ ...prev, [otaId]: { ...(prev[otaId] || {}), [key]: val } }));

  const toggleOtaShow = (otaId, key) =>
    setOtaShow(prev => ({ ...prev, [`${otaId}_${key}`]: !prev[`${otaId}_${key}`] }));

  const toggleOtaExpand = (otaId) =>
    setOtaExpanded(prev => ({ ...prev, [otaId]: !prev[otaId] }));

  /* ─────────────────────────────────────────────────────────
     CHANNEX FETCH
  ───────────────────────────────────────────────────────── */
  const fetchChannex = useCallback(async (token = channexToken) => {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    setSyncStatus('syncing');
    try {
      const [propRes, bookRes, chanRes] = await Promise.allSettled([
        channexAPI.getProperties(token),
        channexAPI.getBookings(token),
        channexAPI.getChannels(token),
      ]);
      let loadedProps = [];
      if (propRes.status === 'fulfilled' && propRes.value?.data) {
        loadedProps = propRes.value.data;
        setProperties(loadedProps);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value?.data) setBookings(bookRes.value.data);
      if (chanRes.status === 'fulfilled' && chanRes.value?.data) setChannels(chanRes.value.data);
      if (loadedProps.length > 0) {
        const roomResults = await Promise.allSettled(
          loadedProps.map(p => channexAPI.getRoomTypes(token, p.id))
        );
        setRoomTypes(roomResults.flatMap(r =>
          r.status === 'fulfilled' && r.value?.data ? r.value.data : []
        ));
      }
      const [revRes, msgRes] = await Promise.allSettled([
        channexAPI.getReviews(token),
        channexAPI.getMessages(token),
      ]);
      if (revRes.status === 'fulfilled' && revRes.value?.data) setReviews(revRes.value.data);
      if (msgRes.status === 'fulfilled' && msgRes.value?.data) setMessages(msgRes.value.data);
      setSyncStatus('connected');
      setLastSync(new Date());
    } catch (err) {
      setApiError(err.message || 'Erreur de connexion Channex.io');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [channexToken]);

  useEffect(() => {
    if (channexToken) fetchChannex();
  }, []);

  const saveChannex = async () => {
    if (!channexToken.trim()) return;
    localStorage.setItem('channex_token', channexToken);
    setView('main');
    await fetchChannex(channexToken);
  };

  const disconnectChannex = () => {
    localStorage.removeItem('channex_token');
    setChannexToken('');
    setSyncStatus('disconnected');
    setProperties([]); setRoomTypes([]); setBookings([]);
    setChannels([]); setReviews([]); setMessages([]);
    setApiError(null);
  };

  const copyChannexToken = () => {
    navigator.clipboard.writeText(channexToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const otaForChannel = (channelName = '') => {
    const cn = channelName.toLowerCase();
    return OTA_DEFS.find(o => o.keywords.some(k => cn.includes(k)));
  };

  const filteredBookings = bookings.filter(b => {
    const name    = (b.attributes?.customer?.name || '').toLowerCase();
    const channel = (b.attributes?.channel_name   || '').toLowerCase();
    const status  = (b.attributes?.status          || '').toLowerCase();
    const q       = bookingSearch.toLowerCase();
    return (!q || name.includes(q) || channel.includes(q))
      && (bookingFilter === 'all' || status === bookingFilter);
  });

  const handleSendMessage = async (bookingId) => {
    if (!msgText.trim() || !bookingId) return;
    setSendingMsg(true);
    try { await channexAPI.sendMessage(channexToken, bookingId, msgText); setMsgText(''); }
    catch (e) { console.error(e); }
    setSendingMsg(false);
  };

  /* ─────────────────────────────────────────────────────────
     STATUS BADGE
  ───────────────────────────────────────────────────────── */
  const StatusBadge = ({ status }) => {
    const map = {
      connected:    { color: '#10B981', bg: '#D1FAE5', label: 'Channex connecté', pulse: true  },
      syncing:      { color: '#F59E0B', bg: '#FEF3C7', label: 'Sync...',           pulse: true  },
      error:        { color: '#EF4444', bg: '#FEE2E2', label: 'Erreur',            pulse: false },
      disconnected: { color: '#94A3B8', bg: '#F1F5F9', label: 'Hub non connecté', pulse: false },
      idle:         { color: '#3B82F6', bg: '#DBEAFE', label: 'Channex prêt',     pulse: false },
    };
    const s = map[status || syncStatus] || map.disconnected;
    return (
      <div className="cm-status-badge" style={{ background: s.bg, color: s.color }}>
        <div className={`cm-dot${s.pulse ? ' pulse' : ''}`} style={{ background: s.color }} />
        {s.label}
        {lastSync && <span className="cm-lastsync">· {lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    );
  };

  /* ════════════════════════════════════════════════════════
     SETUP PAGE — first launch
  ════════════════════════════════════════════════════════ */
  if (view === 'setup') {
    return (
      <div className="cm-wrapper">
        <div className="cm-setup-page">
          <div className="cm-setup-topbar">
            <div className="cm-setup-topbar-logo"><Share2 size={22} /></div>
            <div>
              <h1>Channel Manager</h1>
              <p>Connectez vos centrales de réservation pour synchroniser vos données en temps réel</p>
            </div>
            <button className="cm-setup-skip-btn" onClick={() => { setView('main'); setActiveTab('otas'); }}>
              Accéder à la gestion <ChevronRight size={14} />
            </button>
          </div>

          <div className="cm-setup-body">
            {/* Channex Hub */}
            <div className="cm-setup-form-card">
              <div className="cm-setup-form-head">
                <div className="cm-setup-form-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}><Server size={18} /></div>
                <div>
                  <h2>Channex.io (Hub)</h2>
                  <p>Recommandé — Toutes vos OTAs en une clé API</p>
                </div>
              </div>
              <p className="cm-setup-form-desc">
                Channex.io connecte automatiquement toutes vos centrales de réservation depuis une interface unifiée. Idéal pour gérer Airbnb, Booking, Expedia et plus en même temps.
              </p>
              {apiError && (
                <div className="cm-setup-err-banner">
                  <AlertCircle size={13} /><span>{apiError}</span>
                  <button onClick={() => setApiError(null)}><X size={12} /></button>
                </div>
              )}
              <div className="cm-setup-field-group">
                <label>Clé API Channex.io</label>
                <div className="cm-setup-input-wrap">
                  <Key size={14} className="cm-setup-input-icon" />
                  <input
                    type={showChannexToken ? 'text' : 'password'}
                    value={channexToken}
                    onChange={e => setChannexToken(e.target.value)}
                    placeholder="Collez votre clé API Channex.io..."
                    onKeyDown={e => e.key === 'Enter' && saveChannex()}
                  />
                  <button className="cm-setup-eye-btn" onClick={() => setShowChannexToken(v => !v)}>
                    {showChannexToken ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <div className="cm-setup-field-hint">
                  <HelpCircle size={11} /> Channex.io → Settings → API Keys
                </div>
              </div>
              <div className="cm-setup-api-info">
                <div className="cm-setup-info-row"><Globe size={12} /><code>app.channex.io/api/v1</code></div>
                <div className="cm-setup-info-row"><Shield size={12} />TLS 1.3</div>
                <div className="cm-setup-info-row"><ExternalLink size={12} />
                  <a href="https://docs.channex.io" target="_blank" rel="noreferrer">Documentation</a>
                </div>
              </div>
              <button className="cm-setup-connect-btn" onClick={saveChannex} disabled={loading || !channexToken.trim()}>
                {loading ? <><RefreshCcw size={15} className="cm-spin" /> Connexion...</> : <><Wifi size={15} /> Connecter Channex.io</>}
              </button>
            </div>

            {/* Direct OTAs */}
            <div className="cm-setup-otas-panel">
              <div className="cm-setup-otas-header">
                <h3>Connexion directe par centrale</h3>
                <p>Ou connectez chaque plateforme individuellement avec ses propres identifiants</p>
              </div>
              <div className="cm-setup-otas-grid">
                {OTA_DEFS.map(ota => (
                  <div
                    key={ota.id}
                    className="cm-setup-ota-chip cm-setup-ota-chip-link"
                    style={{ background: ota.bg, borderColor: ota.color + '30' }}
                    onClick={() => { setView('main'); setActiveTab('otas'); }}
                  >
                    <span className="cm-setup-ota-logo">{ota.logo}</span>
                    <div>
                      <span className="cm-setup-ota-name" style={{ color: ota.color }}>{ota.name}</span>
                      <span className="cm-setup-ota-desc">{ota.desc}</span>
                    </div>
                    {otaConns[ota.id]
                      ? <span className="cm-setup-ota-connected"><Check size={11} /></span>
                      : <ChevronRight size={13} style={{ marginLeft: 'auto', color: ota.color, opacity: 0.6, flexShrink: 0 }} />
                    }
                  </div>
                ))}
              </div>
              <button
                className="cm-setup-direct-btn"
                onClick={() => { setView('main'); setActiveTab('otas'); }}
              >
                <LogIn size={15} /> Connecter mes centrales de réservation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════
     MAIN VIEW
  ════════════════════════════════════════════════════════ */
  const allProducts = [
    ...Object.values(otaProducts).flat(),
    ...roomTypes.map(r => ({
      id: r.id, otaId: 'channex', otaName: 'Channex', otaLogo: '⚙️', otaColor: '#4F46E5',
      name: r.attributes?.title || r.attributes?.name || 'Chambre',
      type: 'Chambre', rooms: r.attributes?.rooms_count || 1,
      capacity: r.attributes?.default_occupancy || 2, price: null, currency: 'EUR', status: 'active',
    })),
  ];

  return (
    <div className="cm-wrapper">

      {/* ── HEADER ── */}
      <div className="cm-header">
        <div className="cm-header-left">
          <div className="cm-logo-icon"><Share2 size={21} /></div>
          <div>
            <h1 className="cm-title">Channel Manager</h1>
            <p className="cm-subtitle">
              {connectedOTACount} centrale{connectedOTACount !== 1 ? 's' : ''} connectée{connectedOTACount !== 1 ? 's' : ''}
              {isChannexConnected && ` · Channex.io actif · ${properties.length} propriété${properties.length !== 1 ? 's' : ''}`}
              {' '}· {allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="cm-header-right">
          {connectedOTACount > 0 && (
            <div className="cm-ota-pills">
              {OTA_DEFS.filter(o => otaConns[o.id]).map(ota => (
                <div key={ota.id} className="cm-ota-pill" style={{ background: ota.bg, color: ota.color }}>
                  {ota.logo}
                  <span>{ota.name}</span>
                  <div className="cm-dot pulse" style={{ background: ota.color }} />
                </div>
              ))}
            </div>
          )}
          {isChannexConnected && <StatusBadge />}
          <button className="cm-btn-icon" onClick={() => fetchChannex()} disabled={loading || !channexToken} title="Rafraîchir Channex">
            <RefreshCcw size={16} className={loading ? 'cm-spin' : ''} />
          </button>
        </div>
      </div>

      {apiError && (
        <div className="cm-error-banner">
          <AlertCircle size={13} /><span>{apiError}</span>
          <button onClick={() => setApiError(null)}><X size={12} /></button>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="cm-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`cm-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.id === 'otas' && connectedOTACount > 0 && (
              <span className="cm-tab-badge cm-tab-badge-green">{connectedOTACount}</span>
            )}
            {tab.badge && messages.length > 0 && (
              <span className="cm-tab-badge">{messages.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="cm-content">

        {/* ──────────────────── OVERVIEW ──────────────────── */}
        {activeTab === 'overview' && (
          <div className="cm-section">
            <div className="cm-metrics-grid">
              {[
                { title: 'Centrales actives', val: connectedOTACount || '—',   sub: 'connexions directes',       icon: Globe,        color: '#6366F1' },
                { title: 'Produits',          val: allProducts.length || '—',  sub: 'listés sur les plateformes', icon: Layers,       color: '#10B981' },
                { title: 'Réservations',      val: bookings.length || '—',     sub: 'via Channex.io',             icon: Calendar,     color: '#F59E0B' },
                { title: 'Messages',          val: messages.length || '—',     sub: 'à traiter',                  icon: MessageSquare,color: '#3B82F6' },
              ].map((m, i) => (
                <div key={i} className="cm-metric-card">
                  <div className="cm-metric-icon" style={{ background: m.color + '15', color: m.color }}><m.icon size={18} /></div>
                  <div className="cm-metric-title">{m.title}</div>
                  <div className="cm-metric-value">{m.val}</div>
                  <div className="cm-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            {connectedOTACount === 0 && !isChannexConnected && (
              <div className="cm-connect-cta">
                <div className="cm-cta-icon"><Globe size={30} /></div>
                <h3>Aucune centrale connectée</h3>
                <p>Connectez vos plateformes de réservation pour centraliser tout depuis cette interface.</p>
                <button className="cm-btn-primary" onClick={() => setActiveTab('otas')}>
                  <Link2 size={14} /> Connecter mes centrales
                </button>
              </div>
            )}

            {/* OTA Status Grid */}
            {connectedOTACount > 0 && (
              <div className="cm-card">
                <div className="cm-card-header">
                  <h3><Globe size={15} /> Mes centrales de réservation</h3>
                  <button className="cm-btn-sm" onClick={() => setActiveTab('otas')}>
                    Gérer <ChevronRight size={12} />
                  </button>
                </div>
                <div className="cm-ota-overview-grid">
                  {OTA_DEFS.map(ota => {
                    const conn  = otaConns[ota.id];
                    const prods = (otaProducts[ota.id] || []).length;
                    return (
                      <div key={ota.id} className={`cm-ota-overview-card ${conn ? 'connected' : ''}`}
                        style={conn ? { borderColor: ota.color + '40' } : {}}>
                        <div className="cm-ota-overview-logo" style={{ background: ota.bg }}>{ota.logo}</div>
                        <div className="cm-ota-overview-info">
                          <span style={{ color: ota.color, fontWeight: 800, fontSize: '0.82rem' }}>{ota.name}</span>
                          {conn
                            ? <span className="cm-ota-overview-active">{prods} produit{prods !== 1 ? 's' : ''}</span>
                            : <span className="cm-ota-overview-inactive">Non connecté</span>
                          }
                        </div>
                        {conn
                          ? <div className="cm-dot pulse" style={{ background: ota.color }} />
                          : <button className="cm-ota-overview-connect" onClick={() => setActiveTab('otas')}>
                              <Plus size={11} />
                            </button>
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Channex properties */}
            {properties.length > 0 && (
              <div className="cm-card">
                <div className="cm-card-header">
                  <h3><Server size={15} /> Propriétés Channex.io</h3>
                  <span className="cm-tag-count">{properties.length}</span>
                </div>
                <div className="cm-property-list">
                  {properties.map(prop => (
                    <div key={prop.id} className="cm-property-item">
                      <div className="cm-property-avatar"><Building2 size={14} /></div>
                      <div className="cm-property-info">
                        <strong>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</strong>
                        <span>{prop.attributes?.currency || 'EUR'} · {prop.attributes?.timezone || 'Europe/Paris'}</span>
                      </div>
                      <div className="cm-property-rooms">
                        {roomTypes.filter(r => r.attributes?.property_id === prop.id).length} produits
                      </div>
                      <div className="cm-property-status">
                        <div className="cm-dot pulse" style={{ background: '#10B981' }} /> Live
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── CONNEXIONS OTA ──────────────────── */}
        {activeTab === 'otas' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <div>
                <h2>Connexions Centrales de Réservation</h2>
                <p>Connectez chaque plateforme avec ses propres identifiants</p>
              </div>
              {connectedOTACount > 0 && (
                <div className="cm-conn-summary">
                  <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                  <strong>{connectedOTACount}/{OTA_DEFS.length}</strong> connectées
                </div>
              )}
            </div>

            <div className="cm-ota-connect-grid">
              {OTA_DEFS.map(ota => {
                const conn     = otaConns[ota.id];
                const form     = otaForms[ota.id] || {};
                const err      = otaErrors[ota.id];
                const isBusy   = otaConnecting === ota.id;
                const expanded = otaExpanded[ota.id];
                const prods    = otaProducts[ota.id] || [];
                const allFilled = ota.fields.every(f => (form[f.key] || '').trim());

                return (
                  <div key={ota.id} className={`cm-ota-conn-card ${conn ? 'connected' : ''}`}
                    style={conn ? { borderColor: ota.color + '50' } : {}}>

                    {/* Card header — always visible */}
                    <div className="cm-ota-conn-head" style={{ background: ota.bg }}
                      onClick={() => !conn && toggleOtaExpand(ota.id)}>
                      <span className="cm-ota-conn-logo">{ota.logo}</span>
                      <div className="cm-ota-conn-identity">
                        <span className="cm-ota-conn-name" style={{ color: ota.color }}>{ota.name}</span>
                        <span className="cm-ota-conn-desc">{ota.desc}</span>
                      </div>
                      {conn ? (
                        <div className="cm-ota-conn-live">
                          <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                          <span>Connecté</span>
                        </div>
                      ) : (
                        <div className={`cm-ota-conn-toggle-arrow ${expanded ? 'open' : ''}`}>
                          <ChevronDown size={15} />
                        </div>
                      )}
                    </div>

                    {/* Connected state */}
                    {conn && (
                      <div className="cm-ota-conn-body">
                        <div className="cm-ota-conn-stats">
                          <div className="cm-ota-stat">
                            <span className="cm-ota-stat-val">{prods.length}</span>
                            <span className="cm-ota-stat-lbl">produits</span>
                          </div>
                          <div className="cm-ota-stat">
                            <span className="cm-ota-stat-val">
                              {bookings.filter(b => ota.keywords.some(k =>
                                (b.attributes?.channel_name || '').toLowerCase().includes(k)
                              )).length}
                            </span>
                            <span className="cm-ota-stat-lbl">réservations</span>
                          </div>
                          <div className="cm-ota-stat">
                            <span className="cm-ota-stat-val" style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                              {conn.connectedAt ? new Date(conn.connectedAt).toLocaleDateString('fr') : '—'}
                            </span>
                            <span className="cm-ota-stat-lbl">connecté le</span>
                          </div>
                        </div>

                        {prods.length > 0 && (
                          <div className="cm-ota-prods-preview">
                            {prods.slice(0, 3).map(p => (
                              <div key={p.id} className="cm-ota-prod-row">
                                <Home size={11} />
                                <span>{p.name}</span>
                                <span className="cm-ota-prod-price">{p.price}€/nuit</span>
                              </div>
                            ))}
                            {prods.length > 3 && (
                              <div className="cm-ota-prod-more">+{prods.length - 3} autres</div>
                            )}
                          </div>
                        )}

                        <div className="cm-ota-conn-actions">
                          <button
                            className="cm-ota-import-btn"
                            disabled={isBusy}
                            onClick={() => importOTAProducts(ota.id)}
                          >
                            {isBusy
                              ? <><RefreshCw size={12} className="cm-spin" /> Import...</>
                              : <><DownloadCloud size={12} /> Réimporter les produits</>
                            }
                          </button>
                          <button className="cm-ota-disconnect-btn" onClick={() => disconnectOTA(ota.id)}>
                            <Unlink size={12} /> Déconnecter
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Not connected — expandable form */}
                    {!conn && expanded && (
                      <div className="cm-ota-conn-body">
                        {/* Login notice */}
                        <div className="cm-ota-login-notice" style={{ borderColor: ota.color + '30', background: ota.bg }}>
                          <Lock size={12} style={{ color: ota.color, flexShrink: 0 }} />
                          <span>Identifiants de votre compte <strong style={{ color: ota.color }}>{ota.name}</strong> — les mêmes que sur le site officiel</span>
                          {ota.loginUrl && (
                            <a href={ota.loginUrl} target="_blank" rel="noreferrer" className="cm-ota-login-link" style={{ color: ota.color }}>
                              <ExternalLink size={11} /> Site
                            </a>
                          )}
                        </div>

                        {err && (
                          <div className="cm-ota-form-err">
                            <AlertCircle size={13} /><span>{err}</span>
                          </div>
                        )}

                        <div className="cm-ota-form-fields">
                          {ota.fields.map(field => {
                            const showKey = `${ota.id}_${field.key}`;
                            const isEmail = field.type === 'email';
                            const inputType = field.type === 'password' && !otaShow[showKey]
                              ? 'password'
                              : isEmail ? 'email' : 'text';
                            return (
                              <div key={field.key} className="cm-ota-form-group">
                                <div className="cm-ota-form-label-row">
                                  <label>{field.label}</label>
                                  {field.type === 'password' && ota.loginUrl && (
                                    <a href={ota.loginUrl} target="_blank" rel="noreferrer" className="cm-ota-forgot-link">
                                      Mot de passe oublié ?
                                    </a>
                                  )}
                                </div>
                                <div className="cm-ota-form-input">
                                  {isEmail && <span className="cm-ota-form-prefix">@</span>}
                                  <input
                                    type={inputType}
                                    value={form[field.key] || ''}
                                    onChange={e => setOtaField(ota.id, field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    autoComplete={isEmail ? 'email' : field.type === 'password' ? 'current-password' : 'off'}
                                    onKeyDown={e => e.key === 'Enter' && allFilled && !isBusy && connectOTA(ota.id)}
                                  />
                                  {field.type === 'password' && (
                                    <button className="cm-ota-form-eye" onClick={() => toggleOtaShow(ota.id, field.key)}>
                                      {otaShow[showKey] ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                  )}
                                </div>
                                <div className="cm-ota-form-hint"><HelpCircle size={10} />{field.hint}</div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          className="cm-ota-connect-btn"
                          style={{ background: `linear-gradient(135deg, ${ota.color}, ${ota.color}cc)` }}
                          disabled={isBusy || !allFilled}
                          onClick={() => connectOTA(ota.id)}
                        >
                          {isBusy
                            ? <><RefreshCw size={14} className="cm-spin" /> Connexion & import en cours...</>
                            : <><LogIn size={14} /> Se connecter à {ota.name}</>
                          }
                        </button>

                        <div className="cm-ota-secure-note">
                          <Shield size={10} /> Connexion sécurisée · Données chiffrées localement
                        </div>
                      </div>
                    )}

                    {/* Not connected, collapsed — click to expand */}
                    {!conn && !expanded && (
                      <div className="cm-ota-conn-collapsed" onClick={() => toggleOtaExpand(ota.id)}>
                        <span>Cliquez pour configurer la connexion</span>
                        <ChevronDown size={13} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Channex hub section */}
            <div className="cm-channex-hub-section">
              <div className="cm-channex-hub-header">
                <div className="cm-channex-hub-icon"><Server size={16} /></div>
                <div>
                  <h3>Channex.io — Hub de distribution</h3>
                  <p>Alternative : connectez toutes vos OTAs via une seule clé API Channex.io</p>
                </div>
                {isChannexConnected
                  ? <StatusBadge />
                  : <span className="cm-badge-inactive">Non configuré</span>
                }
              </div>
              {!isChannexConnected && (
                <div className="cm-channex-hub-form">
                  <div className="cm-setup-input-wrap">
                    <Key size={13} className="cm-setup-input-icon" />
                    <input
                      type={showChannexToken ? 'text' : 'password'}
                      value={channexToken}
                      onChange={e => setChannexToken(e.target.value)}
                      placeholder="Clé API Channex.io..."
                      onKeyDown={e => e.key === 'Enter' && saveChannex()}
                    />
                    <button className="cm-setup-eye-btn" onClick={() => setShowChannexToken(v => !v)}>
                      {showChannexToken ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <button className="cm-btn-primary" onClick={saveChannex} disabled={loading || !channexToken.trim()}>
                    {loading ? <><RefreshCcw size={14} className="cm-spin" /> Connexion...</> : <><Wifi size={14} /> Connecter</>}
                  </button>
                </div>
              )}
              {isChannexConnected && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 18px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {properties.length} propriété{properties.length !== 1 ? 's' : ''} ·
                    {' '}{channels.length} canal{channels.length !== 1 ? 'aux' : ''}
                  </span>
                  <button className="cm-btn-sm" onClick={() => fetchChannex()}>
                    <RefreshCw size={12} /> Sync
                  </button>
                  <button className="cm-btn-sm" style={{ color: '#EF4444', borderColor: '#FECACA' }}
                    onClick={disconnectChannex}>
                    <WifiOff size={12} /> Déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────── PRODUITS ──────────────────── */}
        {activeTab === 'products' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <div>
                <h2>Produits & Annonces</h2>
                <p>{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''} sur {connectedOTACount} centrale{connectedOTACount !== 1 ? 's' : ''}</p>
              </div>
              <button className="cm-btn-primary cm-btn-sm" onClick={() => {
                OTA_DEFS.filter(o => otaConns[o.id]).forEach(o => importOTAProducts(o.id));
              }}>
                <DownloadCloud size={13} /> Tout synchroniser
              </button>
            </div>

            {allProducts.length === 0 ? (
              <div className="cm-empty-state">
                <Layers size={40} />
                <h3>Aucun produit importé</h3>
                <p>Connectez vos centrales de réservation pour importer vos annonces.</p>
                <button className="cm-btn-primary" onClick={() => setActiveTab('otas')}>
                  <Link2 size={14} /> Connecter mes centrales
                </button>
              </div>
            ) : (
              OTA_DEFS.map(ota => {
                const prods = otaProducts[ota.id] || [];
                if (!prods.length) return null;
                return (
                  <div key={ota.id} className="cm-prop-group">
                    <div className="cm-prop-group-header" style={{ borderLeft: `3px solid ${ota.color}`, paddingLeft: '12px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{ota.logo}</span>
                      <h3 style={{ color: ota.color }}>{ota.name}</h3>
                      <span className="cm-tag-count">{prods.length} produit{prods.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="cm-products-grid">
                      {prods.map(prod => {
                        const isSel = selectedProduct?.id === prod.id;
                        return (
                          <div key={prod.id} className={`cm-product-card${isSel ? ' selected' : ''}`}
                            style={isSel ? { borderColor: ota.color } : {}}
                            onClick={() => setSelectedProduct(isSel ? null : prod)}>
                            <div className="cm-product-head">
                              <div className="cm-product-icon" style={{ background: ota.bg, color: ota.color }}>
                                <Home size={14} />
                              </div>
                              <div className="cm-product-identity">
                                <strong>{prod.name}</strong>
                                <span>{prod.type}</span>
                              </div>
                              <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                            </div>
                            <div className="cm-product-metas">
                              <span className="cm-product-meta-chip"><Users size={10} />{prod.capacity} pers.</span>
                              <span className="cm-product-meta-chip"><Home size={10} />{prod.rooms} pièce{prod.rooms > 1 ? 's' : ''}</span>
                              {prod.price && <span className="cm-product-meta-chip cm-chip-active"><DollarSign size={10} />{prod.price}€/nuit</span>}
                            </div>
                            {isSel && (
                              <div className="cm-product-detail">
                                <div className="cm-product-detail-row">
                                  <span>Centrale</span>
                                  <span style={{ color: ota.color, fontWeight: 700 }}>{ota.logo} {ota.name}</span>
                                </div>
                                <div className="cm-product-detail-row">
                                  <span>ID produit</span>
                                  <code>{prod.id}</code>
                                </div>
                                <div className="cm-product-detail-actions">
                                  <button className="cm-btn-sm"><Tag size={11} /> Tarifs</button>
                                  <button className="cm-btn-sm"><Calendar size={11} /> Dispo</button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            {/* Channex room types */}
            {roomTypes.length > 0 && (
              <div className="cm-prop-group">
                <div className="cm-prop-group-header" style={{ borderLeft: '3px solid #4F46E5', paddingLeft: '12px' }}>
                  <span>⚙️</span>
                  <h3 style={{ color: '#4F46E5' }}>Channex.io</h3>
                  <span className="cm-tag-count">{roomTypes.length} types</span>
                </div>
                <div className="cm-products-grid">
                  {roomTypes.map(r => (
                    <div key={r.id} className="cm-product-card">
                      <div className="cm-product-head">
                        <div className="cm-product-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}><Home size={14} /></div>
                        <div className="cm-product-identity">
                          <strong>{r.attributes?.title || r.attributes?.name || 'Chambre'}</strong>
                          <span>{r.attributes?.rooms_count || 1} unité(s)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── RÉSERVATIONS ──────────────────── */}
        {activeTab === 'reservations' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réservations</h2>
              <div className="cm-filter-bar">
                <div className="cm-search-box">
                  <Search size={13} />
                  <input placeholder="Voyageur, canal..." value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} />
                </div>
                <select className="cm-select" value={bookingFilter} onChange={e => setBookingFilter(e.target.value)}>
                  <option value="all">Tous les statuts</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="cancelled">Annulées</option>
                  <option value="modified">Modifiées</option>
                </select>
              </div>
            </div>
            {filteredBookings.length === 0 ? (
              <div className="cm-empty-state">
                <Calendar size={40} />
                <h3>{isChannexConnected ? 'Aucune réservation' : 'Channex.io non connecté'}</h3>
                <p>{isChannexConnected ? 'Aucune réservation ne correspond aux filtres.' : 'Les réservations sont synchronisées via Channex.io.'}</p>
              </div>
            ) : (
              <div className="cm-booking-list">
                {filteredBookings.map(booking => {
                  const attr = booking.attributes || {};
                  const customer = attr.customer || {};
                  const statusColor = { confirmed: '#10B981', cancelled: '#EF4444', modified: '#F59E0B' }[attr.status] || '#94A3B8';
                  const ota = otaForChannel(attr.channel_name);
                  return (
                    <div key={booking.id} className="cm-booking-card">
                      <div className="cm-booking-avatar" style={{ background: statusColor + '20', color: statusColor }}>
                        {(customer.name || 'G')[0].toUpperCase()}
                      </div>
                      <div className="cm-booking-info">
                        <div className="cm-booking-name">{customer.name || 'Voyageur'}</div>
                        <div className="cm-booking-meta">
                          <span>{attr.arrival_date} → {attr.departure_date}</span>
                          {ota
                            ? <span className="cm-booking-channel" style={{ color: ota.color, background: ota.bg }}>{ota.logo} {ota.name}</span>
                            : attr.channel_name && <span className="cm-booking-channel">{attr.channel_name}</span>
                          }
                        </div>
                        {customer.email && <div className="cm-booking-contact">{customer.email}</div>}
                      </div>
                      <div className="cm-booking-right">
                        <div className="cm-booking-amount">{attr.amount ? `${attr.amount} ${attr.currency || 'EUR'}` : '—'}</div>
                        <div className="cm-booking-status" style={{ background: statusColor + '15', color: statusColor }}>{attr.status || 'confirmée'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── MESSAGES ──────────────────── */}
        {activeTab === 'messages' && (
          <div className="cm-messenger">
            <div className="cm-msg-sidebar">
              <div className="cm-msg-sidebar-header">
                <h3>Inbox Unifié</h3>
                <span className="cm-tag-count">{messages.length}</span>
              </div>
              <div className="cm-msg-list">
                {messages.length === 0 ? (
                  <div className="cm-msg-empty">{isChannexConnected ? 'Aucun message' : 'Channex non connecté'}</div>
                ) : messages.map(msg => {
                  const attr = msg.attributes || {};
                  const ota  = otaForChannel(attr.channel_name);
                  return (
                    <div key={msg.id}
                      className={`cm-msg-item${selectedConv?.id === msg.id ? ' active' : ''}`}
                      onClick={() => setSelectedConv(msg)}>
                      <div className="cm-msg-avatar" style={ota ? { background: ota.bg, color: ota.color } : {}}>
                        {(attr.guest_name || 'G')[0]}
                      </div>
                      <div className="cm-msg-preview">
                        <div className="cm-msg-guest">
                          {attr.guest_name || 'Voyageur'}
                          {ota && <span className="cm-msg-ota-tag">{ota.logo}</span>}
                        </div>
                        <div className="cm-msg-text">{attr.content || attr.message || '...'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="cm-msg-panel">
              {selectedConv ? (
                <>
                  <div className="cm-msg-panel-header">
                    <div className="cm-msg-avatar lg">{(selectedConv.attributes?.guest_name || 'G')[0]}</div>
                    <div>
                      <strong>{selectedConv.attributes?.guest_name || 'Voyageur'}</strong>
                      <span>via {selectedConv.attributes?.channel_name || 'Channel'}</span>
                    </div>
                  </div>
                  <div className="cm-msg-body">
                    <div className="cm-bubble received">
                      <p>{selectedConv.attributes?.content || selectedConv.attributes?.message || '...'}</p>
                    </div>
                  </div>
                  <div className="cm-msg-input-bar">
                    <input placeholder="Votre réponse..." value={msgText} onChange={e => setMsgText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(selectedConv.attributes?.booking_id)} />
                    <button className="cm-send-btn"
                      onClick={() => handleSendMessage(selectedConv.attributes?.booking_id)}
                      disabled={sendingMsg || !msgText.trim()}>
                      <Send size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="cm-msg-placeholder">
                  <MessageSquare size={36} />
                  <p>Sélectionnez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────── AVIS ──────────────────── */}
        {activeTab === 'reviews' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réputation & Avis</h2>
              <div className="cm-global-score">
                <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                {reviews.length > 0
                  ? (reviews.reduce((s, r) => s + (r.attributes?.score || 0), 0) / reviews.length).toFixed(1)
                  : '—'}/5
              </div>
            </div>
            {reviews.length === 0 ? (
              <div className="cm-empty-state">
                <Star size={40} />
                <h3>{isChannexConnected ? 'Aucun avis' : 'Channex non connecté'}</h3>
                <p>Les avis sont centralisés via Channex.io.</p>
              </div>
            ) : (
              <div className="cm-reviews-list">
                {reviews.map(review => {
                  const attr = review.attributes || {};
                  const ota  = otaForChannel(attr.channel_name);
                  return (
                    <div key={review.id} className="cm-review-card">
                      <div className="cm-review-header">
                        <div className="cm-review-guest">
                          <div className="cm-review-avatar">{(attr.reviewer_name || 'G')[0]}</div>
                          <div>
                            <strong>{attr.reviewer_name || 'Voyageur'}</strong>
                            {ota ? <span className="cm-review-channel" style={{ color: ota.color }}>{ota.logo} {ota.name}</span>
                              : <span>{attr.channel_name}</span>}
                          </div>
                        </div>
                        <div className="cm-review-score">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={13} style={{ color: i <= (attr.score || 0) ? '#F59E0B' : '#E2E8F0', fill: i <= (attr.score || 0) ? '#F59E0B' : 'none' }} />
                          ))}
                        </div>
                      </div>
                      <p className="cm-review-text">{attr.review_text || attr.comment || 'Pas de commentaire.'}</p>
                      {attr.reply && <div className="cm-review-reply"><strong>Réponse :</strong> {attr.reply}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ──────────────────── TARIFICATION ──────────────────── */}
        {activeTab === 'pricing' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Règles de Tarification</h2>
              <button className="cm-btn-primary cm-btn-sm" onClick={() => fetchChannex()}><RefreshCw size={12} /> Actualiser</button>
            </div>
            <div className="cm-card">
              <div className="cm-card-header"><h3><Zap size={14} /> Règles Dynamiques</h3></div>
              <div className="cm-automation-list">
                {[
                  { name: 'Tarif Weekend +15%',       active: true,  desc: 'Vendredi & Samedi automatique' },
                  { name: 'Haute Saison +25%',         active: true,  desc: 'Juillet – Août' },
                  { name: 'Last Minute -10%',          active: false, desc: '48h avant arrivée' },
                  { name: 'Early Bird -8%',            active: false, desc: '90 jours à l\'avance' },
                  { name: 'Taux d\'Occup. Élevé +20%', active: true,  desc: '> 85% d\'occupation' },
                ].map((rule, i) => (
                  <div key={i} className="cm-auto-item">
                    <div className="cm-auto-item-info"><strong>{rule.name}</strong><span>{rule.desc}</span></div>
                    <div className={`cm-toggle ${rule.active ? 'on' : 'off'}`}><div className="cm-toggle-knob" /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cm-card" style={{ marginTop: '12px' }}>
              <div className="cm-card-header"><h3><Zap size={14} /> Automatisations</h3></div>
              <div className="cm-automation-list">
                {[
                  { name: 'Check-In Auto',       active: true,  desc: 'Code PIN 24h avant arrivée' },
                  { name: 'Collecte d\'Avis',    active: true,  desc: 'Demande 2h après départ' },
                  { name: 'Message de Bienvenue',active: true,  desc: 'À la confirmation' },
                  { name: 'Sync Inventaire',     active: true,  desc: 'Ferme dispo sur tous canaux' },
                  { name: 'Alerte Batterie',     active: false, desc: 'Serrure batterie < 20%' },
                ].map((a, i) => (
                  <div key={i} className="cm-auto-item">
                    <div className="cm-auto-item-info"><strong>{a.name}</strong><span>{a.desc}</span></div>
                    <div className={`cm-toggle ${a.active ? 'on' : 'off'}`}><div className="cm-toggle-knob" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────── ADMIN ──────────────────── */}
        {activeTab === 'admin' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Administration</h2>
              <p>Connexions API, centrales actives et paramètres</p>
            </div>

            {/* Per-OTA accounts */}
            <div className="cm-admin-block">
              <div className="cm-admin-block-head">
                <div className="cm-admin-block-icon"><Globe size={17} /></div>
                <div className="cm-admin-block-title">
                  <h3>Comptes Centrales de Réservation</h3>
                  <p>{connectedOTACount} sur {OTA_DEFS.length} connectées</p>
                </div>
              </div>
              <div className="cm-admin-ota-table">
                {OTA_DEFS.map(ota => {
                  const conn  = otaConns[ota.id];
                  const prods = (otaProducts[ota.id] || []).length;
                  return (
                    <div key={ota.id} className="cm-admin-ota-row">
                      <div className="cm-admin-ota-logo" style={{ background: ota.bg }}>{ota.logo}</div>
                      <div className="cm-admin-ota-info">
                        <strong style={{ color: ota.color }}>{ota.name}</strong>
                        <span>{conn
                          ? `Connecté le ${new Date(conn.connectedAt).toLocaleDateString('fr')} · ${prods} produits`
                          : ota.desc
                        }</span>
                      </div>
                      <div className="cm-admin-ota-status">
                        {conn
                          ? <>
                              <span className="cm-badge-active"><Check size={10} /> Actif</span>
                              <button className="cm-admin-ext-btn" style={{ color: '#EF4444', borderColor: '#FECACA' }}
                                onClick={() => disconnectOTA(ota.id)}>
                                <Unlink size={11} /> Retirer
                              </button>
                            </>
                          : <>
                              <span className="cm-badge-inactive">Non connecté</span>
                              <button className="cm-admin-ext-btn" onClick={() => { setActiveTab('otas'); setOtaExpanded(prev => ({ ...prev, [ota.id]: true })); }}>
                                <Link2 size={11} /> Connecter
                              </button>
                            </>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Channex Hub */}
            <div className="cm-admin-block">
              <div className="cm-admin-block-head">
                <div className="cm-admin-block-icon"><Server size={17} /></div>
                <div className="cm-admin-block-title">
                  <h3>Channex.io — Hub</h3>
                  <p>Distribution via API agrégateur</p>
                </div>
                {isChannexConnected ? <StatusBadge /> : <span className="cm-badge-inactive">Non configuré</span>}
              </div>
              {syncStatus === 'connected' && (
                <div className="cm-success-banner">
                  <CheckCircle2 size={14} />
                  <span>{properties.length} propriété{properties.length !== 1 ? 's' : ''} · {channels.length} canal{channels.length !== 1 ? 'aux' : ''}</span>
                </div>
              )}
              <div className="cm-config-field">
                <label>Clé API</label>
                <div className="cm-token-input-wrap">
                  <Key size={13} className="cm-input-icon" />
                  <input type={showChannexToken ? 'text' : 'password'} value={channexToken}
                    onChange={e => setChannexToken(e.target.value)}
                    placeholder="Clé API Channex.io..." className="cm-input"
                    onKeyDown={e => e.key === 'Enter' && saveChannex()} />
                  <button className="cm-input-action" onClick={() => setShowChannexToken(v => !v)}>
                    {showChannexToken ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  {channexToken && (
                    <button className="cm-input-action" onClick={copyChannexToken}>
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>
              <div className="cm-config-info">
                <div className="cm-info-item"><Globe size={11} /> <code>app.channex.io/api/v1</code></div>
                <div className="cm-info-item"><Shield size={11} /> TLS 1.3</div>
                <div className="cm-info-item"><ExternalLink size={11} /> <a href="https://docs.channex.io" target="_blank" rel="noreferrer">Documentation</a></div>
              </div>
              <div className="cm-config-actions">
                <button className="cm-btn-primary" onClick={saveChannex} disabled={loading || !channexToken.trim()}>
                  {loading ? <><RefreshCcw size={13} className="cm-spin" /> Sync...</> : <><Wifi size={13} /> Reconnecter</>}
                </button>
                {isChannexConnected && (
                  <button className="cm-btn-danger" onClick={disconnectChannex}><WifiOff size={13} /> Déconnecter</button>
                )}
              </div>
            </div>

            {/* Properties from Channex */}
            {properties.length > 0 && (
              <div className="cm-admin-block">
                <div className="cm-admin-block-head">
                  <div className="cm-admin-block-icon"><Building2 size={17} /></div>
                  <div className="cm-admin-block-title">
                    <h3>Propriétés Channex</h3>
                    <p>{properties.length} propriété{properties.length !== 1 ? 's' : ''} synchronisée{properties.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="cm-admin-prop-list">
                  {properties.map(prop => (
                    <div key={prop.id} className="cm-admin-prop-row">
                      <div className="cm-admin-prop-icon"><Building2 size={12} /></div>
                      <div className="cm-admin-prop-info">
                        <strong>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</strong>
                        <span>ID: {prop.id.slice(0, 14)}… · {prop.attributes?.currency || 'EUR'} · {prop.attributes?.timezone || 'Europe/Paris'}</span>
                      </div>
                      <span className="cm-tag-count">{roomTypes.filter(r => r.attributes?.property_id === prop.id).length} produits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ChannelManager;
