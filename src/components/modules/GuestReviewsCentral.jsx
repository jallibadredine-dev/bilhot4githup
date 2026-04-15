import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle,
  Sparkles, Check, X, RefreshCw, Filter, Search,
  TrendingUp, Award, Zap, Globe, ChevronRight, ToggleLeft, ToggleRight,
  Building2, Home, Hotel
} from 'lucide-react';
import './GuestReviewsCentral.css';

/* ─── Mock Data ─── */
const PROPERTIES = [
  { id: 'p1', name: 'Riad Dar El Sadaka', type: 'Riad', avgRating: 4.9, reviewCount: 87, channels: ['airbnb', 'booking'] },
  { id: 'p2', name: 'Villa Ocean View',   type: 'Villa', avgRating: 4.7, reviewCount: 143, channels: ['booking', 'expedia'] },
  { id: 'p3', name: 'Appartement Sky Garden', type: 'Appartement', avgRating: 4.6, reviewCount: 54, channels: ['airbnb'] },
];

const CHANNELS = {
  airbnb:  { label: 'Airbnb',       color: '#FF5A5F', bg: '#FFF0F0', letter: 'A' },
  booking: { label: 'Booking.com',  color: '#003580', bg: '#E8F0FA', letter: 'B' },
  expedia: { label: 'Expedia',      color: '#00355F', bg: '#E8F2FA', letter: 'E' },
};

const CHANNEL_RATINGS = {
  p1: { airbnb: 4.9, booking: 4.8 },
  p2: { booking: 4.7, expedia: 4.6 },
  p3: { airbnb: 4.6 },
};

const MOCK_REVIEWS = [
  {
    id: 1, propId: 'p1', channel: 'airbnb', guest: 'Sarah Müller', country: '🇩🇪',
    rating: 5, date: 'Il y a 2h',
    text: "Superbe Riad, absolument magique ! L'accès par code était parfait, aucun besoin d'attendre. La déco est d'un goût raffiné. On reviendra assurément.",
    sentiment: 'positive', tag: 'Accès & Accueil',
  },
  {
    id: 2, propId: 'p1', channel: 'booking', guest: 'Marc Leroy', country: '🇫🇷',
    rating: 4, date: 'Hier',
    text: "Très bien situé dans la Médina, villa spacieuse et lumineuse. Check-in sans problème. Juste un peu bruyant la nuit côté artisans.",
    sentiment: 'positive', tag: 'Localisation',
  },
  {
    id: 3, propId: 'p2', channel: 'booking', guest: 'James Hoffman', country: '🇬🇧',
    rating: 3, date: 'Il y a 3j',
    text: "La vue sur mer est superbe mais la climatisation ne fonctionnait pas correctement lors de notre séjour. Le staff a répondu rapidement, mais le problème persistait.",
    sentiment: 'negative', tag: 'Équipements',
  },
  {
    id: 4, propId: 'p2', channel: 'expedia', guest: 'Yasmine Al-Rashidi', country: '🇦🇪',
    rating: 5, date: 'Il y a 4j',
    text: "Magnifique villa avec une piscine exceptionnelle. Le service était impeccable, la cuisine équipée parfaite. Vraiment une expérience 5 étoiles.",
    sentiment: 'positive', tag: 'Confort',
  },
  {
    id: 5, propId: 'p3', channel: 'airbnb', guest: 'Lucie Fontaine', country: '🇧🇪',
    rating: 2, date: 'Il y a 5j',
    text: "Déçue par l'état de la salle de bain. Les photos ne correspondent pas à la réalité. WiFi très lent. Je ne recommande pas pour le prix demandé.",
    sentiment: 'urgent', tag: 'Hygiène & Photos',
  },
  {
    id: 6, propId: 'p1', channel: 'airbnb', guest: 'Carlos Mendez', country: '🇪🇸',
    rating: 5, date: 'Il y a 6j',
    text: "Un séjour inoubliable au Riad. L'hôte était aux petits soins, les chambres splendides. Le petit déjeuner sur le rooftop est un must!",
    sentiment: 'positive', tag: 'Hospitalité',
  },
];

const AI_RESPONSES = {
  positive: [
    "Chère {guest}, merci infiniment pour ce retour chaleureux ! 🌟 Votre satisfaction est notre plus belle récompense. Nous espérons vous accueillir à nouveau très bientôt pour un séjour encore plus exceptionnel. Avec toute notre gratitude,",
    "Bonjour {guest}, votre commentaire nous touche profondément ! 🙏 C'est avec un immense plaisir que nous avons pu contribuer à votre bien-être. L'ensemble de notre équipe est honorée de votre confiance et attend impatiemment votre prochain séjour.",
  ],
  negative: [
    "Chère {guest}, merci pour votre retour sincère. Nous sommes sincèrement désolés de l'expérience que vous avez vécue. 😔 Votre confort est notre priorité absolue et votre signalement nous permettra d'améliorer nos standards. Accepteriez-vous que nous vous contactions directement pour trouver une solution équitable ?",
  ],
  urgent: [
    "Chère {guest}, nous vous présentons nos sincères excuses pour les désagréments rencontrés. 🙏 Cela ne reflète absolument pas nos standards de qualité. Votre signalement est traité en urgence par notre direction. Nous souhaiterions vous contacter directement pour remédier à la situation et envisager un geste commercial. Votre confiance mérite mieux.",
  ],
};

const getSentimentConfig = (s) => ({
  positive: { label: 'Positif',  color: '#10B981', bg: '#ECFDF5', icon: <ThumbsUp size={11} /> },
  negative: { label: 'Négatif',  color: '#F59E0B', bg: '#FFFBEB', icon: <ThumbsDown size={11} /> },
  urgent:   { label: 'Urgent',   color: '#EF4444', bg: '#FEF2F2', icon: <AlertCircle size={11} /> },
}[s]);

const Stars = ({ rating, size = 14 }) => (
  <div className="grc-stars" style={{ '--s': size + 'px' }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} fill={i <= rating ? '#FBBF24' : 'none'} color={i <= rating ? '#FBBF24' : '#D1D5DB'} />
    ))}
  </div>
);

/* ─── Review Card ─── */
const ReviewCard = ({ review, autoReply5Star }) => {
  const [showAI, setShowAI]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [sent, setSent]           = useState(false);
  const ch  = CHANNELS[review.channel];
  const sen = getSentimentConfig(review.sentiment);

  const handleAIReply = () => {
    setShowAI(true);
    setAiLoading(true);
    const pool = AI_RESPONSES[review.sentiment] || AI_RESPONSES.positive;
    const draft = pool[Math.floor(Math.random() * pool.length)].replace('{guest}', review.guest.split(' ')[0]);
    setTimeout(() => {
      setAiResponse(draft);
      setAiLoading(false);
    }, 1400);
  };

  const handleSend = () => { setSent(true); };

  const isAutoReplied = autoReply5Star && review.rating === 5;

  return (
    <motion.div
      className={`grc-review-card ${review.sentiment}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grc-review-top">
        <div className="grc-guest-avatar">
          {review.guest.charAt(0)}
        </div>
        <div className="grc-guest-info">
          <div className="grc-guest-name">{review.guest} <span>{review.country}</span></div>
          <div className="grc-review-meta">
            <span className="grc-channel-badge" style={{ background: ch.bg, color: ch.color }}>
              {ch.letter} {ch.label}
            </span>
            <span className="grc-date">{review.date}</span>
          </div>
        </div>
        <div className="grc-review-right">
          <Stars rating={review.rating} />
          <div className="grc-sentiment-tag" style={{ background: sen.bg, color: sen.color }}>
            {sen.icon} <span>{sen.label}</span>
          </div>
        </div>
      </div>

      {review.tag && (
        <div className="grc-topic-tag">#{review.tag}</div>
      )}

      <p className="grc-review-text">"{review.text}"</p>

      {isAutoReplied ? (
        <div className="grc-auto-replied">
          <Zap size={13} /> Réponse automatique envoyée (5★)
        </div>
      ) : sent ? (
        <div className="grc-auto-replied">
          <Check size={13} /> Réponse publiée avec succès
        </div>
      ) : (
        <div className="grc-review-actions">
          <button className="grc-btn-ai" onClick={handleAIReply} disabled={showAI}>
            <Sparkles size={14} />
            <span>Répondre avec l'IA</span>
          </button>
          <button className="grc-btn-ignore">Ignorer</button>
        </div>
      )}

      <AnimatePresence>
        {showAI && !sent && (
          <motion.div
            className="grc-ai-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {aiLoading ? (
              <div className="grc-ai-loading">
                <div className="grc-ai-spinner" />
                <span>L'IA Antigravity rédige votre réponse…</span>
              </div>
            ) : (
              <>
                <div className="grc-ai-badge">
                  <Sparkles size={13} /> Réponse IA générée
                </div>
                <textarea
                  className="grc-ai-textarea"
                  value={aiResponse}
                  onChange={e => setAiResponse(e.target.value)}
                  rows={4}
                />
                <div className="grc-ai-footer">
                  <button className="grc-btn-cancel-ai" onClick={() => { setShowAI(false); setAiResponse(''); }}>
                    <X size={13} /> Annuler
                  </button>
                  <button className="grc-btn-send-ai" onClick={handleSend}>
                    <Check size={13} /> Publier la réponse
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── Mini Bar Chart (CSS divs) ─── */
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div className="grc-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="grc-bar-col">
          <div className="grc-bar-fill" style={{ height: `${(d.count / max) * 100}%` }} />
          <span className="grc-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Main Component ─── */
const GuestReviewsCentral = () => {
  const [selectedProp, setSelectedProp] = useState('p1');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [filterChannel, setFilterChannel]     = useState('all');
  const [searchQuery, setSearchQuery]         = useState('');
  const [autoReply5Star, setAutoReply5Star]   = useState(true);
  const [syncing, setSyncing]                 = useState(false);

  const prop = PROPERTIES.find(p => p.id === selectedProp);
  const channelRatings = CHANNEL_RATINGS[selectedProp] || {};

  const visibleReviews = MOCK_REVIEWS.filter(r => {
    if (r.propId !== selectedProp) return false;
    if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
    if (filterChannel !== 'all' && r.channel !== filterChannel) return false;
    if (searchQuery && !r.text.toLowerCase().includes(searchQuery.toLowerCase()) && !r.guest.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const globalAvg = prop ? prop.avgRating : 0;
  const barData = [
    { label: 'Lun', count: 3 }, { label: 'Mar', count: 7 },
    { label: 'Mer', count: 5 }, { label: 'Jeu', count: 9 },
    { label: 'Ven', count: 12 },{ label: 'Sam', count: 8 },
    { label: 'Dim', count: 4 },
  ];

  return (
    <div className="grc-root">
      {/* ─── Page Header ─── */}
      <div className="grc-page-header">
        <div className="grc-header-left">
          <div className="grc-header-icon"><MessageSquare size={22} /></div>
          <div>
            <h1>Avis &amp; E-Réputation</h1>
            <p>Centralisez et répondez aux avis de tous vos canaux.</p>
          </div>
        </div>
        <div className="grc-header-actions">
          <button className={`grc-btn-sync ${syncing ? 'syncing' : ''}`} onClick={handleSync}>
            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
            <span>{syncing ? 'Synchronisation...' : 'Sync API Channels'}</span>
          </button>
          <div className="grc-sync-status">
            <div className="grc-sync-dot" />
            <span>Beds24 · SiteMinder connectés</span>
          </div>
        </div>
      </div>

      <div className="grc-layout">
        {/* ─── Left: Property Selector ─── */}
        <aside className="grc-sidebar">
          <div className="grc-sidebar-label">LOGEMENTS</div>
          {PROPERTIES.map(p => {
            const isSelected = p.id === selectedProp;
            const TypeIcon = p.type === 'Villa' ? Hotel : p.type === 'Riad' ? Home : Building2;
            return (
              <button
                key={p.id}
                className={`grc-prop-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedProp(p.id)}
              >
                <div className="grc-prop-icon"><TypeIcon size={16} /></div>
                <div className="grc-prop-info">
                  <strong>{p.name}</strong>
                  <span>{p.reviewCount} avis</span>
                </div>
                <div className="grc-prop-rating">
                  <Star size={11} fill="#FBBF24" color="#FBBF24" />
                  <span>{p.avgRating}</span>
                </div>
              </button>
            );
          })}

          <div className="grc-sidebar-sep" />
          <div className="grc-sidebar-label">AUTO-RÉPONSE</div>
          <div className="grc-auto-toggle-row">
            <div>
              <strong>Réponse 5★ auto</strong>
              <p>Répondre automatiquement aux avis parfaits</p>
            </div>
            <button className="grc-toggle-btn" onClick={() => setAutoReply5Star(p => !p)}>
              {autoReply5Star
                ? <ToggleRight size={28} color="#6366F1" />
                : <ToggleLeft size={28} color="#94A3B8" />
              }
            </button>
          </div>
        </aside>

        {/* ─── Center: Review Feed ─── */}
        <main className="grc-feed">
          {/* Feed Filters */}
          <div className="grc-feed-controls">
            <div className="grc-search-wrap">
              <Search size={15} />
              <input
                className="grc-search-input"
                placeholder="Rechercher un avis ou un invité…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grc-filter-row">
              {['all','positive','negative','urgent'].map(s => (
                <button
                  key={s}
                  className={`grc-filter-chip ${filterSentiment === s ? 'active' : ''}`}
                  onClick={() => setFilterSentiment(s)}
                >
                  {s === 'all' ? 'Tous' : s === 'positive' ? '👍 Positifs' : s === 'negative' ? '⚠️ Négatifs' : '🚨 Urgents'}
                </button>
              ))}
              <select
                className="grc-channel-select"
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value)}
              >
                <option value="all">Tous les canaux</option>
                {Object.entries(CHANNELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Feed Cards */}
          <div className="grc-feed-list">
            {visibleReviews.length === 0 ? (
              <div className="grc-empty-state">
                <MessageSquare size={40} strokeWidth={1} />
                <p>Aucun avis pour ces critères</p>
              </div>
            ) : (
              visibleReviews.map(r => (
                <ReviewCard key={r.id} review={r} autoReply5Star={autoReply5Star} />
              ))
            )}
          </div>
        </main>

        {/* ─── Right: E-Réputation Score Panel ─── */}
        <aside className="grc-score-panel">
          {/* Global Score */}
          <div className="grc-score-card">
            <div className="grc-score-header">
              <Award size={18} />
              <span>Score Global</span>
              <div className="grc-live-dot" />
            </div>
            <div className="grc-score-big">{globalAvg.toFixed(1)}</div>
            <Stars rating={Math.round(globalAvg)} size={18} />
            <p className="grc-score-sub">{prop?.reviewCount} avis importés</p>

            {/* Channel Breakdown */}
            <div className="grc-channel-breakdown">
              {Object.entries(channelRatings).map(([ch, rat]) => {
                const c = CHANNELS[ch];
                return (
                  <div key={ch} className="grc-breakdown-row">
                    <span className="grc-breakdown-dot" style={{ background: c.color }} />
                    <span className="grc-breakdown-name">{c.label}</span>
                    <div className="grc-breakdown-bar-wrap">
                      <div className="grc-breakdown-bar" style={{ width: `${(rat / 5) * 100}%`, background: c.color }} />
                    </div>
                    <span className="grc-breakdown-val">{rat.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Chart */}
          <div className="grc-chart-card">
            <div className="grc-chart-header">
              <TrendingUp size={16} />
              <span>Avis cette semaine</span>
            </div>
            <MiniBarChart data={barData} />
          </div>

          {/* Stats Grid */}
          <div className="grc-stats-grid">
            <div className="grc-mini-stat">
              <span className="grc-mini-val green">{visibleReviews.filter(r => r.sentiment === 'positive').length}</span>
              <span className="grc-mini-label">Positifs</span>
            </div>
            <div className="grc-mini-stat">
              <span className="grc-mini-val orange">{visibleReviews.filter(r => r.sentiment === 'negative').length}</span>
              <span className="grc-mini-label">Négatifs</span>
            </div>
            <div className="grc-mini-stat">
              <span className="grc-mini-val red">{visibleReviews.filter(r => r.sentiment === 'urgent').length}</span>
              <span className="grc-mini-label">Urgents</span>
            </div>
            <div className="grc-mini-stat">
              <span className="grc-mini-val indigo">
                {autoReply5Star ? visibleReviews.filter(r => r.rating === 5).length : 0}
              </span>
              <span className="grc-mini-label">Auto-répondu</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GuestReviewsCentral;
