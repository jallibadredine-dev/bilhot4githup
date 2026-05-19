import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Search, RefreshCw, Settings, CheckCircle2,
  AlertCircle, X, Sparkles, ChevronRight, Zap, Globe, Calendar,
  Building2, Phone, Mail, Key, FileText, Wifi, Clock, Users,
  Filter, MoreHorizontal, Star, Flag, Archive, Bell, BellOff,
  ArrowLeft, ExternalLink, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { channexAPI } from '../../lib/channex';
import { logError } from '../../lib/errorHandler';
import { toast } from '../../lib/toast';
import { secureStorage } from '../../lib/secureStorage';
import './UnifiedInbox.css';

/* ─── OTA DEFINITIONS (mirroring ChannelManager) ─────────── */
const OTA_DEFS = [
  { id: 'airbnb',      name: 'Airbnb',        color: '#FF5A5F', bg: '#FFF0F0', logo: '🏠', keywords: ['airbnb'] },
  { id: 'booking',     name: 'Booking.com',   color: '#003580', bg: '#E8F0FF', logo: '🔵', keywords: ['booking'] },
  { id: 'expedia',     name: 'Expedia',       color: '#FFC72C', bg: '#FFF8E0', logo: '✈️', keywords: ['expedia'] },
  { id: 'tripadvisor', name: 'TripAdvisor',   color: '#00AA6C', bg: '#E0F7EE', logo: '🦉', keywords: ['tripadvisor'] },
  { id: 'vrbo',        name: 'Vrbo',          color: '#1B468A', bg: '#E8EEFF', logo: '🏡', keywords: ['vrbo'] },
  { id: 'agoda',       name: 'Agoda',         color: '#E0113A', bg: '#FFE8EC', logo: '🌏', keywords: ['agoda'] },
  { id: 'google',      name: 'Google Hotels', color: '#4285F4', bg: '#E8F0FF', logo: '🔍', keywords: ['google'] },
  { id: 'whatsapp',    name: 'WhatsApp',      color: '#25D366', bg: '#E8FDF0', logo: '💬', keywords: ['whatsapp'] },
  { id: 'direct',      name: 'Direct',        color: '#2563EB', bg: '#FFF1F2', logo: '🏨', keywords: ['direct'] },
];

/* ─── DEMO CONVERSATIONS (per OTA) ─────────────────────────── */
const DEMO_THREADS = {
  airbnb: [
    {
      guestName: 'Emma Wilson',       reservation: 'AIR-8472', checkIn: '2026-05-20', checkOut: '2026-05-23', room: 'Studio Cosy Centre-Ville', nights: 3, amount: 255, unread: 1,
      msgs: [
        { id: 'm1', sender: 'guest', text: "Hi! What time can I check in? I'll be arriving around 15:00.", time: '09:15' },
        { id: 'm2', sender: 'host',  text: "Hello Emma! Check-in is from 14:00. Your room will be ready. I'll send you the access code 1 hour before.", time: '09:22' },
        { id: 'm3', sender: 'guest', text: 'Perfect, thank you! Is there parking nearby?', time: '09:45' },
      ],
    },
    {
      guestName: 'Lucas Ferreira',    reservation: 'AIR-9183', checkIn: '2026-05-18', checkOut: '2026-05-19', room: 'Loft Moderne avec Vue', nights: 1, amount: 110, unread: 1,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Bonjour ! Le late check-out est possible jusqu\'à 13h demain ?', time: '08:30' },
      ],
    },
  ],
  booking: [
    {
      guestName: 'Hans Müller',       reservation: 'BKG-44291', checkIn: '2026-05-19', checkOut: '2026-05-22', room: 'Chambre Supérieure', nights: 3, amount: 390, unread: 0,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Guten Tag, I would like to request a baby cot for my infant daughter.', time: '14:20' },
        { id: 'm2', sender: 'host',  text: 'Bonjour M. Müller! Bien sûr, un lit bébé sera installé dans votre chambre avant votre arrivée.', time: '14:35' },
        { id: 'm3', sender: 'guest', text: 'Thank you so much! We look forward to our stay.', time: '14:40' },
      ],
    },
    {
      guestName: 'Yuki Tanaka',       reservation: 'BKG-55012', checkIn: '2026-05-21', checkOut: '2026-05-25', room: 'Suite Junior', nights: 4, amount: 760, unread: 1,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'こんにちは。Wi-Fiのパスワードを教えていただけますか？', time: 'Yesterday' },
        { id: 'm2', sender: 'ai',    text: 'Bonjour Yuki ! 🌸 Le réseau Wi-Fi est "BilHot_Guest" — Mot de passe: Hova2026#. Bonne connexion !', time: 'Yesterday', isAI: true },
      ],
    },
  ],
  expedia: [
    {
      guestName: 'Michael Johnson',   reservation: 'EXP-7823', checkIn: '2026-05-22', checkOut: '2026-05-24', room: 'Classic Room', nights: 2, amount: 178, unread: 1,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Do you offer airport shuttle service? We land at 22:30.', time: 'Monday' },
      ],
    },
  ],
  tripadvisor: [
    {
      guestName: 'Sophie Lecomte',    reservation: 'TRP-3301', checkIn: '2026-05-23', checkOut: '2026-05-26', room: 'Chambre Vue Mer', nights: 3, amount: 435, unread: 0,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Bonjour, est-ce que le petit-déjeuner est inclus dans notre réservation ?', time: 'Oct 12' },
        { id: 'm2', sender: 'host',  text: 'Bonjour Sophie ! Oui, le petit-déjeuner buffet est inclus, servi de 7h à 10h30. À bientôt !', time: 'Oct 12' },
      ],
    },
  ],
  vrbo: [
    {
      guestName: 'Carlos Mendoza',    reservation: 'VRB-1192', checkIn: '2026-05-25', checkOut: '2026-06-01', room: 'Villa Provençale 4 Ch.', nights: 7, amount: 2940, unread: 2,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Hola! We are a group of 7. Is the BBQ available for use?', time: '11:00' },
        { id: 'm2', sender: 'guest', text: 'Also, can we bring our dog? She is very well-behaved 🐕', time: '11:02' },
      ],
    },
  ],
  agoda: [
    {
      guestName: 'Wei Zhang',         reservation: 'AGD-8841', checkIn: '2026-05-20', checkOut: '2026-05-23', room: 'Standard Room', nights: 3, amount: 225, unread: 0,
      msgs: [
        { id: 'm1', sender: 'guest', text: 'Hello, is there a safe box in the room for valuables?', time: 'Tue' },
        { id: 'm2', sender: 'host',  text: 'Hi Wei! Yes, each room has a digital safe. Code instructions will be in the welcome booklet.', time: 'Tue' },
      ],
    },
  ],
};

/* ─── AI SUGGESTIONS ─────────────────────────────────────── */
const getSuggestions = (lastGuestMsg = '') => {
  const t = lastGuestMsg.toLowerCase();
  if (t.includes('check') || t.includes('arrive') || t.includes('time') || t.includes('heure'))
    return ['Check-in dès 14h00. Votre chambre sera prête.', 'Je vous envoie le code d\'accès 1h avant votre arrivée.', 'L\'accueil est ouvert jusqu\'à 22h.'];
  if (t.includes('wifi') || t.includes('internet') || t.includes('password') || t.includes('パスワード'))
    return ['Wi-Fi: "BilHot_Guest" | Mot de passe: Hova2026#', 'Le Wi-Fi est gratuit et disponible partout.'];
  if (t.includes('parking') || t.includes('park'))
    return ['Parking gratuit sur place, accès par badge.', 'Parking public à 200m, €2/h.'];
  if (t.includes('baby') || t.includes('cot') || t.includes('bébé') || t.includes('lit'))
    return ['Bien sûr ! Un lit bébé sera installé avant votre arrivée.', 'Nous disposons de lits bébé gratuits sur demande.'];
  if (t.includes('breakfast') || t.includes('petit-déjeuner') || t.includes('petit dejeuner'))
    return ['Petit-déjeuner buffet inclus de 7h30 à 10h30.', 'Le restaurant ouvre à 7h, comptez €15/pers si non inclus.'];
  if (t.includes('late') || t.includes('checkout') || t.includes('check-out'))
    return ['Late check-out jusqu\'à 13h sous réserve de dispo, gratuit.', 'Nous pouvons garder vos bagages si vous partez plus tard.'];
  if (t.includes('dog') || t.includes('pet') || t.includes('animal') || t.includes('chien'))
    return ['Les animaux de compagnie sont les bienvenus (supplément €10/nuit).', 'Votre compagnon est le bienvenu ! Précisez-nous le nombre.'];
  if (t.includes('shuttle') || t.includes('airport') || t.includes('taxi') || t.includes('transport'))
    return ['Navette aéroport disponible sur réservation (€25/trajet).', 'Taxi : appelez le +33 1 XX XX XX XX, compter 30 min.'];
  return [
    'Merci pour votre message ! Nous traitons votre demande.',
    'Bien reçu, nous revenons vers vous sous 1h.',
    'Bonjour, ravi de vous aider ! Que puis-je faire pour vous ?',
  ];
};

/* ─── HELPERS ────────────────────────────────────────────── */
const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 86400 && d.getDate() === now.getDate()) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const otaForChannelName = (name = '') => {
  const n = name.toLowerCase();
  return OTA_DEFS.find(o => o.keywords.some(k => n.includes(k)));
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const UnifiedInbox = ({ pmsMode = 'pro', setActiveView }) => {

  const [conversations,  setConversations]  = useState([]);
  const [threadMap,      setThreadMap]      = useState({});   // { convId: [msg] }
  const [selectedId,     setSelectedId]     = useState(null);
  const [input,          setInput]          = useState('');
  const [filterSource,   setFilterSource]   = useState('all');
  const [searchQ,        setSearchQ]        = useState('');
  const [syncStatus,     setSyncStatus]     = useState('idle'); // idle|loading|connected|error
  const [apiError,       setApiError]       = useState(null);
  const [lastSync,       setLastSync]       = useState(null);
  const [sending,        setSending]        = useState(false);
  const [suggestions,    setSuggestions]    = useState([]);
  const [showContext,    setShowContext]     = useState(true);
  const [unreadMap,      setUnreadMap]      = useState({});   // { convId: count }
  const messagesEndRef  = useRef(null);

  /* ── Read connected state from localStorage ── */
  const channexToken   = secureStorage.getSensitive('channex_token');
  const connectedOTAs  = OTA_DEFS.filter(o => secureStorage.getSensitive(`cm_ota_${o.id}`));
  const hasAnyConnection = !!channexToken || connectedOTAs.length > 0;

  /* ── Build conversations on mount ── */
  const buildConversations = useCallback(async () => {
    const allConvs = [];
    const allThreads = {};
    const allUnread = {};

    /* 1. Channex real data */
    if (channexToken) {
      setSyncStatus('loading');
      setApiError(null);
      try {
        const [msgRes, bookRes] = await Promise.allSettled([
          channexAPI.getMessages(channexToken),
          channexAPI.getBookings(channexToken),
        ]);
        const rawMsgs  = msgRes.status  === 'fulfilled' ? msgRes.value?.data  || [] : [];
        const rawBooks = bookRes.status === 'fulfilled' ? bookRes.value?.data || [] : [];

        /* Group messages by booking_id */
        const grouped = {};
        rawMsgs.forEach(m => {
          const bid = m.attributes?.booking_id;
          if (!bid) return;
          if (!grouped[bid]) grouped[bid] = [];
          grouped[bid].push(m);
        });

        Object.entries(grouped).forEach(([bookingId, msgs]) => {
          const booking = rawBooks.find(b => b.id === bookingId);
          const chanName = booking?.attributes?.channel_name || '';
          const ota      = otaForChannelName(chanName);
          const lastMsg  = msgs[msgs.length - 1];
          const unreadCnt = msgs.filter(m =>
            m.attributes?.sender_type !== 'host' && !m.attributes?.read
          ).length;

          allConvs.push({
            id:          bookingId,
            guestName:   booking?.attributes?.customer?.name || 'Voyageur',
            source:      ota?.id    || 'direct',
            sourceColor: ota?.color || '#717171',
            sourceName:  chanName   || 'Channex',
            sourceLogo:  ota?.logo  || '🌐',
            reservation: booking?.attributes?.external_booking_id || bookingId.slice(0, 8).toUpperCase(),
            checkIn:     booking?.attributes?.arrival_date,
            checkOut:    booking?.attributes?.departure_date,
            room:        booking?.attributes?.room_type_name || '—',
            nights:      null,
            amount:      booking?.attributes?.amount || null,
            isReal:      true,
            lastMsg:     lastMsg?.attributes?.text || '',
            lastTime:    fmtTime(lastMsg?.attributes?.inserted_at),
          });
          allUnread[bookingId] = unreadCnt;
          allThreads[bookingId] = msgs.map(m => ({
            id:     m.id,
            text:   m.attributes?.text || m.attributes?.message || '',
            sender: m.attributes?.sender_type === 'guest' ? 'guest' : 'host',
            time:   fmtTime(m.attributes?.inserted_at),
            isAI:   false,
          }));
        });
        setSyncStatus('connected');
        setLastSync(new Date());
      } catch (e) {
        const msg = e.message || 'Erreur API Channex';
        logError('inbox', 'Channex sync failed', { error: msg });
        toast.error(msg);
        setSyncStatus('error');
        setApiError(msg);
      }
    }

    /* 2. Demo conversations for each connected OTA */
    connectedOTAs.forEach(ota => {
      const demos = DEMO_THREADS[ota.id] || [];
      demos.forEach((d, i) => {
        const convId = `ota_${ota.id}_${i}`;
        const unreadCnt = d.msgs.filter(m => m.sender === 'guest').slice(-2).length; // last 2 guest msgs as "unread"
        allConvs.push({
          id:          convId,
          guestName:   d.guestName,
          source:      ota.id,
          sourceColor: ota.color,
          sourceName:  ota.name,
          sourceLogo:  ota.logo,
          reservation: d.reservation,
          checkIn:     d.checkIn,
          checkOut:    d.checkOut,
          room:        d.room,
          nights:      d.nights,
          amount:      d.amount,
          isReal:      false,
          lastMsg:     d.msgs[d.msgs.length - 1]?.text || '',
          lastTime:    d.msgs[d.msgs.length - 1]?.time || '',
        });
        allUnread[convId] = d.unread || 0;
        allThreads[convId] = d.msgs;
      });
    });

    setConversations(allConvs);
    setThreadMap(allThreads);
    setUnreadMap(allUnread);

    /* Auto-select first unread, or first */
    const firstUnread = allConvs.find(c => (allUnread[c.id] || 0) > 0);
    const toSelect = (firstUnread || allConvs[0])?.id || null;
    setSelectedId(toSelect);
    if (toSelect) refreshSuggestions(allThreads[toSelect] || []);

    if (!channexToken && allConvs.length > 0) setSyncStatus('demo');
  }, []);

  useEffect(() => { buildConversations(); }, []);

  /* Scroll to bottom when thread changes */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, threadMap]);

  /* ── Refresh suggestions when conversation changes ── */
  const refreshSuggestions = (thread) => {
    const lastGuest = [...(thread || [])].reverse().find(m => m.sender === 'guest');
    setSuggestions(getSuggestions(lastGuest?.text || ''));
  };

  const selectConv = (id) => {
    setSelectedId(id);
    setUnreadMap(prev => ({ ...prev, [id]: 0 }));
    refreshSuggestions(threadMap[id] || []);
  };

  /* ── Send message ── */
  const sendMessage = async () => {
    if (!input.trim() || !selectedId) return;
    setSending(true);
    const newMsg = {
      id:   `local_${Date.now()}`,
      text: input.trim(),
      sender: 'host',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isAI: false,
    };

    /* Optimistic update */
    setThreadMap(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newMsg] }));
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, lastMsg: input.trim(), lastTime: newMsg.time } : c));
    const sentText = input.trim();
    setInput('');

    /* Real API if Channex */
    const conv = conversations.find(c => c.id === selectedId);
    if (conv?.isReal && channexToken) {
      try { await channexAPI.sendMessage(channexToken, selectedId, sentText); }
      catch (e) { logError('inbox', 'Message send failed', { error: e?.message }); toast.error(e?.message || 'Erreur envoi message'); }
    }
    setSending(false);
    refreshSuggestions([...threadMap[selectedId] || [], newMsg]);
  };

  /* ── Filtered conversations ── */
  const filteredConvs = conversations.filter(c => {
    const matchSrc = filterSource === 'all' || c.source === filterSource;
    const matchQ   = !searchQ || c.guestName.toLowerCase().includes(searchQ.toLowerCase()) ||
                     c.reservation.toLowerCase().includes(searchQ.toLowerCase()) ||
                     c.lastMsg.toLowerCase().includes(searchQ.toLowerCase());
    return matchSrc && matchQ;
  });

  const totalUnread    = Object.values(unreadMap).reduce((s, n) => s + n, 0);
  const selectedConv   = conversations.find(c => c.id === selectedId);
  const selectedThread = threadMap[selectedId] || [];
  const sourcesInUse   = [...new Set(conversations.map(c => c.source))];

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="ui-container">

      {/* ── TOP BAR ── */}
      <div className="ui-topbar">
        <div className="ui-topbar-left">
          <MessageSquare size={20} color="#2563EB"/>
          <h1 className="ui-title">Inbox Omnicanal</h1>
          {totalUnread > 0 && <span className="ui-unread-badge">{totalUnread}</span>}
          <span className="ui-ai-badge"><Sparkles size={10}/> AI</span>
        </div>

        <div className="ui-topbar-center">
          <div className="ui-search-wrap">
            <Search size={14} className="ui-search-icon"/>
            <input className="ui-search" placeholder="Rechercher invité, réservation…" value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
          </div>
        </div>

        <div className="ui-topbar-right">
          {/* Sync status */}
          <div className={`ui-sync-badge ${syncStatus}`}>
            {syncStatus === 'loading' && <Loader2 size={12} className="ui-spin"/>}
            {syncStatus === 'connected' && <><span className="ui-dot green"/>{lastSync ? `Synchro ${fmtTime(lastSync.toISOString())}` : 'Connecté'}</>}
            {syncStatus === 'error' && <><span className="ui-dot red"/>Erreur API</>}
            {syncStatus === 'demo' && <><span className="ui-dot orange"/>Mode Démo</>}
            {syncStatus === 'idle' && <><span className="ui-dot grey"/>En attente</>}
          </div>
          <button className="ui-btn-icon" onClick={buildConversations} title="Actualiser"><RefreshCw size={15}/></button>
          {setActiveView && (
            <button className="ui-btn-icon" onClick={() => setActiveView('distribution')} title="Gérer les connexions OTA"><Settings size={15}/></button>
          )}
        </div>
      </div>

      {/* ── NO CONNECTION BANNER ── */}
      {!hasAnyConnection && (
        <div className="ui-connect-banner">
          <div className="ui-connect-banner-left">
            <Globe size={20} color="#2563EB"/>
            <div>
              <strong>Aucune plateforme connectée</strong>
              <p>Connectez Airbnb, Booking.com, Expedia ou Channex.io pour centraliser tous vos messages ici.</p>
            </div>
          </div>
          {setActiveView && (
            <button className="ui-btn-primary" onClick={() => setActiveView('distribution')}>
              Connecter des plateformes <ChevronRight size={14}/>
            </button>
          )}
        </div>
      )}

      {/* ── SOURCE FILTER PILLS ── */}
      {conversations.length > 0 && (
        <div className="ui-source-bar">
          <button className={`ui-source-pill ${filterSource === 'all' ? 'active' : ''}`} onClick={() => setFilterSource('all')}>
            <span>Tous</span>
            <span className="ui-pill-count">{conversations.length}</span>
          </button>
          {sourcesInUse.map(srcId => {
            const ota = OTA_DEFS.find(o => o.id === srcId);
            if (!ota) return null;
            const cnt = conversations.filter(c => c.source === srcId).length;
            const unread = conversations.filter(c => c.source === srcId).reduce((s, c) => s + (unreadMap[c.id] || 0), 0);
            return (
              <button
                key={srcId}
                className={`ui-source-pill ${filterSource === srcId ? 'active' : ''}`}
                style={filterSource === srcId ? { borderColor: ota.color, color: ota.color, background: ota.bg } : {}}
                onClick={() => setFilterSource(srcId)}
              >
                <span>{ota.logo}</span>
                <span>{ota.name}</span>
                <span className="ui-pill-count" style={unread > 0 ? { background: ota.color, color: 'white' } : {}}>{unread > 0 ? unread : cnt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className="ui-main">

        {/* ── CONVERSATION LIST ── */}
        <div className="ui-conv-list">
          {filteredConvs.length === 0 && (
            <div className="ui-empty">
              <MessageSquare size={28} color="#CCCCCC"/>
              <p>{hasAnyConnection ? 'Aucun message trouvé' : 'Connectez une plateforme pour voir vos messages'}</p>
            </div>
          )}
          {filteredConvs.map(conv => {
            const ota = OTA_DEFS.find(o => o.id === conv.source);
            const unread = unreadMap[conv.id] || 0;
            const isActive = conv.id === selectedId;
            return (
              <div
                key={conv.id}
                className={`ui-conv-item ${isActive ? 'active' : ''} ${unread > 0 ? 'unread' : ''}`}
                onClick={() => selectConv(conv.id)}
              >
                <div className="ui-conv-avatar" style={{ background: ota?.bg || '#F7F7F7', color: ota?.color || '#717171' }}>
                  {conv.guestName.charAt(0).toUpperCase()}
                  <span className="ui-conv-source-dot" style={{ background: ota?.color || '#717171' }} title={conv.sourceName}/>
                </div>
                <div className="ui-conv-info">
                  <div className="ui-conv-row1">
                    <span className="ui-conv-name">{conv.guestName}</span>
                    <span className="ui-conv-time">{conv.lastTime}</span>
                  </div>
                  <div className="ui-conv-row2">
                    <span className="ui-conv-last">{conv.lastMsg}</span>
                    {unread > 0 && <span className="ui-unread-dot" style={{ background: ota?.color || '#2563EB' }}>{unread}</span>}
                  </div>
                  <div className="ui-conv-row3">
                    <span className="ui-conv-platform" style={{ color: ota?.color || '#717171' }}>
                      {ota?.logo} {conv.sourceName}
                    </span>
                    <span className="ui-conv-ref">{conv.reservation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── MESSAGE THREAD ── */}
        <div className="ui-thread">
          {selectedConv ? (
            <>
              {/* Thread header */}
              <div className="ui-thread-head">
                <div className="ui-thread-head-left">
                  <div className="ui-thread-avatar" style={{ background: OTA_DEFS.find(o => o.id === selectedConv.source)?.bg || '#F7F7F7', color: OTA_DEFS.find(o => o.id === selectedConv.source)?.color || '#717171' }}>
                    {selectedConv.guestName.charAt(0)}
                  </div>
                  <div>
                    <div className="ui-thread-name">{selectedConv.guestName}</div>
                    <div className="ui-thread-meta">
                      <span className="ui-platform-tag" style={{ background: OTA_DEFS.find(o => o.id === selectedConv.source)?.bg, color: OTA_DEFS.find(o => o.id === selectedConv.source)?.color }}>
                        {OTA_DEFS.find(o => o.id === selectedConv.source)?.logo} {selectedConv.sourceName}
                      </span>
                      <span className="ui-ref-tag"><CheckCircle2 size={11}/> {selectedConv.reservation}</span>
                      {selectedConv.checkIn && <span className="ui-date-tag"><Calendar size={11}/> {selectedConv.checkIn} → {selectedConv.checkOut}</span>}
                    </div>
                  </div>
                </div>
                <div className="ui-thread-actions">
                  <button className="ui-btn-icon" title="Téléphone"><Phone size={15}/></button>
                  <button className="ui-btn-icon" title="Email"><Mail size={15}/></button>
                  <button className="ui-btn-icon" onClick={() => setShowContext(v => !v)} title="Fiche séjour">
                    <Building2 size={15}/>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="ui-messages">
                {selectedThread.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    className={`ui-msg ui-msg-${msg.sender}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {msg.isAI && (
                      <div className="ui-ai-label"><Sparkles size={10}/> Autopilot IA</div>
                    )}
                    <div className="ui-msg-bubble">{msg.text}</div>
                    <div className="ui-msg-time">{msg.time}</div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef}/>
              </div>

              {/* AI quick replies */}
              {suggestions.length > 0 && (
                <div className="ui-suggestions">
                  <span className="ui-suggestions-label"><Sparkles size={11}/> Suggestions IA</span>
                  <div className="ui-suggestions-list">
                    {suggestions.map((s, i) => (
                      <button key={i} className="ui-suggestion-chip" onClick={() => setInput(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input bar */}
              <div className="ui-input-bar">
                <div className="ui-input-wrap">
                  <textarea
                    className="ui-input"
                    placeholder={`Répondre à ${selectedConv.guestName} via ${selectedConv.sourceName}…`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={1}
                  />
                  <div className="ui-input-actions">
                    <button className="ui-send-btn" onClick={sendMessage} disabled={!input.trim() || sending}>
                      {sending ? <Loader2 size={16} className="ui-spin"/> : <Send size={16}/>}
                    </button>
                  </div>
                </div>
                <div className="ui-input-hint">Entrée pour envoyer · Shift+Entrée pour nouvelle ligne · Envoi via {selectedConv.sourceName}</div>
              </div>
            </>
          ) : (
            <div className="ui-empty-thread">
              <MessageSquare size={40} color="#EBEBEB"/>
              <p>Sélectionnez une conversation</p>
              {!hasAnyConnection && setActiveView && (
                <button className="ui-btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveView('distribution')}>
                  Connecter Airbnb / Booking.com <ChevronRight size={14}/>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── CONTEXT SIDEBAR ── */}
        <AnimatePresence>
          {selectedConv && showContext && (
            <motion.div
              className="ui-context"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
            >
              <div className="ui-context-head">
                <span>Fiche Séjour</span>
                <button className="ui-btn-icon" onClick={() => setShowContext(false)}><X size={14}/></button>
              </div>

              {/* Guest info */}
              <div className="ui-ctx-section">
                <div className="ui-ctx-guest-avatar">{selectedConv.guestName.charAt(0)}</div>
                <div className="ui-ctx-guest-name">{selectedConv.guestName}</div>
                <div className="ui-ctx-platform" style={{ background: OTA_DEFS.find(o => o.id === selectedConv.source)?.bg, color: OTA_DEFS.find(o => o.id === selectedConv.source)?.color }}>
                  {OTA_DEFS.find(o => o.id === selectedConv.source)?.logo} {selectedConv.sourceName}
                </div>
              </div>

              {/* Booking details */}
              <div className="ui-ctx-card">
                <div className="ui-ctx-row">
                  <span className="ui-ctx-label"><FileText size={12}/> Réservation</span>
                  <span className="ui-ctx-val bold">{selectedConv.reservation}</span>
                </div>
                {selectedConv.room && (
                  <div className="ui-ctx-row">
                    <span className="ui-ctx-label"><Building2 size={12}/> Hébergement</span>
                    <span className="ui-ctx-val">{selectedConv.room}</span>
                  </div>
                )}
                {selectedConv.checkIn && (
                  <div className="ui-ctx-row">
                    <span className="ui-ctx-label"><Calendar size={12}/> Check-in</span>
                    <span className="ui-ctx-val">{selectedConv.checkIn}</span>
                  </div>
                )}
                {selectedConv.checkOut && (
                  <div className="ui-ctx-row">
                    <span className="ui-ctx-label"><Calendar size={12}/> Check-out</span>
                    <span className="ui-ctx-val">{selectedConv.checkOut}</span>
                  </div>
                )}
                {selectedConv.nights && (
                  <div className="ui-ctx-row">
                    <span className="ui-ctx-label"><Clock size={12}/> Durée</span>
                    <span className="ui-ctx-val">{selectedConv.nights} nuit{selectedConv.nights > 1 ? 's' : ''}</span>
                  </div>
                )}
                {selectedConv.amount && (
                  <div className="ui-ctx-row">
                    <span className="ui-ctx-label"><Star size={12}/> Montant</span>
                    <span className="ui-ctx-val bold coral">{selectedConv.amount}€</span>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="ui-ctx-section">
                <span className="ui-ctx-section-title">Actions rapides</span>
              </div>
              <div className="ui-quick-actions">
                {[
                  { icon: Key,       label: 'Envoyer code d\'accès',  action: () => setInput('Votre code d\'accès est : 4829. Bonne arrivée ! 🗝️') },
                  { icon: Wifi,      label: 'Envoyer infos Wi-Fi',     action: () => setInput('Wi-Fi: "BilHot_Guest" | Mot de passe: Hova2026#') },
                  { icon: FileText,  label: 'Envoyer instructions',    action: () => setInput('Voici les instructions d\'accès et le règlement de la maison…') },
                  { icon: Calendar,  label: 'Rappel check-out',        action: () => setInput(`Bonjour ! Petit rappel : votre check-out est prévu le ${selectedConv.checkOut}. Merci !`) },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} className="ui-quick-action-btn" onClick={action}>
                    <Icon size={13}/> {label}
                  </button>
                ))}
              </div>

              {/* API connection status */}
              <div className="ui-ctx-footer">
                {selectedConv.isReal
                  ? <div className="ui-ctx-live"><span className="ui-dot green"/><span>Message temps réel via Channex</span></div>
                  : <div className="ui-ctx-live demo"><span className="ui-dot orange"/><span>Simulation — connectez Channex pour données réelles</span></div>
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default UnifiedInbox;
