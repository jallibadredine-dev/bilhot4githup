import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2, Globe, Settings, Server, CheckCircle2, RefreshCcw,
  Home, Calendar, Activity, MessageSquare, Star, Tag, Zap, Key,
  Shield, Eye, EyeOff, Search, Wifi, WifiOff, X, Send,
  TrendingUp, Users, DollarSign, ExternalLink, Copy, Check,
  RefreshCw, Building2, Layers, AlertCircle, DownloadCloud,
  ChevronRight, ArrowRight, Bell, Lock, HelpCircle
} from 'lucide-react';
import { channexAPI } from '../../lib/channex';
import './ChannelManager.css';

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const OTA_DEFS = [
  { id: 'airbnb',      name: 'Airbnb',         color: '#FF5A5F', bg: '#FFF0F0', logo: '🏠', desc: 'Locations courte durée',      keywords: ['airbnb'] },
  { id: 'booking',     name: 'Booking.com',     color: '#003580', bg: '#E8F0FF', logo: '🔵', desc: 'Standard hôtelier mondial',   keywords: ['booking'] },
  { id: 'expedia',     name: 'Expedia',         color: '#FFC72C', bg: '#FFF8E0', logo: '✈️',  desc: 'Vols & séjours',              keywords: ['expedia', 'hotels.com'] },
  { id: 'tripadvisor', name: 'TripAdvisor',     color: '#00AA6C', bg: '#E0F7EE', logo: '🦉', desc: 'Avis & réservations',         keywords: ['tripadvisor', 'trip'] },
  { id: 'vrbo',        name: 'Vrbo',            color: '#1B468A', bg: '#E8EEFF', logo: '🏡', desc: 'Villas & grandes propriétés', keywords: ['vrbo', 'homeaway'] },
  { id: 'agoda',       name: 'Agoda',           color: '#E0113A', bg: '#FFE8EC', logo: '🌏', desc: 'Marché asiatique',            keywords: ['agoda'] },
  { id: 'google',      name: 'Google Hotels',   color: '#4285F4', bg: '#E8F0FF', logo: '🔍', desc: 'Moteur de recherche',         keywords: ['google'] },
];

const TABS = [
  { id: 'overview',     label: 'Dashboard',     icon: Activity },
  { id: 'otas',         label: 'Canaux OTA',    icon: Globe },
  { id: 'products',     label: 'Produits',      icon: Layers },
  { id: 'reservations', label: 'Réservations',  icon: Calendar },
  { id: 'messages',     label: 'Messages',      icon: MessageSquare, badge: true },
  { id: 'reviews',      label: 'Avis',          icon: Star },
  { id: 'pricing',      label: 'Tarification',  icon: Tag },
  { id: 'admin',        label: 'Admin Config',  icon: Settings },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const ChannelManager = ({ pmsMode = 'pro' }) => {

  /* ── View & tabs ── */
  const [view, setView]           = useState(localStorage.getItem('channex_token') ? 'main' : 'setup');
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Credentials ── */
  const [channexToken, setChannexToken] = useState(localStorage.getItem('channex_token') || '');
  const [showToken, setShowToken]       = useState(false);
  const [copied, setCopied]             = useState(false);

  /* ── API data ── */
  const [properties, setProperties] = useState([]);
  const [roomTypes, setRoomTypes]   = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [channels, setChannels]     = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [messages, setMessages]     = useState([]);

  /* ── UI ── */
  const [loading, setLoading]         = useState(false);
  const [syncStatus, setSyncStatus]   = useState(localStorage.getItem('channex_token') ? 'idle' : 'disconnected');
  const [apiError, setApiError]       = useState(null);
  const [lastSync, setLastSync]       = useState(null);
  const [importingOTA, setImportingOTA] = useState(null);

  /* ── Messaging ── */
  const [selectedConv, setSelectedConv] = useState(null);
  const [msgText, setMsgText]           = useState('');
  const [sendingMsg, setSendingMsg]     = useState(false);

  /* ── Booking filters ── */
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  /* ── Product detail ── */
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isConnected = ['connected', 'idle'].includes(syncStatus);

  /* ─────────────────────────────────────────────────────────
     FETCH ALL
  ───────────────────────────────────────────────────────── */
  const fetchAll = useCallback(async (token = channexToken) => {
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
      if (bookRes.status === 'fulfilled' && bookRes.value?.data)
        setBookings(bookRes.value.data);
      if (chanRes.status === 'fulfilled' && chanRes.value?.data)
        setChannels(chanRes.value.data);

      /* Room types (produits) per property */
      if (loadedProps.length > 0) {
        const roomResults = await Promise.allSettled(
          loadedProps.map(p => channexAPI.getRoomTypes(token, p.id))
        );
        const allRooms = roomResults.flatMap(r =>
          r.status === 'fulfilled' && r.value?.data ? r.value.data : []
        );
        setRoomTypes(allRooms);
      }

      /* Non-critical */
      const [revRes, msgRes] = await Promise.allSettled([
        channexAPI.getReviews(token),
        channexAPI.getMessages(token),
      ]);
      if (revRes.status === 'fulfilled' && revRes.value?.data) setReviews(revRes.value.data);
      if (msgRes.status === 'fulfilled' && msgRes.value?.data) setMessages(msgRes.value.data);

      setSyncStatus('connected');
      setLastSync(new Date());
    } catch (err) {
      setApiError(err.message || 'Erreur de connexion à Channex.io');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, [channexToken]);

  useEffect(() => {
    if (channexToken && view === 'main') fetchAll();
  }, []);

  const saveAndConnect = async () => {
    if (!channexToken.trim()) return;
    localStorage.setItem('channex_token', channexToken);
    setView('main');
    await fetchAll(channexToken);
    setActiveTab('overview');
  };

  const disconnect = () => {
    localStorage.removeItem('channex_token');
    setChannexToken('');
    setSyncStatus('disconnected');
    setProperties([]); setRoomTypes([]); setBookings([]);
    setChannels([]); setReviews([]); setMessages([]);
    setApiError(null);
    setView('setup');
  };

  const copyToken = () => {
    navigator.clipboard.writeText(channexToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* ─────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────── */
  const getOTAChannels = (otaId) => {
    const ota = OTA_DEFS.find(o => o.id === otaId);
    if (!ota) return [];
    return channels.filter(ch => {
      const name = (ch.attributes?.title || ch.attributes?.name || '').toLowerCase();
      const kind = (ch.attributes?.kind  || ch.attributes?.type  || '').toLowerCase();
      return ota.keywords.some(k => name.includes(k) || kind.includes(k));
    });
  };

  const otaForBooking = (channelName = '') => {
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
    try {
      await channexAPI.sendMessage(channexToken, bookingId, msgText);
      setMsgText('');
    } catch (e) { console.error(e); }
    setSendingMsg(false);
  };

  /* ─────────────────────────────────────────────────────────
     STATUS BADGE
  ───────────────────────────────────────────────────────── */
  const StatusBadge = () => {
    const map = {
      connected:    { color: '#10B981', bg: '#D1FAE5', label: 'Connecté',    pulse: true  },
      syncing:      { color: '#F59E0B', bg: '#FEF3C7', label: 'Sync...',     pulse: true  },
      error:        { color: '#EF4444', bg: '#FEE2E2', label: 'Erreur',      pulse: false },
      disconnected: { color: '#94A3B8', bg: '#F1F5F9', label: 'Déconnecté', pulse: false },
      idle:         { color: '#3B82F6', bg: '#DBEAFE', label: 'Prêt',        pulse: false },
    };
    const s = map[syncStatus] || map.disconnected;
    return (
      <div className="cm-status-badge" style={{ background: s.bg, color: s.color }}>
        <div className={`cm-dot${s.pulse ? ' pulse' : ''}`} style={{ background: s.color }} />
        {s.label}
        {lastSync && (
          <span className="cm-lastsync">
            · {lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════
     SETUP VIEW
  ══════════════════════════════════════════════════════════ */
  if (view === 'setup') {
    return (
      <div className="cm-wrapper">
        <div className="cm-setup-page">

          {/* Header */}
          <div className="cm-setup-topbar">
            <div className="cm-setup-topbar-logo"><Share2 size={22} /></div>
            <div>
              <h1>Channel Manager</h1>
              <p>Connectez Channex.io pour synchroniser tous vos OTAs en temps réel</p>
            </div>
          </div>

          {/* Body: form + OTAs side by side */}
          <div className="cm-setup-body">

            {/* ── LEFT: Channex config ── */}
            <div className="cm-setup-form-card">
              <div className="cm-setup-form-head">
                <div className="cm-setup-form-icon"><Server size={20} /></div>
                <div>
                  <h2>Connexion Channex.io</h2>
                  <p>Hub central multi-OTA</p>
                </div>
              </div>

              <p className="cm-setup-form-desc">
                Channex.io synchronise vos réservations, disponibilités et tarifs sur tous
                vos canaux depuis une seule interface. Entrez votre clé API pour démarrer.
              </p>

              {apiError && (
                <div className="cm-setup-err-banner">
                  <AlertCircle size={14} />
                  <span>{apiError}</span>
                  <button onClick={() => setApiError(null)}><X size={12} /></button>
                </div>
              )}

              <div className="cm-setup-field-group">
                <label>Clé API Channex.io</label>
                <div className="cm-setup-input-wrap">
                  <Key size={14} className="cm-setup-input-icon" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={channexToken}
                    onChange={e => setChannexToken(e.target.value)}
                    placeholder="Collez votre clé API ici..."
                    onKeyDown={e => e.key === 'Enter' && saveAndConnect()}
                  />
                  <button className="cm-setup-eye-btn" onClick={() => setShowToken(v => !v)}>
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="cm-setup-field-hint">
                  <HelpCircle size={11} />
                  Channex.io → Settings → API Keys → Copier la clé
                </div>
              </div>

              <div className="cm-setup-api-info">
                <div className="cm-setup-info-row"><Globe size={12} /><code>app.channex.io/api/v1</code></div>
                <div className="cm-setup-info-row"><Shield size={12} />Chiffrement TLS 1.3</div>
                <div className="cm-setup-info-row">
                  <ExternalLink size={12} />
                  <a href="https://docs.channex.io" target="_blank" rel="noreferrer">Documentation officielle</a>
                </div>
              </div>

              <button
                className="cm-setup-connect-btn"
                onClick={saveAndConnect}
                disabled={loading || !channexToken.trim()}
              >
                {loading
                  ? <><RefreshCcw size={16} className="cm-spin" /> Connexion en cours...</>
                  : <><Wifi size={16} /> Connecter & Importer les données</>
                }
              </button>
            </div>

            {/* ── RIGHT: OTA preview ── */}
            <div className="cm-setup-otas-panel">
              <div className="cm-setup-otas-header">
                <h3>Centrales disponibles via Channex.io</h3>
                <p>Gérez toutes ces plateformes depuis un seul tableau de bord</p>
              </div>

              <div className="cm-setup-otas-grid">
                {OTA_DEFS.map(ota => (
                  <div key={ota.id} className="cm-setup-ota-chip" style={{ background: ota.bg, borderColor: ota.color + '30' }}>
                    <span className="cm-setup-ota-logo">{ota.logo}</span>
                    <div>
                      <span className="cm-setup-ota-name" style={{ color: ota.color }}>{ota.name}</span>
                      <span className="cm-setup-ota-desc">{ota.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cm-setup-features-grid">
                {[
                  { icon: Calendar,      text: 'Réservations en temps réel' },
                  { icon: Tag,           text: 'Tarification centralisée' },
                  { icon: MessageSquare, text: 'Messagerie unifiée' },
                  { icon: Star,          text: 'Centralisation des avis' },
                  { icon: Layers,        text: 'Import auto des produits' },
                  { icon: Zap,           text: 'Workflows automatisés' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="cm-setup-feature">
                    <div className="cm-setup-feature-icon"><Icon size={13} /></div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════
     MAIN VIEW
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="cm-wrapper">

      {/* ── HEADER ── */}
      <div className="cm-header">
        <div className="cm-header-left">
          <div className="cm-logo-icon"><Share2 size={22} /></div>
          <div>
            <h1 className="cm-title">Channel Manager</h1>
            <p className="cm-subtitle">
              Channex.io · {properties.length} propriété{properties.length !== 1 ? 's' : ''}
              · {channels.length} canal{channels.length !== 1 ? 'aux' : ''}
              · {roomTypes.length} produit{roomTypes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="cm-header-right">
          <StatusBadge />
          <button className="cm-btn-icon" onClick={() => fetchAll()} disabled={loading} title="Rafraîchir">
            <RefreshCcw size={17} className={loading ? 'cm-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {apiError && (
        <div className="cm-error-banner">
          <AlertCircle size={14} />
          <span>{apiError}</span>
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
            {tab.badge && messages.length > 0 && (
              <span className="cm-tab-badge">{messages.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="cm-content">

        {/* ────────────────────────── OVERVIEW ────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="cm-section">
            <div className="cm-metrics-grid">
              {[
                { title: 'Canaux OTA',   val: channels.length   || '—', sub: 'connectés via Hub',        icon: Share2,       color: '#6366F1' },
                { title: 'Propriétés',   val: properties.length || '—', sub: `${roomTypes.length} produits`,icon: Building2,   color: '#10B981' },
                { title: 'Réservations', val: bookings.length   || '—', sub: 'toutes sources',            icon: Calendar,     color: '#F59E0B' },
                { title: 'Messages',     val: messages.length   || '—', sub: 'conversations',             icon: MessageSquare,color: '#3B82F6' },
              ].map((m, i) => (
                <div key={i} className="cm-metric-card">
                  <div className="cm-metric-icon" style={{ background: m.color + '15', color: m.color }}><m.icon size={18} /></div>
                  <div className="cm-metric-title">{m.title}</div>
                  <div className="cm-metric-value">{m.val}</div>
                  <div className="cm-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>

            {!isConnected && (
              <div className="cm-connect-cta">
                <div className="cm-cta-icon"><Wifi size={32} /></div>
                <h3>Connectez Channex.io pour démarrer</h3>
                <p>Configurez votre clé API pour activer la synchronisation en temps réel.</p>
                <button className="cm-btn-primary" onClick={() => setView('setup')}>
                  <Settings size={15} /> Configurer l'API
                </button>
              </div>
            )}

            {isConnected && (
              <>
                {/* OTA Quick Status */}
                <div className="cm-card">
                  <div className="cm-card-header">
                    <h3><Globe size={15} /> Statut des Canaux</h3>
                    <button className="cm-btn-sm" onClick={() => setActiveTab('otas')}>
                      Voir tout <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="cm-ota-quick-list">
                    {OTA_DEFS.map(ota => {
                      const linked = getOTAChannels(ota.id);
                      return (
                        <div key={ota.id} className="cm-ota-quick-row">
                          <div className="cm-ota-quick-logo" style={{ background: ota.bg }}>{ota.logo}</div>
                          <div className="cm-ota-quick-name">{ota.name}</div>
                          <div className="cm-ota-quick-bookings">
                            {bookings.filter(b => ota.keywords.some(k =>
                              (b.attributes?.channel_name || '').toLowerCase().includes(k)
                            )).length} rés.
                          </div>
                          {linked.length > 0
                            ? <span className="cm-badge-active cm-badge-xs"><Check size={9} /> Actif</span>
                            : <span className="cm-badge-inactive cm-badge-xs">Non lié</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Properties */}
                {properties.length > 0 && (
                  <div className="cm-card">
                    <div className="cm-card-header">
                      <h3><Building2 size={15} /> Propriétés synchronisées</h3>
                      <span className="cm-tag-count">{properties.length} total</span>
                    </div>
                    <div className="cm-property-list">
                      {properties.map(prop => (
                        <div key={prop.id} className="cm-property-item">
                          <div className="cm-property-avatar"><Building2 size={15} /></div>
                          <div className="cm-property-info">
                            <strong>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</strong>
                            <span>{prop.attributes?.currency || 'EUR'} · {prop.attributes?.timezone || 'Europe/Paris'}</span>
                          </div>
                          <div className="cm-property-rooms">
                            {roomTypes.filter(r => r.attributes?.property_id === prop.id).length} produits
                          </div>
                          <div className="cm-property-status">
                            <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                            <span>Live</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ────────────────────────── CANAUX OTA ────────────────────────── */}
        {activeTab === 'otas' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <div>
                <h2>Réseau de Distribution OTA</h2>
                <p>Centrales de réservation connectées via Channex.io</p>
              </div>
              <button className="cm-btn-primary cm-btn-sm" onClick={() => fetchAll()}>
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>

            <div className="cm-ota-cards-grid">
              {OTA_DEFS.map(ota => {
                const linked = getOTAChannels(ota.id);
                const isLinked = linked.length > 0;
                const otaBookings = bookings.filter(b =>
                  ota.keywords.some(k => (b.attributes?.channel_name || '').toLowerCase().includes(k))
                );
                return (
                  <div key={ota.id} className={`cm-ota-full-card${isLinked ? ' linked' : ''}`}>
                    <div className="cm-ota-full-head" style={{ background: ota.bg }}>
                      <span className="cm-ota-full-logo">{ota.logo}</span>
                      <div className="cm-ota-full-identity">
                        <span className="cm-ota-full-name" style={{ color: ota.color }}>{ota.name}</span>
                        <span className="cm-ota-full-desc">{ota.desc}</span>
                      </div>
                      {isLinked && (
                        <div className="cm-ota-full-live">
                          <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                          <span>Actif</span>
                        </div>
                      )}
                    </div>

                    <div className="cm-ota-full-body">
                      {isLinked ? (
                        <>
                          <div className="cm-ota-stats-row">
                            <div className="cm-ota-stat">
                              <span className="cm-ota-stat-val">{linked.length}</span>
                              <span className="cm-ota-stat-lbl">canal{linked.length > 1 ? 'aux' : ''}</span>
                            </div>
                            <div className="cm-ota-stat">
                              <span className="cm-ota-stat-val">{roomTypes.length}</span>
                              <span className="cm-ota-stat-lbl">produits</span>
                            </div>
                            <div className="cm-ota-stat">
                              <span className="cm-ota-stat-val">{otaBookings.length}</span>
                              <span className="cm-ota-stat-lbl">réservations</span>
                            </div>
                          </div>

                          <div className="cm-ota-ch-list">
                            {linked.map(ch => (
                              <div key={ch.id} className="cm-ota-ch-row">
                                <div className="cm-dot" style={{ background: '#10B981' }} />
                                <span>{ch.attributes?.title || ch.attributes?.name}</span>
                                <span className="cm-ota-ch-kind">{ch.attributes?.kind || ch.attributes?.type || 'OTA'}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            className="cm-ota-import-btn"
                            disabled={importingOTA === ota.id || loading}
                            onClick={async () => {
                              setImportingOTA(ota.id);
                              await fetchAll();
                              setImportingOTA(null);
                            }}
                          >
                            {importingOTA === ota.id
                              ? <><RefreshCw size={13} className="cm-spin" /> Import en cours...</>
                              : <><DownloadCloud size={13} /> Importer les produits</>
                            }
                          </button>
                        </>
                      ) : (
                        <div className="cm-ota-not-linked">
                          <div className="cm-ota-not-linked-icon"><Wifi size={20} className="cm-icon-muted" /></div>
                          <p>Canal non configuré</p>
                          <span>Activez ce canal dans votre compte Channex.io</span>
                          <a href="https://app.channex.io" target="_blank" rel="noreferrer" className="cm-ota-ext-link">
                            Configurer sur Channex <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────────────────────── PRODUITS ────────────────────────── */}
        {activeTab === 'products' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <div>
                <h2>Produits Importés</h2>
                <p>
                  {roomTypes.length} produit{roomTypes.length !== 1 ? 's' : ''} sur{' '}
                  {properties.length} propriété{properties.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="cm-btn-primary cm-btn-sm" onClick={() => fetchAll()}>
                <DownloadCloud size={13} /> Synchroniser
              </button>
            </div>

            {roomTypes.length === 0 ? (
              <div className="cm-empty-state">
                <Layers size={40} />
                <h3>{isConnected ? 'Aucun produit importé' : 'API non connectée'}</h3>
                <p>
                  {isConnected
                    ? 'Ajoutez des types de chambre dans Channex.io pour les importer.'
                    : 'Connectez Channex.io pour importer vos produits.'}
                </p>
                {!isConnected && (
                  <button className="cm-btn-primary" onClick={() => setView('setup')}>
                    <Settings size={14} /> Configurer
                  </button>
                )}
              </div>
            ) : (
              <>
                {properties.map(prop => {
                  const propRooms = roomTypes.filter(r => r.attributes?.property_id === prop.id);
                  if (!propRooms.length) return null;
                  return (
                    <div key={prop.id} className="cm-prop-group">
                      <div className="cm-prop-group-header">
                        <Building2 size={14} />
                        <h3>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</h3>
                        <span className="cm-tag-count">{propRooms.length} produits</span>
                        <span className="cm-prop-currency">{prop.attributes?.currency || 'EUR'}</span>
                      </div>
                      <div className="cm-products-grid">
                        {propRooms.map(room => {
                          const isSelected = selectedProduct?.id === room.id;
                          return (
                            <div
                              key={room.id}
                              className={`cm-product-card${isSelected ? ' selected' : ''}`}
                              onClick={() => setSelectedProduct(isSelected ? null : room)}
                            >
                              <div className="cm-product-head">
                                <div className="cm-product-icon"><Home size={15} /></div>
                                <div className="cm-product-identity">
                                  <strong>{room.attributes?.title || room.attributes?.name || 'Chambre'}</strong>
                                  <span>
                                    {room.attributes?.rooms_count || 1} unité
                                    {(room.attributes?.rooms_count || 1) > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="cm-dot pulse" style={{ background: '#10B981' }} />
                              </div>
                              <div className="cm-product-metas">
                                <span className="cm-product-meta-chip">
                                  <Users size={10} />
                                  {room.attributes?.default_occupancy || room.attributes?.max_occupancy || '?'} pers.
                                </span>
                                <span className="cm-product-meta-chip">
                                  <DollarSign size={10} />
                                  {prop.attributes?.currency || 'EUR'}
                                </span>
                                {channels.length > 0 && (
                                  <span className="cm-product-meta-chip cm-chip-active">
                                    {channels.length} OTA
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <div className="cm-product-detail">
                                  <div className="cm-product-detail-row">
                                    <span>ID Channex</span>
                                    <code>{room.id}</code>
                                  </div>
                                  {room.attributes?.description && (
                                    <div className="cm-product-detail-row cm-detail-full">
                                      <span>Description</span>
                                      <span>{room.attributes.description.slice(0, 120)}{room.attributes.description.length > 120 ? '…' : ''}</span>
                                    </div>
                                  )}
                                  <div className="cm-product-detail-actions">
                                    <button className="cm-btn-sm" onClick={e => e.stopPropagation()}>
                                      <Tag size={11} /> Gérer les tarifs
                                    </button>
                                    <button className="cm-btn-sm" onClick={e => e.stopPropagation()}>
                                      <Calendar size={11} /> Disponibilités
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Orphaned rooms */}
                {(() => {
                  const orphaned = roomTypes.filter(r =>
                    !properties.some(p => p.id === r.attributes?.property_id)
                  );
                  if (!orphaned.length) return null;
                  return (
                    <div className="cm-prop-group">
                      <div className="cm-prop-group-header">
                        <Layers size={14} />
                        <h3>Autres produits</h3>
                        <span className="cm-tag-count">{orphaned.length}</span>
                      </div>
                      <div className="cm-products-grid">
                        {orphaned.map(room => (
                          <div key={room.id} className="cm-product-card">
                            <div className="cm-product-head">
                              <div className="cm-product-icon"><Home size={15} /></div>
                              <strong>{room.attributes?.title || 'Produit'}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ────────────────────────── RÉSERVATIONS ────────────────────────── */}
        {activeTab === 'reservations' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réservations synchronisées</h2>
              <div className="cm-filter-bar">
                <div className="cm-search-box">
                  <Search size={14} />
                  <input
                    placeholder="Voyageur, canal..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                  />
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
                <h3>{isConnected ? 'Aucune réservation trouvée' : 'API non connectée'}</h3>
                <p>
                  {isConnected
                    ? 'Aucune réservation ne correspond aux filtres.'
                    : 'Connectez Channex.io pour recevoir les réservations.'}
                </p>
              </div>
            ) : (
              <div className="cm-booking-list">
                {filteredBookings.map(booking => {
                  const attr    = booking.attributes || {};
                  const customer = attr.customer || {};
                  const statusColor = { confirmed: '#10B981', cancelled: '#EF4444', modified: '#F59E0B' }[attr.status] || '#94A3B8';
                  const ota     = otaForBooking(attr.channel_name);
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
                            ? <span className="cm-booking-channel" style={{ color: ota.color, background: ota.bg }}>
                                {ota.logo} {ota.name}
                              </span>
                            : attr.channel_name && <span className="cm-booking-channel">{attr.channel_name}</span>
                          }
                        </div>
                        {customer.email && <div className="cm-booking-contact">{customer.email}</div>}
                      </div>
                      <div className="cm-booking-right">
                        <div className="cm-booking-amount">
                          {attr.amount ? `${attr.amount} ${attr.currency || 'EUR'}` : '—'}
                        </div>
                        <div className="cm-booking-status" style={{ background: statusColor + '15', color: statusColor }}>
                          {attr.status || 'confirmée'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────── MESSAGES ────────────────────────── */}
        {activeTab === 'messages' && (
          <div className="cm-messenger">
            <div className="cm-msg-sidebar">
              <div className="cm-msg-sidebar-header">
                <h3>Inbox Unifié</h3>
                <span className="cm-tag-count">{messages.length}</span>
              </div>
              <div className="cm-msg-list">
                {messages.length === 0 ? (
                  <div className="cm-msg-empty">
                    {isConnected ? 'Aucun message' : 'API non connectée'}
                  </div>
                ) : messages.map(msg => {
                  const attr = msg.attributes || {};
                  const ota  = otaForBooking(attr.channel_name);
                  return (
                    <div
                      key={msg.id}
                      className={`cm-msg-item${selectedConv?.id === msg.id ? ' active' : ''}`}
                      onClick={() => setSelectedConv(msg)}
                    >
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
                    <input
                      placeholder="Votre réponse..."
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage(selectedConv.attributes?.booking_id)}
                    />
                    <button
                      className="cm-send-btn"
                      onClick={() => handleSendMessage(selectedConv.attributes?.booking_id)}
                      disabled={sendingMsg || !msgText.trim()}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="cm-msg-placeholder">
                  <MessageSquare size={40} />
                  <p>Sélectionnez une conversation</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ────────────────────────── AVIS ────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réputation & Avis</h2>
              <div className="cm-global-score">
                <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                Score global : {reviews.length > 0
                  ? (reviews.reduce((s, r) => s + (r.attributes?.score || 0), 0) / reviews.length).toFixed(1)
                  : '—'}/5
              </div>
            </div>
            {reviews.length === 0 ? (
              <div className="cm-empty-state">
                <Star size={40} />
                <h3>{isConnected ? 'Aucun avis reçu' : 'API non connectée'}</h3>
                <p>{isConnected ? 'Les avis apparaîtront ici dès réception.' : 'Connectez Channex.io pour centraliser les avis.'}</p>
              </div>
            ) : (
              <div className="cm-reviews-list">
                {reviews.map(review => {
                  const attr = review.attributes || {};
                  const ota  = otaForBooking(attr.channel_name);
                  return (
                    <div key={review.id} className="cm-review-card">
                      <div className="cm-review-header">
                        <div className="cm-review-guest">
                          <div className="cm-review-avatar">{(attr.reviewer_name || 'G')[0]}</div>
                          <div>
                            <strong>{attr.reviewer_name || 'Voyageur'}</strong>
                            {ota
                              ? <span className="cm-review-channel" style={{ color: ota.color }}>{ota.logo} {ota.name}</span>
                              : <span>{attr.channel_name}</span>
                            }
                          </div>
                        </div>
                        <div className="cm-review-score">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={13} style={{
                              color: i <= (attr.score || 0) ? '#F59E0B' : '#E2E8F0',
                              fill: i <= (attr.score || 0) ? '#F59E0B' : 'none'
                            }} />
                          ))}
                        </div>
                      </div>
                      <p className="cm-review-text">{attr.review_text || attr.comment || 'Pas de commentaire.'}</p>
                      {attr.reply && (
                        <div className="cm-review-reply"><strong>Votre réponse :</strong> {attr.reply}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ────────────────────────── TARIFICATION ────────────────────────── */}
        {activeTab === 'pricing' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Règles de Tarification</h2>
              <button className="cm-btn-primary cm-btn-sm" onClick={() => fetchAll()}>
                <RefreshCw size={13} /> Actualiser
              </button>
            </div>
            <div className="cm-card">
              <div className="cm-card-header"><h3><Zap size={15} /> Règles Dynamiques</h3></div>
              <div className="cm-automation-list">
                {[
                  { name: 'Tarif Weekend +15%',  active: true,  desc: 'Vendredi & Samedi automatique' },
                  { name: 'Haute Saison +25%',   active: true,  desc: 'Juillet – Août' },
                  { name: 'Last Minute -10%',    active: false, desc: '48h avant arrivée' },
                  { name: 'Early Bird -8%',      active: false, desc: '90 jours à l\'avance' },
                  { name: 'Taux Occup. Élevé +20%', active: true, desc: '> 85% d\'occupation' },
                ].map((rule, i) => (
                  <div key={i} className="cm-auto-item">
                    <div className="cm-auto-item-info">
                      <strong>{rule.name}</strong>
                      <span>{rule.desc}</span>
                    </div>
                    <div className={`cm-toggle ${rule.active ? 'on' : 'off'}`}>
                      <div className="cm-toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cm-card" style={{ marginTop: '14px' }}>
              <div className="cm-card-header"><h3><TrendingUp size={15} /> Automatisations</h3></div>
              <div className="cm-automation-list">
                {[
                  { name: 'Check-In Automatique',    active: true,  desc: 'Code PIN 24h avant arrivée', icon: Lock },
                  { name: 'Collecte d\'Avis',        active: true,  desc: 'Demande 2h après départ',    icon: Star },
                  { name: 'Message de Bienvenue',    active: true,  desc: 'À la confirmation',           icon: MessageSquare },
                  { name: 'Sync Inventaire',         active: true,  desc: 'Ferme dispo sur tous OTAs',  icon: Layers },
                  { name: 'Alerte Batterie Serrure', active: false, desc: 'Batterie < 20%',              icon: Bell },
                ].map((auto, i) => (
                  <div key={i} className="cm-auto-item">
                    <div className="cm-auto-item-info">
                      <strong>{auto.name}</strong>
                      <span>{auto.desc}</span>
                    </div>
                    <div className={`cm-toggle ${auto.active ? 'on' : 'off'}`}>
                      <div className="cm-toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ────────────────────────── ADMIN CONFIG ────────────────────────── */}
        {activeTab === 'admin' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Administration & Configuration</h2>
              <p>Connexions API, canaux OTA et paramètres avancés</p>
            </div>

            {/* Channex API */}
            <div className="cm-admin-block">
              <div className="cm-admin-block-head">
                <div className="cm-admin-block-icon"><Server size={18} /></div>
                <div className="cm-admin-block-title">
                  <h3>Channex.io API</h3>
                  <p>Hub central de distribution multi-OTA</p>
                </div>
                <StatusBadge />
              </div>

              {syncStatus === 'connected' && (
                <div className="cm-success-banner">
                  <CheckCircle2 size={15} />
                  <span>
                    API connectée — {properties.length} propriété{properties.length !== 1 ? 's' : ''},
                    {' '}{roomTypes.length} produit{roomTypes.length !== 1 ? 's' : ''},
                    {' '}{channels.length} canal{channels.length !== 1 ? 'aux' : ''}
                  </span>
                </div>
              )}
              {apiError && syncStatus === 'error' && (
                <div className="cm-error-inline"><AlertCircle size={14} /><span>{apiError}</span></div>
              )}

              <div className="cm-config-field">
                <label>Clé API</label>
                <div className="cm-token-input-wrap">
                  <Key size={14} className="cm-input-icon" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={channexToken}
                    onChange={e => setChannexToken(e.target.value)}
                    placeholder="Clé API Channex.io..."
                    className="cm-input"
                    onKeyDown={e => e.key === 'Enter' && saveAndConnect()}
                  />
                  <button className="cm-input-action" onClick={() => setShowToken(v => !v)}>
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  {channexToken && (
                    <button className="cm-input-action" onClick={copyToken}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="cm-config-info">
                <div className="cm-info-item"><Globe size={12} /> Endpoint : <code>app.channex.io/api/v1</code></div>
                <div className="cm-info-item"><Shield size={12} /> Chiffrement TLS 1.3</div>
                <div className="cm-info-item">
                  <ExternalLink size={12} />
                  <a href="https://docs.channex.io" target="_blank" rel="noreferrer">Documentation Channex.io</a>
                </div>
              </div>

              <div className="cm-config-actions">
                <button className="cm-btn-primary" onClick={saveAndConnect} disabled={loading || !channexToken.trim()}>
                  {loading
                    ? <><RefreshCcw size={14} className="cm-spin" /> Sync...</>
                    : <><Wifi size={14} /> Reconnecter & Synchroniser</>
                  }
                </button>
                <button className="cm-btn-danger" onClick={disconnect}>
                  <WifiOff size={14} /> Déconnecter
                </button>
              </div>
            </div>

            {/* OTA Channels status */}
            <div className="cm-admin-block">
              <div className="cm-admin-block-head">
                <div className="cm-admin-block-icon"><Globe size={18} /></div>
                <div className="cm-admin-block-title">
                  <h3>Canaux OTA</h3>
                  <p>Centrales de réservation configurées dans Channex.io</p>
                </div>
              </div>
              <div className="cm-admin-ota-table">
                {OTA_DEFS.map(ota => {
                  const linked = getOTAChannels(ota.id);
                  return (
                    <div key={ota.id} className="cm-admin-ota-row">
                      <div className="cm-admin-ota-logo" style={{ background: ota.bg }}>{ota.logo}</div>
                      <div className="cm-admin-ota-info">
                        <strong style={{ color: ota.color }}>{ota.name}</strong>
                        <span>{ota.desc}</span>
                      </div>
                      <div className="cm-admin-ota-status">
                        {linked.length > 0
                          ? <span className="cm-badge-active"><Check size={10} /> {linked.length} canal{linked.length > 1 ? 'aux' : ''}</span>
                          : <span className="cm-badge-inactive">Non configuré</span>
                        }
                        {linked.length === 0 && (
                          <a href="https://app.channex.io" target="_blank" rel="noreferrer" className="cm-admin-ext-btn">
                            <ExternalLink size={11} /> Configurer
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Properties */}
            {properties.length > 0 && (
              <div className="cm-admin-block">
                <div className="cm-admin-block-head">
                  <div className="cm-admin-block-icon"><Building2 size={18} /></div>
                  <div className="cm-admin-block-title">
                    <h3>Propriétés synchronisées</h3>
                    <p>Issues de votre compte Channex.io</p>
                  </div>
                </div>
                <div className="cm-admin-prop-list">
                  {properties.map(prop => (
                    <div key={prop.id} className="cm-admin-prop-row">
                      <div className="cm-admin-prop-icon"><Building2 size={13} /></div>
                      <div className="cm-admin-prop-info">
                        <strong>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</strong>
                        <span>
                          ID: {prop.id.slice(0, 14)}… ·
                          {' '}{prop.attributes?.currency || 'EUR'} ·
                          {' '}{prop.attributes?.timezone || 'Europe/Paris'}
                        </span>
                      </div>
                      <span className="cm-tag-count">
                        {roomTypes.filter(r => r.attributes?.property_id === prop.id).length} produits
                      </span>
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
