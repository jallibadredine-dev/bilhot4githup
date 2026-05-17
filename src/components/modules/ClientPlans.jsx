import React, { useState, useEffect } from 'react';
import {
  Crown, Check, X, Zap, Shield, Globe, Lock,
  Key, Copy, RefreshCw, CheckCircle2, AlertCircle,
  ChevronRight, ExternalLink, Sparkles, Building2,
  CreditCard, Wifi, Star, Ticket, BadgeCheck,
  ChevronDown, ChevronUp, Clock, Infinity,
  MessageCircle, Plus, Loader2, Package, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClientPlans.css';

/* ─── Engagement periods ────────────────────────────────── */
const ENGAGEMENTS = [
  { id: 'monthly',   label: '1 Mois',  discount: 0,  badge: null   },
  { id: 'annual',    label: '1 An',    discount: 5,  badge: '-5%'  },
  { id: 'biennial',  label: '2 Ans',   discount: 10, badge: '-10%' },
  { id: 'triennial', label: '3 Ans',   discount: 20, badge: '-20%' },
];

/* ─── Constants ─────────────────────────────────────────── */
/* ── Tarification par chambre (MAD — Dirhams) ── */
const calcStarter  = (rooms, annual) => Math.round(rooms * 25 * (annual ? 0.80 : 1));
const calcPro      = (rooms, annual) => Math.round(rooms * 30 * (annual ? 0.80 : 1));

const PLANS = [
  {
    id: 'starter',
    tier: 'ESSENTIEL',
    name: 'Starter',
    price: null,
    unitLabel: '25 MAD/chambre',
    formula: calcStarter,
    period: '/mois',
    color: '#3B82F6',
    bg: '#EFF6FF',
    features: [
      { text: 'PMS Cloud (jusqu\'à 10 propriétés)',  ok: true },
      { text: 'Calendrier des réservations',          ok: true },
      { text: 'Facturation & Taxes',                  ok: true },
      { text: 'Support par email',                    ok: true },
      { text: 'Channel Manager',                      ok: false },
      { text: 'Revenue AI',                           ok: false },
      { text: 'Serrures connectées',                  ok: false },
    ],
  },
  {
    id: 'pro',
    tier: 'PRO',
    name: 'Intelligence',
    price: null,
    unitLabel: '30 MAD/chambre',
    formula: calcPro,
    period: '/mois',
    color: '#FF385C',
    bg: '#FFF1F3',
    featured: true,
    features: [
      { text: 'PMS Cloud illimité',                   ok: true },
      { text: 'Channel Manager (Channex)',             ok: true },
      { text: 'Messagerie OTA unifiée',               ok: true },
      { text: 'Revenue AI & Yield',                   ok: true },
      { text: 'Automatisations avancées',              ok: true },
      { text: 'Support prioritaire',                  ok: true },
      { text: 'Serrures connectées',                  ok: false },
    ],
  },
  {
    id: 'lifetime',
    tier: 'PACK À VIE',
    name: 'Elite Lifetime',
    price: 3490,
    unitLabel: null,
    formula: null,
    period: 'paiement unique',
    color: '#D97706',
    bg: '#FFFBEB',
    lifetime: true,
    features: [
      { text: 'Tout le plan PRO, à vie',              ok: true },
      { text: 'Code de vérification unique',           ok: true, badge: 'CODE' },
      { text: 'Licence perpétuelle nominative',        ok: true, badge: 'LICENCE' },
      { text: 'Channel Manager (configuration req.)',  ok: true, badge: 'NON INTÉGRÉ', warn: true },
      { text: 'Serrures connectées incluses',          ok: true },
      { text: 'Mises à jour à vie',                   ok: true },
      { text: 'Support VIP 24/7',                     ok: true },
    ],
  },
];

/* ─── Sub-components ─────────────────────────────────────── */
const FeatureRow = ({ feature }) => (
  <li className="cp-feat">
    {feature.ok
      ? <Check size={13} className="cp-feat-ok" />
      : <X     size={13} className="cp-feat-no" />}
    <span className={feature.ok ? '' : 'muted'}>{feature.text}</span>
    {feature.badge && (
      <span className={`cp-feat-badge ${feature.warn ? 'warn' : feature.badge === 'LICENCE' ? 'gold' : 'blue'}`}>
        {feature.badge}
      </span>
    )}
  </li>
);

/* ─── Lifetime activation flow ────────────────────────────── */
const ActivationModal = ({ onClose }) => {
  const [step, setStep]       = useState('verify'); // verify | license | done
  const [code, setCode]       = useState('');
  const [codeError, setCodeError] = useState('');
  const [checking, setChecking]   = useState(false);
  const [licenseKey]          = useState('HF-LIFE-' + Math.random().toString(36).slice(2,6).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase());
  const [copied, setCopied]   = useState(false);

  const DEMO_CODES = ['HOVA2026', 'ELITE-ACCESS', 'LIFETIME'];

  const handleVerify = () => {
    if (!code.trim()) { setCodeError('Veuillez saisir votre code d\'activation.'); return; }
    if (!DEMO_CODES.includes(code.trim().toUpperCase())) {
      setCodeError('Code invalide. Vérifiez votre email de confirmation.');
      return;
    }
    setCodeError('');
    setChecking(true);
    setTimeout(() => { setChecking(false); setStep('license'); }, 1400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(licenseKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="cp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="cp-modal"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.97 }}
        transition={{ duration: 0.22 }}
      >
        <button className="cp-modal-close" onClick={onClose}><X size={16}/></button>

        {/* ── Step: verify ── */}
        {step === 'verify' && (
          <div className="cp-modal-body">
            <div className="cp-modal-icon amber"><Ticket size={22}/></div>
            <h2>Activer votre Pack à Vie</h2>
            <p className="cp-modal-sub">Saisissez le code de vérification reçu après achat. <span className="cp-demo-hint">(Démo : HOVA2026)</span></p>

            <div className={`cp-code-input-wrap ${codeError ? 'error' : ''}`}>
              <Key size={15} className="cp-input-icon" />
              <input
                className="cp-code-input"
                placeholder="ex. HOVA2026"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
            </div>
            {codeError && <div className="cp-error-msg"><AlertCircle size={12}/>{codeError}</div>}

            <div className="cp-modal-actions">
              <button className="cp-modal-btn primary" onClick={handleVerify} disabled={checking}>
                {checking ? <><RefreshCw size={13} className="spin"/> Vérification…</> : 'Vérifier le code'}
              </button>
              <button className="cp-modal-btn ghost" onClick={onClose}>Annuler</button>
            </div>

            <div className="cp-modal-info">
              <Shield size={12}/>
              Code à usage unique · Lié à votre compte HosFlow
            </div>
          </div>
        )}

        {/* ── Step: license ── */}
        {step === 'license' && (
          <div className="cp-modal-body">
            <div className="cp-modal-icon green"><BadgeCheck size={22}/></div>
            <h2>Code vérifié — Votre Licence</h2>
            <p className="cp-modal-sub">Votre licence perpétuelle est maintenant générée et liée à ce compte.</p>

            <div className="cp-license-box">
              <div className="cp-license-label"><Key size={11}/>CLEF DE LICENCE</div>
              <div className="cp-license-key">{licenseKey}</div>
              <button className="cp-copy-btn" onClick={handleCopy}>
                {copied ? <><CheckCircle2 size={13}/> Copié</> : <><Copy size={13}/> Copier</>}
              </button>
            </div>

            {/* Channel Manager — non intégré */}
            <div className="cp-channel-warn">
              <div className="cp-cw-head">
                <Globe size={15} color="#D97706"/>
                <span>Channel Manager</span>
                <span className="cp-badge-warn">NON INTÉGRÉ</span>
              </div>
              <p>Inclus dans votre licence mais nécessite une configuration manuelle. Contactez le support pour activer la synchronisation OTA.</p>
              <div className="cp-cw-steps">
                <div className="cp-cw-step pending"><Clock size={11}/>Connexion Channex.io en attente</div>
                <div className="cp-cw-step pending"><Clock size={11}/>Mapping des propriétés à configurer</div>
                <div className="cp-cw-step pending"><Clock size={11}/>Synchronisation OTA à activer</div>
              </div>
              <button className="cp-contact-btn" onClick={() => setStep('done')}>
                Contacter le support pour configurer <ChevronRight size={12}/>
              </button>
            </div>

            <button className="cp-modal-btn primary full" onClick={() => setStep('done')}>
              Accéder au dashboard <Sparkles size={14}/>
            </button>
          </div>
        )}

        {/* ── Step: done ── */}
        {step === 'done' && (
          <div className="cp-modal-body center">
            <motion.div className="cp-success-icon"
              initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Crown size={32} color="white"/>
            </motion.div>
            <h2>Pack à Vie activé !</h2>
            <p className="cp-modal-sub">Votre licence Elite est désormais active sur ce compte. Le Channel Manager sera configuré par notre équipe sous 24 h.</p>
            <div className="cp-success-tags">
              <span className="cp-stag"><Check size={10}/>Licence enregistrée</span>
              <span className="cp-stag warn"><Clock size={10}/>Channel Manager en cours</span>
            </div>
            <button className="cp-modal-btn primary full" onClick={onClose}>Fermer</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────── */
const ClientPlans = ({ pmsMode }) => {
  const [activateOpen,    setActivateOpen]    = useState(false);
  const [activePlan]                          = useState('pro');
  const [annual,          setAnnual]          = useState(false);
  const [faqOpen,         setFaqOpen]         = useState(null);
  const [rooms,           setRooms]           = useState(10);
  const [engId,           setEngId]           = useState('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [checkoutError,   setCheckoutError]   = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const changeRooms = (delta) => setRooms(r => Math.max(1, Math.min(500, r + delta)));

  /* ── Detect ?checkout=success in URL ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      window.history.replaceState({}, '', window.location.pathname + '?plans');
    }
  }, []);

  /* ── Stripe Checkout ── */
  const handleCheckout = async (planId, addChannelManager = false) => {
    const key = planId + (addChannelManager ? '_cm' : '');
    setCheckoutLoading(key);
    setCheckoutError(null);
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId, rooms, period: engId, addChannelManager }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Erreur lors de la création du paiement.');
        setCheckoutLoading(null);
      }
    } catch {
      setCheckoutError('Serveur de paiement inaccessible. Veuillez réessayer.');
      setCheckoutLoading(null);
    }
  };

  const eng        = ENGAGEMENTS.find(e => e.id === engId);
  const priceStd   = Math.round(rooms * 25 * (1 - eng.discount / 100));
  const priceInteg = Math.round(rooms * 30 * (1 - eng.discount / 100));

  const FAQ = [
    { q: 'Comment fonctionne le Pack à Vie ?', a: 'Vous payez une seule fois et accédez à toutes les fonctionnalités PRO à vie, y compris les mises à jour futures. Le Channel Manager est inclus mais nécessite une configuration initiale avec notre équipe.' },
    { q: 'Qu\'est-ce que le code de vérification ?', a: 'Après achat du Pack à Vie, vous recevez un code unique par email. Ce code valide l\'authenticité de votre licence et déclenche la génération de votre clef de licence nominative.' },
    { q: 'Pourquoi le Channel Manager est-il "non intégré" ?', a: 'Pour les licences à vie, le Channel Manager est inclus dans l\'abonnement mais requiert une configuration manuelle avec Channex.io. Notre équipe vous accompagne dans le processus sous 24 h.' },
    { q: 'Puis-je transférer ma licence ?', a: 'La licence est nominative et liée à votre compte HosFlow. Un transfert est possible sur demande auprès du support, sous réserve de validation d\'identité.' },
  ];

  return (
    <motion.div className="cp-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* ── Checkout success banner ── */}
      <AnimatePresence>
        {checkoutSuccess && (
          <motion.div className="cp-checkout-success"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <CheckCircle2 size={18} color="#10B981"/>
            <div>
              <strong>Paiement confirmé !</strong>
              <span> Votre abonnement est actif. Bienvenue sur HosFlow.</span>
            </div>
            <button onClick={() => setCheckoutSuccess(false)}><X size={14}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Checkout error banner ── */}
      <AnimatePresence>
        {checkoutError && (
          <motion.div className="cp-checkout-error"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <AlertCircle size={16} color="#EF4444"/>
            <span>{checkoutError}</span>
            <button onClick={() => setCheckoutError(null)}><X size={13}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="cp-header">
        <div className="cp-header-text">
          <h1>Abonnement & Licences</h1>
          <p>Choisissez votre plan, souscrivez en ligne et gérez votre abonnement.</p>
        </div>
        <div className="cp-header-actions">
          <button className="cp-activate-btn" onClick={() => setActivateOpen(true)}>
            <Ticket size={14}/> Activer une licence
          </button>
        </div>
      </div>

      {/* ── Simulator card (rooms + engagement) ── */}
      <div className="cp-simulator-card">
        <div className="cp-sim-title">Simulateur de Plan</div>
        <p className="cp-sim-sub">Ajustez pour voir votre tarif personnalisé</p>

        <div className="cp-sim-row">
          {/* Rooms */}
          <div className="cp-sim-col">
            <div className="cp-sim-label">CHAMBRES</div>
            <div className="cp-sim-rooms-wrap">
              <input
                type="range" min={1} max={100} value={rooms}
                className="cp-sim-slider"
                onChange={e => setRooms(parseInt(e.target.value))}
              />
              <div className="cp-sim-rooms-info">
                <span className="cp-sim-rooms-num">{rooms}</span>
                <div className="cp-sim-rooms-edge"><span>1 CH.</span><span>100 CH.</span></div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="cp-sim-col">
            <div className="cp-sim-label">ENGAGEMENT
              {eng.discount > 0 && <span className="cp-sim-discount-tag">Paiement {eng.label === '1 An' ? 'Annuel' : eng.label === '2 Ans' ? 'Biennal' : 'Triennal'}</span>}
            </div>
            <div className="cp-eng-tabs">
              {ENGAGEMENTS.map(e => (
                <button
                  key={e.id}
                  className={`cp-eng-tab ${engId === e.id ? 'active' : ''}`}
                  onClick={() => setEngId(e.id)}
                >
                  {e.label}
                  {e.badge && <span className="cp-eng-badge">{e.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Plans grid ── */}
      <div className="cp-plans-grid">

        {/* ─ PMS Standard ─ */}
        <motion.div className="cp-card" whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <div className="cp-card-top" style={{ '--plan-color': '#3B82F6' }}>
            <div className="cp-plan-tier" style={{ color: '#3B82F6' }}>ESSENTIEL</div>
            <div className="cp-plan-name">PMS Standard</div>
            <div className="cp-plan-price">
              <span className="amount">{priceStd}<span className="currency"> MAD</span></span>
              <span className="period">/mois</span>
            </div>
            <div className="cp-price-breakdown">
              <div className="cp-pb-row"><span>Prix unit.</span><span>25 MAD /ch</span></div>
              <div className="cp-pb-row"><span>Volume</span><span>{rooms} ch</span></div>
              {eng.discount > 0 && <div className="cp-pb-row discount"><span>Réduction {eng.label}</span><span>−{eng.discount}%</span></div>}
              <div className="cp-pb-total"><span>Total</span><span>{priceStd} MAD</span></div>
            </div>
          </div>
          <ul className="cp-feats-list">
            {PLANS.find(p => p.id === 'starter').features.map((f, i) => <FeatureRow key={i} feature={f} />)}
          </ul>
          <div className="cp-card-action">
            <button
              className="cp-btn trial-btn"
              onClick={() => handleCheckout('standard')}
              disabled={checkoutLoading === 'standard'}
            >
              {checkoutLoading === 'standard'
                ? <><Loader2 size={14} className="spin"/> Redirection…</>
                : <><Sparkles size={13}/> Essai Gratuit 14 jours</>
              }
            </button>
            <div className="cp-trial-note">Sans carte bancaire • Annulable à tout moment</div>
          </div>
        </motion.div>

        {/* ─ PMS Intégral (featured) ─ */}
        <motion.div className="cp-card featured" whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <div className="cp-recommended">RECOMMANDÉ</div>
          <div className="cp-card-top" style={{ '--plan-color': '#FF385C' }}>
            <div className="cp-plan-tier" style={{ color: '#FF385C' }}>PRO</div>
            <div className="cp-plan-name">PMS Intégral</div>
            <div className="cp-plan-price">
              <span className="amount">{priceInteg}<span className="currency"> MAD</span></span>
              <span className="period">/mois</span>
            </div>
            <div className="cp-price-breakdown">
              <div className="cp-pb-row"><span>Prix unit.</span><span>30 MAD /ch</span></div>
              <div className="cp-pb-row"><span>Volume</span><span>{rooms} ch</span></div>
              {eng.discount > 0 && <div className="cp-pb-row discount"><span>Réduction {eng.label}</span><span>−{eng.discount}%</span></div>}
              <div className="cp-pb-total"><span>À payer</span><span>{priceInteg} MAD</span></div>
            </div>
          </div>
          <ul className="cp-feats-list">
            {PLANS.find(p => p.id === 'pro').features.map((f, i) => <FeatureRow key={i} feature={f} />)}
          </ul>
          <div className="cp-card-action">
            <button
              className="cp-btn featured-btn"
              onClick={() => handleCheckout('integral')}
              disabled={checkoutLoading === 'integral'}
            >
              {checkoutLoading === 'integral'
                ? <><Loader2 size={14} className="spin"/> Redirection…</>
                : <>Choisir ce plan <ArrowRight size={13}/></>
              }
            </button>
          </div>
        </motion.div>

        {/* ─ Elite Lifetime ─ */}
        <motion.div className="cp-card lifetime" whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <div className="cp-lifetime-badge"><Infinity size={11}/> À VIE</div>
          <div className="cp-card-top" style={{ '--plan-color': '#D97706' }}>
            <div className="cp-plan-tier" style={{ color: '#D97706' }}>PACK À VIE</div>
            <div className="cp-plan-name">Elite Lifetime</div>
            <div className="cp-plan-price">
              <span className="amount">3 490<span className="currency"> MAD</span></span>
              <span className="period">paiement unique</span>
            </div>
          </div>
          <ul className="cp-feats-list">
            {PLANS.find(p => p.id === 'lifetime').features.map((f, i) => <FeatureRow key={i} feature={f} />)}
          </ul>
          <div className="cp-card-action">
            <button
              className="cp-btn lifetime-stripe-btn"
              onClick={() => handleCheckout('lifetime')}
              disabled={checkoutLoading === 'lifetime'}
            >
              {checkoutLoading === 'lifetime'
                ? <><Loader2 size={14} className="spin"/> Redirection…</>
                : <><CreditCard size={13}/> Acheter la licence</>
              }
            </button>
            <button className="cp-btn ghost-btn" onClick={() => setActivateOpen(true)}>
              <Key size={13}/> J'ai déjà un code
            </button>
          </div>
          <div className="cp-lifetime-note">
            <Shield size={11} color="#D97706"/>
            Paiement unique · Mises à jour à vie · Support VIP
          </div>
        </motion.div>
      </div>

      {/* ── Channel Manager Add-on ── */}
      <div className="cp-cm-addon-card">
        <div className="cp-cma-left">
          <div className="cp-cma-icon"><Globe size={20} color="#3B82F6"/></div>
          <div>
            <div className="cp-cma-title">
              Channel Manager Add-on
              <span className="cp-cma-badge">Pour PMS Standard</span>
            </div>
            <div className="cp-cma-sub">Synchronisation OTA en temps réel via Channex.io — Airbnb, Booking.com, Vrbo…</div>
          </div>
        </div>
        <div className="cp-cma-pricing">
          <div className="cp-cma-price">
            <span className="cp-cma-amount">{rooms * 25}</span>
            <span className="cp-cma-cur"> MAD/mois</span>
          </div>
          <div className="cp-cma-formula">25 MAD × {rooms} chambres</div>
        </div>
        <div className="cp-cma-actions">
          <button
            className="cp-btn featured-btn sm"
            onClick={() => handleCheckout('standard', true)}
            disabled={checkoutLoading === 'standard_cm'}
          >
            {checkoutLoading === 'standard_cm'
              ? <><Loader2 size={13} className="spin"/> Redirection…</>
              : <><Plus size={13}/> Standard + Channel Manager</>
            }
          </button>
          <button
            className="cp-btn ghost-btn sm"
            onClick={() => handleCheckout('cm_addon')}
            disabled={checkoutLoading === 'cm_addon'}
          >
            {checkoutLoading === 'cm_addon'
              ? <><Loader2 size={13} className="spin"/> …</>
              : <>Add-on seul</>
            }
          </button>
        </div>
        <div className="cp-cma-lifetime">
          <span>Option à vie :</span>
          <button
            className="cp-cma-life-btn"
            onClick={() => handleCheckout('cm_lifetime')}
            disabled={checkoutLoading === 'cm_lifetime'}
          >
            {checkoutLoading === 'cm_lifetime' ? <Loader2 size={11} className="spin"/> : <Infinity size={11}/>}
            Channel Manager Lifetime — 1 490 MAD
          </button>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="cp-faq">
        <div className="cp-faq-title">Questions fréquentes</div>
        {FAQ.map((item, i) => (
          <div key={i} className={`cp-faq-item ${faqOpen === i ? 'open' : ''}`}>
            <button className="cp-faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
              {item.q}
              {faqOpen === i ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            <AnimatePresence>
              {faqOpen === i && (
                <motion.div className="cp-faq-a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <p>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Dark footer bar ── */}
      <div className="cp-footer-bar">
        <div className="cp-footer-left">
          <Package size={16}/>
          <span>Config + Formation : <strong>1 500 MAD</strong> <em>(paiement unique)</em></span>
          <span className="cp-footer-sub">Migration de données, onboarding et formation inclus</span>
        </div>
        <a
          href="https://wa.me/212600000000?text=Bonjour%2C%20je%20souhaite%20configurer%20HosFlow"
          target="_blank"
          rel="noopener noreferrer"
          className="cp-whatsapp-btn"
        >
          <MessageCircle size={15}/> WhatsApp Expert
        </a>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activateOpen && <ActivationModal onClose={() => setActivateOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientPlans;
