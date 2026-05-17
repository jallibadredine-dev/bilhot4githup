import React, { useState, useEffect } from 'react';
import {
  Crown, Check, X, Zap, Shield, Globe, Lock,
  Key, Copy, RefreshCw, CheckCircle2, AlertCircle,
  ChevronRight, ExternalLink, Sparkles, Building2,
  CreditCard, Wifi, Star, Ticket, BadgeCheck,
  ChevronDown, ChevronUp, Clock, Infinity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClientPlans.css';

/* ─── Constants ─────────────────────────────────────────── */
/* ── Pricing formulas (per room) ── */
const calcStarter  = (rooms, annual) => Math.round(rooms * 3 * (annual ? 0.80 : 1));
const calcPro      = (rooms, annual) => Math.round(Math.ceil(rooms / 15) * 20 * (annual ? 0.80 : 1));

const PLANS = [
  {
    id: 'starter',
    tier: 'ESSENTIEL',
    name: 'Starter',
    price: null,
    unitLabel: '3€/chambre',
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
    unitLabel: '20€ / pack 15ch',
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
  const [activateOpen, setActivateOpen] = useState(false);
  const [activePlan]    = useState('pro');
  const [annual, setAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [rooms, setRooms] = useState(10);

  const changeRooms = (delta) => setRooms(r => Math.max(1, Math.min(500, r + delta)));

  const FAQ = [
    { q: 'Comment fonctionne le Pack à Vie ?', a: 'Vous payez une seule fois et accédez à toutes les fonctionnalités PRO à vie, y compris les mises à jour futures. Le Channel Manager est inclus mais nécessite une configuration initiale avec notre équipe.' },
    { q: 'Qu\'est-ce que le code de vérification ?', a: 'Après achat du Pack à Vie, vous recevez un code unique par email. Ce code valide l\'authenticité de votre licence et déclenche la génération de votre clef de licence nominative.' },
    { q: 'Pourquoi le Channel Manager est-il "non intégré" ?', a: 'Pour les licences à vie, le Channel Manager est inclus dans l\'abonnement mais requiert une configuration manuelle avec Channex.io. Notre équipe vous accompagne dans le processus sous 24 h.' },
    { q: 'Puis-je transférer ma licence ?', a: 'La licence est nominative et liée à votre compte HosFlow. Un transfert est possible sur demande auprès du support, sous réserve de validation d\'identité.' },
  ];

  return (
    <motion.div className="cp-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      {/* ── Header ── */}
      <div className="cp-header">
        <div className="cp-header-text">
          <h1>Abonnement & Licences</h1>
          <p>Gérez votre plan, activez votre licence ou passez au Pack à Vie.</p>
        </div>
        <div className="cp-header-actions">
          <div className="cp-toggle-annual">
            <span className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Mensuel</span>
            <span className={annual  ? 'active' : ''} onClick={() => setAnnual(true)}>Annuel <em>-20%</em></span>
          </div>
          <button className="cp-activate-btn" onClick={() => setActivateOpen(true)}>
            <Ticket size={14}/> Activer une licence
          </button>
        </div>
      </div>

      {/* ── Room counter ── */}
      <div className="cp-room-counter">
        <div className="cp-rc-left">
          <Building2 size={15} color="#FF385C"/>
          <span className="cp-rc-label">Nombre de chambres</span>
          <span className="cp-rc-hint">Le tarif s'adapte automatiquement</span>
        </div>
        <div className="cp-rc-stepper">
          <button className="cp-rc-btn" onClick={() => changeRooms(-5)} disabled={rooms <= 1}>−5</button>
          <button className="cp-rc-btn" onClick={() => changeRooms(-1)} disabled={rooms <= 1}>−</button>
          <input
            type="number"
            className="cp-rc-input"
            min={1} max={500}
            value={rooms}
            onChange={e => setRooms(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
          />
          <button className="cp-rc-btn" onClick={() => changeRooms(1)}>+</button>
          <button className="cp-rc-btn" onClick={() => changeRooms(5)}>+5</button>
        </div>
      </div>

      {/* ── Current plan banner ── */}
      <div className="cp-current-banner">
        <div className="cp-cb-left">
          <Zap size={15} color="#FF385C"/>
          <span>Plan actif :</span>
          <strong>PRO Intelligence</strong>
          <span className="cp-cb-since">depuis le 1 janv. 2026</span>
        </div>
        <div className="cp-cb-right">
          <span className="cp-cb-renew"><Clock size={12}/> Prochain prélèvement : 1 Juin 2026 · <strong>499 MAD</strong></span>
          <button className="cp-cb-btn">Gérer <ChevronRight size={11}/></button>
        </div>
      </div>

      {/* ── Plans grid ── */}
      <div className="cp-plans-grid">
        {PLANS.map(plan => (
          <motion.div
            key={plan.id}
            className={`cp-card ${plan.featured ? 'featured' : ''} ${plan.lifetime ? 'lifetime' : ''} ${activePlan === plan.id ? 'current' : ''}`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {plan.featured && <div className="cp-recommended">Recommandé</div>}
            {plan.lifetime && <div className="cp-lifetime-badge"><Infinity size={11}/> À VIE</div>}
            {activePlan === plan.id && <div className="cp-active-mark"><Check size={10}/>Plan actuel</div>}

            <div className="cp-card-top" style={{ '--plan-color': plan.color }}>
              <div className="cp-plan-tier" style={{ color: plan.color }}>{plan.tier}</div>
              <div className="cp-plan-name">{plan.name}</div>
              {plan.formula ? (
                <>
                  <div className="cp-plan-price">
                    <span className="amount">
                      {plan.formula(rooms, annual)}
                      <span className="currency">€</span>
                    </span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <div className="cp-price-formula">
                    <span>{plan.unitLabel}</span>
                    {plan.id === 'pro' && rooms > 15 && (
                      <span className="cp-packs-detail">{Math.ceil(rooms / 15)} packs × 20€</span>
                    )}
                  </div>
                  {annual && (
                    <div className="cp-annual-save">Économie : {Math.round(plan.formula(rooms, false) * 0.2 * 12)}€/an</div>
                  )}
                </>
              ) : (
                <div className="cp-plan-price">
                  <span className="amount">
                    {plan.price}
                    <span className="currency">€</span>
                  </span>
                  <span className="period">{plan.period}</span>
                </div>
              )}
            </div>

            <ul className="cp-feats-list">
              {plan.features.map((f, i) => <FeatureRow key={i} feature={f} />)}
            </ul>

            <div className="cp-card-action">
              {plan.lifetime ? (
                <button className="cp-btn lifetime-btn" onClick={() => setActivateOpen(true)}>
                  <Key size={14}/> Activer le Pack à Vie
                </button>
              ) : activePlan === plan.id ? (
                <button className="cp-btn current-btn" disabled>
                  <Check size={14}/> Plan actuel
                </button>
              ) : (
                <button className="cp-btn" style={{ '--plan-color': plan.color }}>
                  Choisir ce plan <ChevronRight size={13}/>
                </button>
              )}
            </div>

            {plan.lifetime && (
              <div className="cp-lifetime-note">
                <Shield size={11} color="#D97706"/>
                Paiement unique · Mises à jour à vie · Support VIP
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Channel Manager "non intégré" status ── */}
      <div className="cp-cm-status">
        <div className="cp-cm-icon"><Globe size={18} color="#D97706"/></div>
        <div className="cp-cm-info">
          <div className="cp-cm-title">
            Channel Manager
            <span className="cp-badge-warn">NON INTÉGRÉ</span>
          </div>
          <p>Le Channel Manager est inclus dans votre licence mais n'est pas encore synchronisé. Complétez la configuration pour activer la synchronisation OTA en temps réel.</p>
        </div>
        <div className="cp-cm-steps-inline">
          <div className="cp-step pending"><span>1</span>Créer un compte Channex.io</div>
          <div className="cp-step pending"><span>2</span>Saisir la clé API dans Intégrations</div>
          <div className="cp-step pending"><span>3</span>Mapper vos propriétés OTA</div>
        </div>
        <button className="cp-cm-action" onClick={() => setActivateOpen(true)}>
          Configurer <ExternalLink size={12}/>
        </button>
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

      {/* ── Modal ── */}
      <AnimatePresence>
        {activateOpen && <ActivationModal onClose={() => setActivateOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientPlans;
