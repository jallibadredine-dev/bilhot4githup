import React, { useState, useEffect, useCallback } from 'react';
import {
  Star, MessageSquare, Sparkles, Send, Globe, Settings,
  CheckCircle2, Search, Bot, RefreshCw, ChevronRight,
  ShieldCheck, Loader2, AlertCircle, TrendingUp, ThumbsUp,
  X, Filter, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { channexAPI } from '../../lib/channex';
import { logError } from '../../lib/errorHandler';
import './ReputationManager.css';

/* ─── OTA DEFINITIONS ─────────────────────────────────────── */
const OTA_DEFS = [
  { id: 'airbnb',      name: 'Airbnb',        color: '#FF5A5F', bg: '#FFF0F0', logo: '🏠', keywords: ['airbnb'] },
  { id: 'booking',     name: 'Booking.com',   color: '#003580', bg: '#E8F0FF', logo: '🔵', keywords: ['booking'] },
  { id: 'expedia',     name: 'Expedia',       color: '#FFC72C', bg: '#FFF8E0', logo: '✈️', keywords: ['expedia'] },
  { id: 'tripadvisor', name: 'TripAdvisor',   color: '#00AA6C', bg: '#E0F7EE', logo: '🦉', keywords: ['tripadvisor'] },
  { id: 'vrbo',        name: 'Vrbo',          color: '#1B468A', bg: '#E8EEFF', logo: '🏡', keywords: ['vrbo'] },
  { id: 'agoda',       name: 'Agoda',         color: '#E0113A', bg: '#FFE8EC', logo: '🌏', keywords: ['agoda'] },
  { id: 'google',      name: 'Google Hotels', color: '#4285F4', bg: '#E8F0FF', logo: '🔍', keywords: ['google'] },
];

/* ─── DEMO REVIEWS (per OTA) ─────────────────────────────── */
const DEMO_REVIEWS = {
  airbnb: [
    { id: 'ab1', guestName: 'Sophie Martin',    rating: 5, date: '2026-05-14', text: 'Séjour incroyable ! La villa était parfaitement propre et la vue est à couper le souffle. Le système d\'accès par code est très pratique. Nous reviendrons avec grand plaisir.', room: 'Studio Cosy Centre-Ville', reservation: 'AIR-8472', replied: true,  reply: "Chère Sophie, merci infiniment pour votre retour élogieux ! Nous sommes ravis que vous ayez apprécié la propreté et la vue. À très bientôt !" },
    { id: 'ab2', guestName: 'Lucas Ferreira',   rating: 4, date: '2026-05-10', text: 'Très beau logement, bien équipé. L\'hôte est très réactif. J\'enlève une étoile car le quartier est un peu bruyant la nuit, mais globalement excellent séjour.',              room: 'Loft Moderne avec Vue',    reservation: 'AIR-9183', replied: false },
    { id: 'ab3', guestName: 'Emma Wilson',       rating: 5, date: '2026-05-07', text: 'Absolutely stunning apartment! The view was breathtaking and everything was spotlessly clean. The host was incredibly helpful and responsive. 10/10 would recommend!',         room: 'Suite Familiale 3 Pièces', reservation: 'AIR-7721', replied: false },
  ],
  booking: [
    { id: 'bk1', guestName: 'Hans Müller',       rating: 5, date: '2026-05-12', text: 'Ausgezeichnetes Apartment in zentraler Lage! Sehr sauber und mit allem ausgestattet. Der Gastgeber war sehr hilfsbereit. Klare Empfehlung!',                                   room: 'Chambre Supérieure',       reservation: 'BKG-44291', replied: true,  reply: "Lieber Herr Müller, herzlichen Dank für Ihre freundliche Bewertung! Es freut uns sehr, dass Sie Ihren Aufenthalt genossen haben. Auf Wiedersehen!" },
    { id: 'bk2', guestName: 'Thomas Dubois',     rating: 3, date: '2026-05-08', text: 'L\'appartement est bien situé mais il y avait du bruit la nuit et la climatisation faisait un bruit étrange. La literie était en revanche très confortable.',                    room: 'Chambre Standard',         reservation: 'BKG-55012', replied: false },
    { id: 'bk3', guestName: 'Yuki Tanaka',       rating: 4, date: '2026-05-05', text: '素晴らしい滞在でした！部屋はとても清潔で、設備も充実していました。ホストの対応も迅速で親切でした。また利用したいと思います。',                                                      room: 'Suite Junior',             reservation: 'BKG-33781', replied: false },
  ],
  expedia: [
    { id: 'ex1', guestName: 'Marc Leroy',        rating: 4, date: '2026-05-11', text: 'Bon séjour dans l\'ensemble. L\'équipe de la conciergerie a été très réactive pour notre demande de transfert aéroport. Seul bémol, le Wi-Fi parfois un peu lent.',              room: 'Classic Room',             reservation: 'EXP-7823', replied: true,  reply: "Cher Marc, merci d'avoir partagé votre expérience. Nous prenons bonne note de votre remarque concernant le Wi-Fi. À très bientôt !" },
    { id: 'ex2', guestName: 'Michael Johnson',   rating: 5, date: '2026-05-03', text: 'Outstanding stay! The room was spacious, clean, and had everything we needed. The location was perfect and the staff were extremely friendly and helpful.',                        room: 'Deluxe Room',              reservation: 'EXP-6612', replied: false },
  ],
  tripadvisor: [
    { id: 'ta1', guestName: 'Elena Rodriguez',   rating: 5, date: '2026-05-09', text: 'Perfect location, amazing amenities. The smart locks made check-in seamless. Highly recommended for anyone visiting! The hospitality was world-class.',                           room: 'Chambre Vue Jardin',       reservation: 'TRP-3301', replied: false },
    { id: 'ta2', guestName: 'Sophie Lecomte',    rating: 3, date: '2026-04-28', text: 'Logement correct mais qui a besoin d\'une petite remise à niveau. Literie très bien, mais salle de bain à moderniser. Personnel accueillant et breakfast délicieux.',              room: 'Chambre Vue Mer',          reservation: 'TRP-2918', replied: false },
  ],
  vrbo: [
    { id: 'vr1', guestName: 'Carlos Mendoza',    rating: 5, date: '2026-05-15', text: 'Increíble villa! Perfecta para nuestra familia. La piscina era fabulosa y la casa estaba equipada con todo lo necesario. El anfitrión fue muy amable y receptivo.',               room: 'Villa Provençale 4 Ch.',   reservation: 'VRB-1192', replied: false },
  ],
  agoda: [
    { id: 'ag1', guestName: 'Wei Zhang',         rating: 4, date: '2026-05-06', text: 'Very nice stay! The room was clean and comfortable. The location was convenient for exploring the city. Would definitely recommend to friends and family.',                        room: 'Standard Room',            reservation: 'AGD-8841', replied: false },
  ],
};

/* ─── AI REPLY GENERATOR ─────────────────────────────────── */
const generateAIReply = (review) => {
  const { guestName, rating, text = '' } = review;
  const t = text.toLowerCase();
  const firstName = guestName.split(' ')[0];
  const isPositive = rating >= 4;

  let body = '';
  if (isPositive) {
    if (t.includes('propre') || t.includes('clean') || t.includes('sauber'))
      body = 'Nous accordons une attention toute particulière à la propreté de notre établissement, et votre retour nous conforte dans nos efforts quotidiens.';
    else if (t.includes('vue') || t.includes('view') || t.includes('location') || t.includes('situé'))
      body = 'La situation et l\'environnement de notre établissement sont effectivement l\'un de nos atouts majeurs, et nous sommes heureux que vous l\'ayez apprécié.';
    else if (t.includes('accueil') || t.includes('staff') || t.includes('host') || t.includes('réactif'))
      body = 'Notre équipe met tout son cœur pour que chaque hôte se sente vraiment chez lui, et votre témoignage nous touche profondément.';
    else
      body = 'Votre satisfaction est notre plus belle récompense et constitue la motivation de toute notre équipe.';
  } else {
    if (t.includes('bruit') || t.includes('noise') || t.includes('bruyant'))
      body = 'Nous prenons très au sérieux votre remarque concernant le niveau sonore et allons étudier des solutions d\'insonorisation complémentaires.';
    else if (t.includes('wifi') || t.includes('internet') || t.includes('connexion'))
      body = 'Nous avons bien noté votre commentaire sur la connexion Wi-Fi et avons depuis lors procédé à une mise à niveau de notre infrastructure réseau.';
    else if (t.includes('clima') || t.includes('air') || t.includes('froid') || t.includes('chaud'))
      body = 'Nous avons bien noté votre remarque concernant la climatisation et notre équipe technique a été mandatée pour vérifier et entretenir les équipements.';
    else
      body = 'Vos remarques constructives nous permettent d\'améliorer continuellement la qualité de nos prestations.';
  }

  if (isPositive) {
    return `Cher(e) ${firstName},\n\nMerci infiniment pour cette magnifique évaluation et vos mots si chaleureux. ${body}\n\nNous serions ravis de vous accueillir à nouveau lors d'un prochain séjour.\n\nCordialement,\nL'Équipe HosFlow`;
  } else {
    return `Cher(e) ${firstName},\n\nNous vous remercions sincèrement d'avoir pris le temps de partager votre expérience. Nous sommes désolés que certains aspects n'aient pas été à la hauteur de vos attentes. ${body}\n\nNous espérons avoir l'opportunité de vous accueillir à nouveau pour vous offrir l'expérience irréprochable que vous méritez.\n\nCordialement,\nL'Équipe HosFlow`;
  }
};

/* ─── HELPERS ─────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const otaForChannelName = (name = '') => {
  const n = name.toLowerCase();
  return OTA_DEFS.find(o => o.keywords.some(k => n.includes(k)));
};

const Stars = ({ rating, size = 15 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} style={{ color: i <= rating ? '#F59E0B' : '#E5E7EB', fill: i <= rating ? '#F59E0B' : '#E5E7EB' }}/>
    ))}
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const ReputationManager = ({ pmsMode, setActiveView }) => {

  const [reviews,       setReviews]       = useState([]);
  const [activeTab,     setActiveTab]     = useState('pending'); // pending | all | replied | config
  const [filterSource,  setFilterSource]  = useState('all');
  const [filterRating,  setFilterRating]  = useState('all');  // all | 5 | 4 | 3 | 1-2
  const [searchQ,       setSearchQ]       = useState('');
  const [syncStatus,    setSyncStatus]    = useState('idle');
  const [apiError,      setApiError]      = useState(null);
  const [lastSync,      setLastSync]      = useState(null);
  const [replyingId,    setReplyingId]    = useState(null);
  const [replyText,     setReplyText]     = useState('');
  const [generating,    setGenerating]    = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  const channexToken   = localStorage.getItem('channex_token');
  const connectedOTAs  = OTA_DEFS.filter(o => localStorage.getItem(`cm_ota_${o.id}`));
  const hasAnyConn     = !!channexToken || connectedOTAs.length > 0;

  /* ── Build review list ── */
  const buildReviews = useCallback(async () => {
    const allReviews = [];

    /* 1. Real Channex reviews */
    if (channexToken) {
      setSyncStatus('loading');
      setApiError(null);
      try {
        const res = await channexAPI.getReviews(channexToken);
        if (res?.data) {
          res.data.forEach(r => {
            const chanName = r.attributes?.channel_name || '';
            const ota = otaForChannelName(chanName);
            allReviews.push({
              id:          r.id,
              guestName:   r.attributes?.reviewer_name || 'Voyageur',
              rating:      Math.round(r.attributes?.score || 0),
              date:        r.attributes?.inserted_at || '',
              text:        r.attributes?.content || r.attributes?.review || '',
              source:      ota?.id     || 'direct',
              sourceColor: ota?.color  || '#717171',
              sourceName:  chanName    || 'Channex',
              sourceLogo:  ota?.logo   || '🌐',
              room:        r.attributes?.room_type_name || '',
              reservation: r.attributes?.booking_id?.slice(0, 8).toUpperCase() || '',
              replied:     !!r.attributes?.replied_at,
              reply:       r.attributes?.reply || '',
              isReal:      true,
            });
          });
        }
        setSyncStatus('connected');
        setLastSync(new Date());
      } catch (e) {
        setSyncStatus('error');
        setApiError(e.message || 'Erreur API Channex');
      }
    }

    /* 2. Demo reviews for connected OTAs */
    connectedOTAs.forEach(ota => {
      const demos = DEMO_REVIEWS[ota.id] || [];
      demos.forEach(d => {
        allReviews.push({
          ...d,
          source:      ota.id,
          sourceColor: ota.color,
          sourceName:  ota.name,
          sourceLogo:  ota.logo,
          isReal:      false,
        });
      });
    });

    /* Fallback: show all demo data when nothing connected */
    if (!hasAnyConn) {
      OTA_DEFS.forEach(ota => {
        (DEMO_REVIEWS[ota.id] || []).forEach(d => {
          allReviews.push({
            ...d,
            source: ota.id, sourceColor: ota.color, sourceName: ota.name, sourceLogo: ota.logo, isReal: false,
          });
        });
      });
      if (!channexToken) setSyncStatus('demo');
    }

    /* Sort: pending first, then by date desc */
    allReviews.sort((a, b) => {
      if (!a.replied && b.replied) return -1;
      if (a.replied && !b.replied) return 1;
      return new Date(b.date) - new Date(a.date);
    });

    setReviews(allReviews);
  }, []);

  useEffect(() => { buildReviews(); }, []);

  /* ── Handle reply submit ── */
  const submitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const rev = reviews.find(r => r.id === reviewId);

    if (rev?.isReal && channexToken) {
      try { await channexAPI.replyToReview(channexToken, reviewId, replyText); }
      catch (e) { logError('reputation', 'Reply to review failed', { error: e?.message }); }
    }

    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, replied: true, reply: replyText } : r
    ));
    setReplyingId(null);
    setReplyText('');
    setSubmitting(false);
  };

  /* ── Generate AI reply ── */
  const generateReply = (review) => {
    setGenerating(true);
    setReplyText('');
    setTimeout(() => {
      setReplyText(generateAIReply(review));
      setGenerating(false);
    }, 900);
  };

  /* ── Filtered list ── */
  const filtered = reviews.filter(r => {
    if (activeTab === 'pending' && r.replied) return false;
    if (activeTab === 'replied' && !r.replied) return false;
    if (filterSource !== 'all' && r.source !== filterSource) return false;
    if (filterRating === '5'   && r.rating !== 5) return false;
    if (filterRating === '4'   && r.rating !== 4) return false;
    if (filterRating === '3'   && r.rating !== 3) return false;
    if (filterRating === '1-2' && r.rating > 2)   return false;
    if (searchQ && !r.guestName.toLowerCase().includes(searchQ.toLowerCase()) &&
        !r.text.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  /* ── KPIs ── */
  const total       = reviews.length;
  const pending     = reviews.filter(r => !r.replied).length;
  const avgRating   = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '—';
  const pctPositive = total > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / total) * 100) : 0;
  const sourcesInReviews = [...new Set(reviews.map(r => r.source))];

  /* ════════════ RENDER ════════════ */
  return (
    <div className="rm-container">

      {/* ── TOP BAR ── */}
      <div className="rm-topbar">
        <div className="rm-topbar-left">
          <div className="rm-icon-badge">
            <Star size={18} color="#FF385C" fill="#FF385C"/>
          </div>
          <div>
            <h1 className="rm-title">E-Réputation & Avis</h1>
            <p className="rm-subtitle">Répondez aux avis de toutes vos plateformes en un seul endroit</p>
          </div>
        </div>
        <div className="rm-topbar-right">
          <div className={`rm-sync-badge ${syncStatus}`}>
            {syncStatus === 'loading'   && <Loader2 size={11} className="rm-spin"/>}
            {syncStatus === 'connected' && <><span className="rm-dot green"/>{lastSync ? `Sync OK` : 'Channex'}</>}
            {syncStatus === 'error'     && <><span className="rm-dot red"/>Erreur API</>}
            {syncStatus === 'demo'      && <><span className="rm-dot orange"/>Mode Démo</>}
            {syncStatus === 'idle'      && <><span className="rm-dot grey"/>En attente</>}
          </div>
          <button className="rm-btn-icon" onClick={buildReviews}><RefreshCw size={14}/></button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="rm-kpi-row">
        <div className="rm-kpi">
          <span className="rm-kpi-label">Note Globale</span>
          <div className="rm-kpi-val">{avgRating}<span className="rm-kpi-max">/5</span></div>
          <Stars rating={Math.round(parseFloat(avgRating) || 0)} size={13}/>
        </div>
        <div className="rm-kpi">
          <span className="rm-kpi-label">À répondre</span>
          <div className="rm-kpi-val" style={{ color: pending > 0 ? '#FF385C' : '#222222' }}>{pending}</div>
          <span className="rm-kpi-sub">{pending > 0 ? 'En attente' : 'Tout traité ✓'}</span>
        </div>
        <div className="rm-kpi">
          <span className="rm-kpi-label">Total Avis</span>
          <div className="rm-kpi-val">{total}</div>
          <span className="rm-kpi-sub">{connectedOTAs.length || OTA_DEFS.length} plateformes</span>
        </div>
        <div className="rm-kpi">
          <span className="rm-kpi-label">Avis Positifs</span>
          <div className="rm-kpi-val" style={{ color: '#10B981' }}>{pctPositive}%</div>
          <span className="rm-kpi-sub">Notes 4★ et 5★</span>
        </div>
      </div>

      {/* ── NO CONNECTION BANNER ── */}
      {!hasAnyConn && (
        <div className="rm-banner">
          <Globe size={18} color="#FF385C"/>
          <div>
            <strong>Connectez vos plateformes pour importer vos vrais avis</strong>
            <p>Configurez Airbnb, Booking.com, Channex.io et plus encore pour centraliser tous vos avis ici.</p>
          </div>
          {setActiveView && (
            <button className="rm-btn-primary" onClick={() => setActiveView('distribution')}>
              Connecter <ChevronRight size={13}/>
            </button>
          )}
        </div>
      )}

      {/* ── SOURCE PILLS ── */}
      {sourcesInReviews.length > 1 && (
        <div className="rm-source-bar">
          <button className={`rm-source-pill ${filterSource === 'all' ? 'active' : ''}`} onClick={() => setFilterSource('all')}>
            Toutes <span className="rm-pill-count">{reviews.length}</span>
          </button>
          {sourcesInReviews.map(srcId => {
            const ota = OTA_DEFS.find(o => o.id === srcId);
            if (!ota) return null;
            const cnt = reviews.filter(r => r.source === srcId).length;
            const pnd = reviews.filter(r => r.source === srcId && !r.replied).length;
            return (
              <button
                key={srcId}
                className={`rm-source-pill ${filterSource === srcId ? 'active' : ''}`}
                style={filterSource === srcId ? { borderColor: ota.color, color: ota.color, background: ota.bg } : {}}
                onClick={() => setFilterSource(srcId)}
              >
                {ota.logo} {ota.name}
                <span className="rm-pill-count" style={pnd > 0 ? { background: ota.color, color: 'white' } : {}}>{pnd > 0 ? pnd : cnt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── CONTROLS BAR ── */}
      <div className="rm-controls">
        <div className="rm-tabs">
          {[
            { id: 'pending', label: 'À répondre', count: pending },
            { id: 'all',     label: 'Tous',        count: total },
            { id: 'replied', label: 'Traités',      count: reviews.filter(r => r.replied).length },
            { id: 'config',  label: 'Configuration', icon: <Settings size={13}/> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`rm-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon || null}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rm-tab-badge" style={tab.id === 'pending' ? { background: '#FF385C', color: 'white' } : {}}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
        <div className="rm-controls-right">
          {/* Rating filter */}
          <select className="rm-select" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
            <option value="all">⭐ Toutes notes</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 étoiles</option>
            <option value="4">⭐⭐⭐⭐ 4 étoiles</option>
            <option value="3">⭐⭐⭐ 3 étoiles</option>
            <option value="1-2">⭐⭐ 1-2 étoiles</option>
          </select>
          <div className="rm-search">
            <Search size={13} color="#AAAAAA"/>
            <input
              placeholder="Rechercher invité, mot-clé…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── CONFIG TAB ── */}
      {activeTab === 'config' && (
        <motion.div className="rm-config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rm-config-header">
            <ShieldCheck size={20} color="white"/>
            <div>
              <h2>Configuration E-Réputation</h2>
              <p>Gérez vos sources d'avis et les paramètres de l'IA de réponse.</p>
            </div>
          </div>
          <div className="rm-config-body">
            {/* Connected platforms */}
            <div className="rm-config-section">
              <h3><Globe size={14}/> Sources connectées</h3>
              <div className="rm-platforms-grid">
                {OTA_DEFS.map(ota => {
                  const isConn = !!localStorage.getItem(`cm_ota_${ota.id}`);
                  const revCount = reviews.filter(r => r.source === ota.id).length;
                  return (
                    <div key={ota.id} className={`rm-platform-card ${isConn ? 'connected' : ''}`}>
                      <div className="rm-platform-logo" style={{ background: isConn ? ota.bg : '#F7F7F7', color: ota.color }}>{ota.logo}</div>
                      <div className="rm-platform-info">
                        <div className="rm-platform-name">{ota.name}</div>
                        <div className="rm-platform-status" style={{ color: isConn ? '#059669' : '#AAAAAA' }}>
                          {isConn ? `✓ Connecté · ${revCount} avis` : 'Non connecté'}
                        </div>
                      </div>
                      {!isConn && setActiveView && (
                        <button className="rm-btn-connect" onClick={() => setActiveView('distribution')}>
                          Connecter
                        </button>
                      )}
                      {isConn && <span className="rm-badge-connected">Actif</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Settings */}
            <div className="rm-config-section">
              <h3><Sparkles size={14}/> Paramètres IA</h3>
              <div className="rm-ai-settings">
                {[
                  { label: 'Réponse auto 5★',          desc: 'Répondre automatiquement aux avis parfaits.', on: true  },
                  { label: 'Détection de langue',        desc: 'Répondre dans la langue du client.',         on: true  },
                  { label: 'Alerte avis négatif',        desc: 'Notification immédiate pour 1-2★.',          on: false },
                  { label: 'Rapport hebdomadaire',       desc: 'Synthèse e-réputation chaque lundi.',        on: true  },
                ].map(item => (
                  <div key={item.label} className="rm-ai-toggle">
                    <div>
                      <div className="rm-ai-toggle-label">{item.label}</div>
                      <div className="rm-ai-toggle-desc">{item.desc}</div>
                    </div>
                    <div className={`rm-toggle ${item.on ? 'on' : ''}`}><div className="rm-toggle-knob"/></div>
                  </div>
                ))}
                <div className="rm-ai-signature">
                  <label>Signature des réponses</label>
                  <input type="text" defaultValue="L'Équipe de Direction HosFlow"/>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── REVIEWS FEED ── */}
      {activeTab !== 'config' && (
        <div className="rm-feed">
          {filtered.length === 0 && (
            <div className="rm-empty">
              <Star size={32} color="#EBEBEB" fill="#EBEBEB"/>
              <p>{activeTab === 'pending' ? 'Tous les avis ont été traités !' : 'Aucun avis trouvé'}</p>
            </div>
          )}

          <AnimatePresence>
            {filtered.map(review => {
              const ota = OTA_DEFS.find(o => o.id === review.source);
              const isReplying = replyingId === review.id;
              return (
                <motion.div
                  key={review.id}
                  className={`rm-card ${review.replied ? 'replied' : 'pending'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  {/* Left meta */}
                  <div className="rm-card-left">
                    <div className="rm-avatar" style={{ background: ota?.bg || '#F7F7F7', color: ota?.color || '#717171' }}>
                      {review.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div className="rm-guest-name">{review.guestName}</div>
                    <div className="rm-guest-date">{fmtDate(review.date)}</div>
                    <div className="rm-ota-badge" style={{ background: ota?.bg || '#F7F7F7', color: ota?.color || '#717171' }}>
                      {ota?.logo} {review.sourceName}
                    </div>
                    {review.reservation && <div className="rm-reservation">#{review.reservation}</div>}
                    {review.room && <div className="rm-room">{review.room}</div>}
                  </div>

                  {/* Right content */}
                  <div className="rm-card-right">
                    <div className="rm-rating-row">
                      <Stars rating={review.rating}/>
                      <span className="rm-rating-num">{review.rating}/5</span>
                      {review.replied
                        ? <span className="rm-status-badge replied"><CheckCircle2 size={11}/> Répondu</span>
                        : <span className="rm-status-badge pending"><AlertCircle size={11}/> En attente</span>
                      }
                    </div>

                    <p className="rm-review-text">"{review.text}"</p>

                    <div className="rm-divider"/>

                    {/* Reply area */}
                    {review.replied ? (
                      <div className="rm-reply-box">
                        <div className="rm-reply-header">
                          <span className="rm-reply-label"><CheckCircle2 size={13}/> Votre réponse</span>
                        </div>
                        <p className="rm-reply-text">{review.reply}</p>
                      </div>
                    ) : isReplying ? (
                      <div className="rm-reply-editor">
                        <div className="rm-reply-editor-top">
                          <span className="rm-reply-editor-title">Rédiger une réponse</span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="rm-btn-ai"
                              onClick={() => generateReply(review)}
                              disabled={generating}
                            >
                              {generating ? <Loader2 size={13} className="rm-spin"/> : <Sparkles size={13}/>}
                              {generating ? 'Génération…' : 'Générer avec IA'}
                            </button>
                            <button className="rm-btn-icon-sm" onClick={() => { setReplyingId(null); setReplyText(''); }}><X size={13}/></button>
                          </div>
                        </div>
                        <textarea
                          className="rm-textarea"
                          placeholder="Répondez professionnellement à cet avis…"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={5}
                        />
                        <div className="rm-reply-actions">
                          <button className="rm-btn-cancel" onClick={() => { setReplyingId(null); setReplyText(''); }}>Annuler</button>
                          <button
                            className="rm-btn-send"
                            onClick={() => submitReply(review.id)}
                            disabled={!replyText.trim() || submitting}
                          >
                            {submitting ? <Loader2 size={14} className="rm-spin"/> : <Send size={14}/>}
                            Envoyer via {review.sourceName}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="rm-btn-reply"
                        onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                      >
                        <MessageSquare size={14}/> Répondre à cet avis
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReputationManager;
