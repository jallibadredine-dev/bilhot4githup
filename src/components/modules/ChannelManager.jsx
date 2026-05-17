import React, { useState, useEffect, useCallback } from 'react';
import {
  Database, Globe, Link as LinkIcon, Settings, Server, CheckCircle2,
  ArrowRight, RefreshCcw, Home, Plus, Calendar, Activity,
  MessageSquare, Star, Share2, ShieldCheck,
  AlertCircle, ChevronRight, DownloadCloud, XCircle, Tag,
  Zap, Key, Shield, FileText, Bell, Lock, Eye, EyeOff,
  Search, Filter, Wifi, WifiOff, ChevronDown, X, Send,
  BarChart3, TrendingUp, Users, DollarSign, ExternalLink,
  Copy, Check, RefreshCw, Building2, Layers
} from 'lucide-react';
import { channexAPI } from '../../lib/channex';
import './ChannelManager.css';

const OTAS = [
  { id: 'airbnb', name: 'Airbnb', color: '#FF5A5F', bg: '#FFF0F0', icon: 'A', desc: 'Short-Term Rentals' },
  { id: 'booking', name: 'Booking.com', color: '#003580', bg: '#E8F0FF', icon: 'B', desc: 'Global Hotel Standard' },
  { id: 'expedia', name: 'Expedia', color: '#FFC72C', bg: '#FFF8E0', icon: 'E', desc: 'Flights & Stays' },
  { id: 'tripadvisor', name: 'TripAdvisor', color: '#00AA6C', bg: '#E0F7EE', icon: 'T', desc: 'Reviews & Bookings' },
  { id: 'vrbo', name: 'Vrbo', color: '#1B468A', bg: '#E8EEFF', icon: 'V', desc: 'Villas & Large Stays' },
  { id: 'agoda', name: 'Agoda', color: '#E0113A', bg: '#FFE8EC', icon: 'Ag', desc: 'Asian Market' },
  { id: 'google', name: 'Google Hotels', color: '#EA4335', bg: '#FFE8E8', icon: 'G', desc: 'Search Engine' },
];

const TABS = [
  { id: 'overview', label: 'Dashboard', icon: Activity },
  { id: 'channels', label: 'Canaux OTA', icon: Globe },
  { id: 'reservations', label: 'Réservations', icon: Calendar },
  { id: 'messenger', label: 'Messages', icon: MessageSquare },
  { id: 'reviews', label: 'Avis', icon: Star },
  { id: 'pricing', label: 'Tarification', icon: Tag },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'config', label: 'API Config', icon: Settings },
];

const ChannelManager = ({ pmsMode = 'pro' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Credentials
  const [channexToken, setChannexToken] = useState(localStorage.getItem('channex_token') || '');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  // API data
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ratePlans, setRatePlans] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(localStorage.getItem('channex_token') ? 'idle' : 'disconnected');
  const [apiError, setApiError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Messaging
  const [selectedConv, setSelectedConv] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Booking filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  const isConnected = syncStatus === 'connected' || syncStatus === 'idle';

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

      if (propRes.status === 'fulfilled' && propRes.value?.data) {
        setProperties(propRes.value.data);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value?.data) {
        setBookings(bookRes.value.data);
      }
      if (chanRes.status === 'fulfilled' && chanRes.value?.data) {
        setChannels(chanRes.value.data);
      }

      // Fetch reviews & messages (non-critical)
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
    if (channexToken) fetchAll();
  }, []);

  const saveAndConnect = async () => {
    if (!channexToken.trim()) return;
    localStorage.setItem('channex_token', channexToken);
    await fetchAll(channexToken);
  };

  const disconnect = () => {
    localStorage.removeItem('channex_token');
    setChannexToken('');
    setSyncStatus('disconnected');
    setProperties([]); setBookings([]); setChannels([]);
    setReviews([]); setMessages([]);
    setApiError(null);
  };

  const handleSendMessage = async (bookingId) => {
    if (!msgText.trim() || !bookingId) return;
    setSendingMsg(true);
    try {
      await channexAPI.sendMessage(channexToken, bookingId, msgText);
      setMsgText('');
    } catch (e) {
      console.error(e);
    }
    setSendingMsg(false);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(channexToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const filteredBookings = bookings.filter(b => {
    const name = b.attributes?.customer?.name?.toLowerCase() || '';
    const channel = b.attributes?.channel_name?.toLowerCase() || '';
    const status = b.attributes?.status?.toLowerCase() || '';
    const search = bookingSearch.toLowerCase();
    const matchSearch = !search || name.includes(search) || channel.includes(search);
    const matchFilter = bookingFilter === 'all' || status === bookingFilter;
    return matchSearch && matchFilter;
  });

  // ── STATUS BADGE ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    const map = {
      connected: { color: '#10B981', bg: '#D1FAE5', label: 'Connecté', pulse: true },
      syncing: { color: '#F59E0B', bg: '#FEF3C7', label: 'Sync...', pulse: true },
      error: { color: '#EF4444', bg: '#FEE2E2', label: 'Erreur', pulse: false },
      disconnected: { color: '#94A3B8', bg: '#F1F5F9', label: 'Déconnecté', pulse: false },
      idle: { color: '#3B82F6', bg: '#DBEAFE', label: 'Prêt', pulse: false },
    };
    const s = map[syncStatus] || map.disconnected;
    return (
      <div className="cm-status-badge" style={{ background: s.bg, color: s.color }}>
        <div className={`cm-dot ${s.pulse ? 'pulse' : ''}`} style={{ background: s.color }} />
        {s.label}
        {lastSync && <span className="cm-lastsync">· {lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
    );
  };

  // ── METRIC CARD ──────────────────────────────────────────────────────────
  const MetricCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="cm-metric-card">
      <div className="cm-metric-icon" style={{ background: color + '15', color }}><Icon size={20} /></div>
      <div className="cm-metric-title">{title}</div>
      <div className="cm-metric-value">{value}</div>
      <div className="cm-metric-sub">{sub}</div>
    </div>
  );

  return (
    <div className="cm-wrapper">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="cm-header">
        <div className="cm-header-left">
          <div className="cm-logo-icon"><Share2 size={22} /></div>
          <div>
            <h1 className="cm-title">Channel Manager</h1>
            <p className="cm-subtitle">Distribution globale via Channex.io · {properties.length} propriété{properties.length !== 1 ? 's' : ''} synchronisée{properties.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="cm-header-right">
          <StatusBadge />
          <button className="cm-btn-icon" onClick={() => fetchAll()} disabled={loading || !channexToken} title="Rafraîchir">
            <RefreshCcw size={18} className={loading ? 'cm-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── API ERROR BANNER ─────────────────────────────────────────── */}
      {apiError && (
        <div className="cm-error-banner">
          <AlertCircle size={16} />
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <div className="cm-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`cm-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────── */}
      <div className="cm-content">

        {/* ── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="cm-section">
            <div className="cm-metrics-grid">
              <MetricCard title="Canaux actifs" value={channels.length || '—'} sub="connectés via Hub" icon={Share2} color="#6366F1" />
              <MetricCard title="Propriétés" value={properties.length || '—'} sub="synchronisées" icon={Building2} color="#10B981" />
              <MetricCard title="Réservations" value={bookings.length || '—'} sub="reçues du Hub" icon={Calendar} color="#F59E0B" />
              <MetricCard title="Messages" value={messages.length || '—'} sub="conversations ouvertes" icon={MessageSquare} color="#3B82F6" />
            </div>

            {!isConnected && (
              <div className="cm-connect-cta">
                <div className="cm-cta-icon"><Wifi size={32} /></div>
                <h3>Connectez Channex.io pour démarrer</h3>
                <p>Configurez votre clé API pour activer la synchronisation en temps réel avec vos OTAs.</p>
                <button className="cm-btn-primary" onClick={() => setActiveTab('config')}>
                  <Settings size={16} /> Configurer l'API
                </button>
              </div>
            )}

            {isConnected && properties.length > 0 && (
              <div className="cm-card">
                <div className="cm-card-header">
                  <h3><Activity size={18} /> Propriétés synchronisées</h3>
                  <span className="cm-tag-count">{properties.length} total</span>
                </div>
                <div className="cm-property-list">
                  {properties.map(prop => (
                    <div key={prop.id} className="cm-property-item">
                      <div className="cm-property-avatar"><Building2 size={18} /></div>
                      <div className="cm-property-info">
                        <strong>{prop.attributes?.title || prop.attributes?.name || 'Propriété'}</strong>
                        <span>{prop.attributes?.currency} · {prop.attributes?.timezone}</span>
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
          </div>
        )}

        {/* ── CANAUX OTA ─── */}
        {activeTab === 'channels' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réseau de Distribution</h2>
              <p>Gérez vos connexions OTA via Channex.io</p>
            </div>

            {channels.length > 0 && (
              <div className="cm-card" style={{ marginBottom: '1.5rem' }}>
                <div className="cm-card-header"><h3><Wifi size={16} /> Canaux actifs ({channels.length})</h3></div>
                <div className="cm-channel-list">
                  {channels.map(ch => (
                    <div key={ch.id} className="cm-channel-row">
                      <div className="cm-channel-dot" style={{ background: '#10B981' }} />
                      <strong>{ch.attributes?.title || ch.attributes?.name || 'Canal'}</strong>
                      <span className="cm-channel-type">{ch.attributes?.type || 'OTA'}</span>
                      <div className="cm-channel-sync">
                        <Check size={13} /> Actif
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="cm-ota-grid">
              {OTAS.map(ota => (
                <div key={ota.id} className="cm-ota-card">
                  <div className="cm-ota-icon" style={{ background: ota.bg, color: ota.color }}>{ota.icon}</div>
                  <div className="cm-ota-info">
                    <h4>{ota.name}</h4>
                    <p>{ota.desc}</p>
                  </div>
                  <div className="cm-ota-status">
                    {channels.some(c => c.attributes?.title?.toLowerCase().includes(ota.id) || c.attributes?.type?.toLowerCase().includes(ota.id)) ? (
                      <span className="cm-badge-active"><Check size={11} /> Connecté</span>
                    ) : (
                      <span className="cm-badge-inactive">Via Hub</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RÉSERVATIONS ─── */}
        {activeTab === 'reservations' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réservations synchronisées</h2>
              <div className="cm-filter-bar">
                <div className="cm-search-box">
                  <Search size={15} />
                  <input placeholder="Rechercher..." value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} />
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
                <p>{isConnected ? 'Aucune réservation ne correspond à vos filtres.' : 'Configurez Channex.io pour recevoir les réservations.'}</p>
                {!isConnected && <button className="cm-btn-primary" onClick={() => setActiveTab('config')}><Settings size={14} /> Configurer</button>}
              </div>
            ) : (
              <div className="cm-booking-list">
                {filteredBookings.map(booking => {
                  const attr = booking.attributes || {};
                  const customer = attr.customer || {};
                  const statusColor = { confirmed: '#10B981', cancelled: '#EF4444', modified: '#F59E0B' }[attr.status] || '#94A3B8';
                  return (
                    <div key={booking.id} className="cm-booking-card">
                      <div className="cm-booking-avatar" style={{ background: statusColor + '20', color: statusColor }}>
                        {(customer.name || 'G')[0].toUpperCase()}
                      </div>
                      <div className="cm-booking-info">
                        <div className="cm-booking-name">{customer.name || 'Voyageur'}</div>
                        <div className="cm-booking-meta">
                          <span>{attr.arrival_date} → {attr.departure_date}</span>
                          {attr.channel_name && <span className="cm-booking-channel">{attr.channel_name}</span>}
                        </div>
                        {customer.email && <div className="cm-booking-contact">{customer.email}</div>}
                      </div>
                      <div className="cm-booking-right">
                        <div className="cm-booking-amount">{attr.amount ? `${attr.amount} ${attr.currency || ''}` : '—'}</div>
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

        {/* ── MESSAGES ─── */}
        {activeTab === 'messenger' && (
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
                ) : (
                  messages.map(msg => {
                    const attr = msg.attributes || {};
                    return (
                      <div
                        key={msg.id}
                        className={`cm-msg-item ${selectedConv?.id === msg.id ? 'active' : ''}`}
                        onClick={() => setSelectedConv(msg)}
                      >
                        <div className="cm-msg-avatar">{(attr.guest_name || 'G')[0]}</div>
                        <div className="cm-msg-preview">
                          <div className="cm-msg-guest">{attr.guest_name || 'Voyageur'}</div>
                          <div className="cm-msg-text">{attr.content || attr.message || '...'}</div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                      <Send size={16} />
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

        {/* ── AVIS ─── */}
        {activeTab === 'reviews' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Réputation & Avis</h2>
              <div className="cm-global-score"><Star size={16} style={{ color: '#F59E0B', fill: '#F59E0B' }} /> Score Global: {reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.attributes?.score || 0), 0) / reviews.length).toFixed(1) : '—'}/5</div>
            </div>

            {reviews.length === 0 ? (
              <div className="cm-empty-state">
                <Star size={40} />
                <h3>{isConnected ? 'Aucun avis reçu' : 'API non connectée'}</h3>
                <p>{isConnected ? 'Les avis apparaîtront ici dès réception.' : 'Connectez Channex.io pour voir les avis.'}</p>
              </div>
            ) : (
              <div className="cm-reviews-list">
                {reviews.map(review => {
                  const attr = review.attributes || {};
                  return (
                    <div key={review.id} className="cm-review-card">
                      <div className="cm-review-header">
                        <div className="cm-review-guest">
                          <div className="cm-review-avatar">{(attr.reviewer_name || 'G')[0]}</div>
                          <div>
                            <strong>{attr.reviewer_name || 'Voyageur'}</strong>
                            <span>{attr.channel_name}</span>
                          </div>
                        </div>
                        <div className="cm-review-score">
                          {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ color: i <= (attr.score || 0) ? '#F59E0B' : '#E2E8F0', fill: i <= (attr.score || 0) ? '#F59E0B' : 'none' }} />)}
                        </div>
                      </div>
                      <p className="cm-review-text">{attr.review_text || attr.comment || 'Pas de commentaire.'}</p>
                      {attr.reply && <div className="cm-review-reply"><strong>Votre réponse :</strong> {attr.reply}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TARIFICATION ─── */}
        {activeTab === 'pricing' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Règles de Tarification</h2>
              <button className="cm-btn-primary" onClick={() => fetchAll()}><RefreshCw size={14} /> Actualiser</button>
            </div>

            {ratePlans.length === 0 ? (
              <div className="cm-empty-state">
                <Tag size={40} />
                <h3>{isConnected ? 'Aucun plan tarifaire' : 'API non connectée'}</h3>
                <p>{isConnected ? 'Créez des plans tarifaires dans Channex.io.' : 'Connectez Channex.io pour gérer les tarifs.'}</p>
              </div>
            ) : (
              <div className="cm-rate-list">
                {ratePlans.map(rp => (
                  <div key={rp.id} className="cm-rate-card">
                    <strong>{rp.attributes?.title || 'Plan'}</strong>
                    <span>{rp.attributes?.currency} · Base: {rp.attributes?.base_rate || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="cm-card" style={{ marginTop: '1.5rem' }}>
              <div className="cm-card-header"><h3><Zap size={16} /> Règles Dynamiques</h3></div>
              <div className="cm-automation-list">
                {[
                  { name: 'Tarif Weekend +15%', active: true, desc: 'Vendredi & Samedi automatique' },
                  { name: 'Haute Saison +25%', active: true, desc: 'Juillet - Août' },
                  { name: 'Last Minute -10%', active: false, desc: '48h avant arrivée' },
                ].map((rule, i) => (
                  <div key={i} className="cm-auto-item">
                    <div>
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
          </div>
        )}

        {/* ── AUTOMATION ─── */}
        {activeTab === 'automation' && (
          <div className="cm-section">
            <div className="cm-section-header">
              <h2>Workflows Automatisés</h2>
            </div>
            <div className="cm-automation-grid">
              {[
                { title: 'Check-In Intelligent', desc: 'Envoie le code PIN 24h avant l\'arrivée automatiquement', icon: Key, color: '#6366F1', active: true },
                { title: 'Collecte d\'Avis', desc: 'Sollicite un avis 2h après le départ du client', icon: Star, color: '#F59E0B', active: true },
                { title: 'Optimisation Tarifaire', desc: 'Ajuste les prix selon le taux d\'occupation en temps réel', icon: TrendingUp, color: '#10B981', active: false },
                { title: 'Message de Bienvenue', desc: 'Envoi automatique dès confirmation de réservation', icon: MessageSquare, color: '#3B82F6', active: true },
                { title: 'Alerte Batterie Serrure', desc: 'Notification si batterie < 20% sur TTLock', icon: Bell, color: '#EF4444', active: false },
                { title: 'Sync Inventaire', desc: 'Ferme la disponibilité sur tous les canaux dès réservation', icon: Layers, color: '#8B5CF6', active: true },
              ].map((auto, i) => (
                <div key={i} className="cm-auto-card">
                  <div className="cm-auto-icon" style={{ background: auto.color + '15', color: auto.color }}><auto.icon size={22} /></div>
                  <div className="cm-auto-body">
                    <h4>{auto.title}</h4>
                    <p>{auto.desc}</p>
                  </div>
                  <div className={`cm-toggle ${auto.active ? 'on' : 'off'}`}>
                    <div className="cm-toggle-knob" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── API CONFIG ─── */}
        {activeTab === 'config' && (
          <div className="cm-section cm-config-section">
            <div className="cm-config-card">
              <div className="cm-config-header">
                <div className="cm-config-icon"><Server size={28} /></div>
                <h2>Connexion Channex.io</h2>
                <p>Entrez votre clé API pour activer la synchronisation en temps réel avec tous vos OTAs.</p>
              </div>

              {syncStatus === 'connected' && (
                <div className="cm-success-banner">
                  <CheckCircle2 size={18} />
                  <span>API connectée avec succès — {properties.length} propriété{properties.length !== 1 ? 's' : ''} trouvée{properties.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {apiError && syncStatus === 'error' && (
                <div className="cm-error-inline">
                  <AlertCircle size={16} />
                  <span>{apiError}</span>
                </div>
              )}

              <div className="cm-config-field">
                <label>Clé API Channex.io</label>
                <div className="cm-token-input-wrap">
                  <Key size={16} className="cm-input-icon" />
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={channexToken}
                    onChange={e => setChannexToken(e.target.value)}
                    placeholder="Entrez votre clé API..."
                    className="cm-input"
                    onKeyDown={e => e.key === 'Enter' && saveAndConnect()}
                  />
                  <button className="cm-input-action" onClick={() => setShowToken(v => !v)} title={showToken ? 'Masquer' : 'Afficher'}>
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {channexToken && (
                    <button className="cm-input-action" onClick={copyToken} title="Copier">
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="cm-config-info">
                <div className="cm-info-item"><Globe size={14} /> Endpoint: <code>app.channex.io/api/v1</code></div>
                <div className="cm-info-item"><Shield size={14} /> Données chiffrées en transit (TLS 1.3)</div>
                <div className="cm-info-item"><ExternalLink size={14} /> <a href="https://docs.channex.io" target="_blank" rel="noreferrer">Documentation Channex.io</a></div>
              </div>

              <div className="cm-config-actions">
                <button className="cm-btn-primary" onClick={saveAndConnect} disabled={loading || !channexToken.trim()}>
                  {loading ? <><RefreshCcw size={16} className="cm-spin" /> Connexion...</> : <><Wifi size={16} /> Connecter & Synchroniser</>}
                </button>
                {isConnected && (
                  <button className="cm-btn-danger" onClick={disconnect}>
                    <WifiOff size={16} /> Déconnecter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelManager;
