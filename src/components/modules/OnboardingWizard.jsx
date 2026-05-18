/**
 * OnboardingWizard — Parcours d'inscription multi-étapes HOVA PMS
 * 6 étapes : Compte → Type d'établissement → Unités → Business → Besoin → Activation
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Check, AlertCircle,
  ChevronRight, ChevronLeft, Building2, Home, Hotel,
  Layers, Star, MapPin, Phone, Globe, Briefcase,
  BarChart2, Key, Zap, CheckCircle2, Sparkles, X,
  ArrowRight, RefreshCw
} from 'lucide-react';
import { supabase, SUPABASE_READY } from '../../lib/supabase';
import './OnboardingWizard.css';

/* ─── Constants ───────────────────────────────────────────── */
const TOTAL_STEPS = 6;
const SS_KEY = 'hova_onboarding_draft';

const ESTABLISHMENT_TYPES = [
  { id: 'hotel',       label: 'Hôtel',                 icon: <Hotel size={20}/>,    unitLabel: 'chambres' },
  { id: 'riad',        label: 'Riad / Maison d\'hôtes', icon: <Home size={20}/>,     unitLabel: 'chambres' },
  { id: 'appart',      label: 'Appartement',            icon: <Building2 size={20}/>, unitLabel: 'appartements' },
  { id: 'hotel_appart',label: 'Hôtel-Appart',           icon: <Layers size={20}/>,   unitLabel: 'chambres' },
  { id: 'auberge',     label: 'Auberge',                icon: <Star size={20}/>,     unitLabel: 'chambres' },
  { id: 'residence',   label: 'Résidence touristique',  icon: <MapPin size={20}/>,   unitLabel: 'chambres' },
  { id: 'autre',       label: 'Autre',                  icon: <Briefcase size={20}/>, unitLabel: 'unités' },
];

const UNIT_RANGES = [
  { id: '1-10',  label: '1 – 10'  },
  { id: '11-30', label: '11 – 30' },
  { id: '31-50', label: '31 – 50' },
  { id: '51-100',label: '51 – 100'},
  { id: '100+',  label: '100+'    },
];

const PRIMARY_NEEDS = [
  { id: 'reservations', label: 'Gestion des réservations',        icon: <BarChart2 size={18}/> },
  { id: 'channel',      label: 'Channel Manager OTA',             icon: <Globe size={18}/> },
  { id: 'locks',        label: 'Serrures intelligentes / RFID',   icon: <Key size={18}/> },
  { id: 'billing',      label: 'Facturation & comptabilité',      icon: <Briefcase size={18}/> },
  { id: 'housekeeping', label: 'Housekeeping & maintenance',      icon: <Star size={18}/> },
  { id: 'pms',          label: 'Solution PMS complète',           icon: <Zap size={18}/> },
  { id: 'autre',        label: 'Autre besoin',                    icon: <ChevronRight size={18}/> },
];

const COUNTRIES = [
  'Maroc', 'France', 'Belgique', 'Suisse', 'Algérie', 'Tunisie',
  'Espagne', 'Italie', 'Portugal', 'Sénégal', 'Côte d\'Ivoire',
  'Émirats Arabes Unis', 'Arabie Saoudite', 'Qatar', 'Canada', 'Autre',
];

/* ─── Storage helpers ─────────────────────────────────────── */
const saveDraft = (data) => {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch {}
};
const loadDraft = () => {
  try { return JSON.parse(sessionStorage.getItem(SS_KEY) || 'null'); } catch { return null; }
};
const clearDraft = () => {
  try { sessionStorage.removeItem(SS_KEY); } catch {}
};

/* ─── Step indicator ─────────────────────────────────────── */
const StepIndicator = ({ current, total }) => (
  <div className="ow-step-indicator">
    <div className="ow-progress-bar">
      <motion.div
        className="ow-progress-fill"
        animate={{ width: `${((current) / total) * 100}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
    <span className="ow-step-label">Étape {current} sur {total}</span>
  </div>
);

/* ─── Step 1: Account ────────────────────────────────────── */
const Step1 = ({ data, onChange, errors }) => {
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  return (
    <div className="ow-step-body">
      <div className="ow-step-icon purple"><User size={22}/></div>
      <h2>Créez votre compte</h2>
      <p className="ow-step-sub">Démarrez gratuitement — aucune carte bancaire requise.</p>

      <div className="ow-fields">
        <div className={`ow-field ${errors.name ? 'error' : ''}`}>
          <label><User size={13}/> Nom complet *</label>
          <input placeholder="Mohamed Al Fassi"
            value={data.name} onChange={e => onChange('name', e.target.value)}/>
          {errors.name && <span className="ow-field-err">{errors.name}</span>}
        </div>

        <div className={`ow-field ${errors.email ? 'error' : ''}`}>
          <label><Mail size={13}/> Email professionnel *</label>
          <input type="email" placeholder="contact@monhotel.com"
            value={data.email} onChange={e => onChange('email', e.target.value)}/>
          {errors.email && <span className="ow-field-err">{errors.email}</span>}
        </div>

        <div className="ow-field-row">
          <div className={`ow-field ${errors.password ? 'error' : ''}`}>
            <label><Lock size={13}/> Mot de passe *</label>
            <div className="ow-pw-wrap">
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={data.password} onChange={e => onChange('password', e.target.value)}/>
              <button type="button" className="ow-pw-eye" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {errors.password && <span className="ow-field-err">{errors.password}</span>}
          </div>

          <div className={`ow-field ${errors.confirm ? 'error' : ''}`}>
            <label><Lock size={13}/> Confirmation *</label>
            <div className="ow-pw-wrap">
              <input type={showCpw ? 'text' : 'password'} placeholder="••••••••"
                value={data.confirm} onChange={e => onChange('confirm', e.target.value)}/>
              <button type="button" className="ow-pw-eye" onClick={() => setShowCpw(v => !v)}>
                {showCpw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            {errors.confirm && <span className="ow-field-err">{errors.confirm}</span>}
          </div>
        </div>

        {data.password && (
          <div className="ow-pw-strength">
            {[
              { label: '6+ caractères', ok: data.password.length >= 6 },
              { label: 'Majuscule',     ok: /[A-Z]/.test(data.password) },
              { label: 'Chiffre',       ok: /\d/.test(data.password) },
            ].map(r => (
              <span key={r.label} className={`ow-pw-rule ${r.ok ? 'ok' : ''}`}>
                {r.ok ? <Check size={10}/> : <span className="ow-pw-dot"/>} {r.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Step 2: Establishment type ─────────────────────────── */
const Step2 = ({ data, onChange, errors }) => (
  <div className="ow-step-body">
    <div className="ow-step-icon blue"><Hotel size={22}/></div>
    <h2>Type d'établissement</h2>
    <p className="ow-step-sub">Nous personnalisons HOVA selon votre activité.</p>
    {errors.establishment_type && <div className="ow-alert">{errors.establishment_type}</div>}
    <div className="ow-cards-grid">
      {ESTABLISHMENT_TYPES.map(t => (
        <button
          key={t.id}
          type="button"
          className={`ow-type-card ${data.establishment_type === t.id ? 'selected' : ''}`}
          onClick={() => onChange('establishment_type', t.id)}
        >
          <span className="ow-type-icon">{t.icon}</span>
          <span className="ow-type-label">{t.label}</span>
          {data.establishment_type === t.id && <span className="ow-type-check"><Check size={12}/></span>}
        </button>
      ))}
    </div>
    {data.establishment_type === 'autre' && (
      <div className="ow-field" style={{ marginTop: 12 }}>
        <label>Précisez votre type d'établissement</label>
        <input placeholder="Ex: Glamping, Villa, Lodge…"
          value={data.establishment_custom || ''}
          onChange={e => onChange('establishment_custom', e.target.value)}/>
      </div>
    )}
  </div>
);

/* ─── Step 3: Unit count ─────────────────────────────────── */
const Step3 = ({ data, onChange, errors }) => {
  const et = ESTABLISHMENT_TYPES.find(t => t.id === data.establishment_type);
  const unitLabel = et?.unitLabel || 'unités';

  return (
    <div className="ow-step-body">
      <div className="ow-step-icon green"><Layers size={22}/></div>
      <h2>Nombre de {unitLabel}</h2>
      <p className="ow-step-sub">Cela nous permet d'estimer la configuration optimale.</p>
      {errors.unit_count_range && <div className="ow-alert">{errors.unit_count_range}</div>}
      <div className="ow-range-list">
        {UNIT_RANGES.map(r => (
          <button
            key={r.id}
            type="button"
            className={`ow-range-btn ${data.unit_count_range === r.id ? 'selected' : ''}`}
            onClick={() => onChange('unit_count_range', r.id)}
          >
            <span>{r.label} {unitLabel}</span>
            {data.unit_count_range === r.id && <Check size={14} className="ow-range-check"/>}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Step 4: Business info ──────────────────────────────── */
const Step4 = ({ data, onChange, errors }) => (
  <div className="ow-step-body">
    <div className="ow-step-icon orange"><Briefcase size={22}/></div>
    <h2>Informations de l'établissement</h2>
    <p className="ow-step-sub">Ces données restent strictement confidentielles.</p>

    <div className="ow-fields">
      <div className={`ow-field ${errors.business_name ? 'error' : ''}`}>
        <label><Building2 size={13}/> Nom de l'établissement *</label>
        <input placeholder="Hôtel Les Jardins de Marrakech"
          value={data.business_name || ''}
          onChange={e => onChange('business_name', e.target.value)}/>
        {errors.business_name && <span className="ow-field-err">{errors.business_name}</span>}
      </div>

      <div className="ow-field-row">
        <div className={`ow-field ${errors.phone ? 'error' : ''}`}>
          <label><Phone size={13}/> Téléphone *</label>
          <input placeholder="+212 6XX XXX XXX"
            value={data.phone || ''}
            onChange={e => onChange('phone', e.target.value)}/>
          {errors.phone && <span className="ow-field-err">{errors.phone}</span>}
        </div>
        <div className="ow-field">
          <label><Globe size={13}/> Site web <span className="ow-optional">(optionnel)</span></label>
          <input placeholder="www.monhotel.ma"
            value={data.website || ''}
            onChange={e => onChange('website', e.target.value)}/>
        </div>
      </div>

      <div className={`ow-field ${errors.address ? 'error' : ''}`}>
        <label><MapPin size={13}/> Adresse *</label>
        <input placeholder="123 Rue des Roses, Guéliz"
          value={data.address || ''}
          onChange={e => onChange('address', e.target.value)}/>
        {errors.address && <span className="ow-field-err">{errors.address}</span>}
      </div>

      <div className="ow-field-row">
        <div className={`ow-field ${errors.city ? 'error' : ''}`}>
          <label>Ville *</label>
          <input placeholder="Marrakech"
            value={data.city || ''}
            onChange={e => onChange('city', e.target.value)}/>
          {errors.city && <span className="ow-field-err">{errors.city}</span>}
        </div>
        <div className="ow-field">
          <label>Code postal</label>
          <input placeholder="40000"
            value={data.postal_code || ''}
            onChange={e => onChange('postal_code', e.target.value)}/>
        </div>
      </div>

      <div className={`ow-field ${errors.country ? 'error' : ''}`}>
        <label>Pays *</label>
        <select value={data.country || ''} onChange={e => onChange('country', e.target.value)}>
          <option value="">Sélectionnez un pays…</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.country && <span className="ow-field-err">{errors.country}</span>}
      </div>
    </div>
  </div>
);

/* ─── Step 5: Primary need ───────────────────────────────── */
const Step5 = ({ data, onChange, errors }) => (
  <div className="ow-step-body">
    <div className="ow-step-icon pink"><Zap size={22}/></div>
    <h2>Votre besoin principal</h2>
    <p className="ow-step-sub">Quelle fonctionnalité est la plus critique pour vous ?</p>
    {errors.primary_need && <div className="ow-alert">{errors.primary_need}</div>}
    <div className="ow-need-list">
      {PRIMARY_NEEDS.map(n => (
        <button
          key={n.id}
          type="button"
          className={`ow-need-btn ${data.primary_need === n.id ? 'selected' : ''}`}
          onClick={() => onChange('primary_need', n.id)}
        >
          <span className="ow-need-icon">{n.icon}</span>
          <span className="ow-need-label">{n.label}</span>
          {data.primary_need === n.id && <Check size={14} className="ow-need-check"/>}
        </button>
      ))}
    </div>
  </div>
);

/* ─── Step 6: Trial activation ───────────────────────────── */
const Step6 = ({ userName, submitting, error }) => (
  <div className="ow-step-body ow-step-success">
    {submitting ? (
      <>
        <div className="ow-loading-spinner">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="ow-spinner-ring"
          />
        </div>
        <h2>Création de votre espace…</h2>
        <p className="ow-step-sub">Quelques secondes, on configure tout pour vous.</p>
      </>
    ) : error ? (
      <>
        <div className="ow-step-icon red"><AlertCircle size={22}/></div>
        <h2>Oups — une erreur est survenue</h2>
        <p className="ow-step-sub ow-err-text">{error}</p>
      </>
    ) : (
      <>
        <motion.div
          className="ow-success-badge"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        >
          <CheckCircle2 size={44} color="white"/>
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Bienvenue{userName ? `, ${userName.split(' ')[0]}` : ''} ! 🎉
        </motion.h2>
        <motion.p className="ow-step-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          Votre espace HOVA PMS est prêt.
        </motion.p>
        <motion.div className="ow-trial-banner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Sparkles size={18}/>
          <div>
            <strong>Essai gratuit de 14 jours activé</strong>
            <span>Aucun paiement requis · Accès complet à toutes les fonctionnalités</span>
          </div>
        </motion.div>
        <motion.div className="ow-success-features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          {['PMS Cloud complet', 'Channel Manager', 'Serrures connectées', 'Automatisations'].map(f => (
            <span key={f} className="ow-success-feat"><Check size={11}/> {f}</span>
          ))}
        </motion.div>
      </>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   Main OnboardingWizard component
═══════════════════════════════════════════════════════════ */
const OnboardingWizard = ({ onComplete, onSwitchToLogin, googleMode = false, googleUser = null }) => {
  const draft = loadDraft();

  const [step, setStep] = useState(googleMode ? 2 : 1);
  const [data, setData] = useState(() => ({
    name:                draft?.name                || (googleUser?.user_metadata?.full_name || ''),
    email:               draft?.email               || (googleUser?.email || ''),
    password:            '',
    confirm:             '',
    establishment_type:  draft?.establishment_type  || '',
    establishment_custom:draft?.establishment_custom || '',
    unit_count_range:    draft?.unit_count_range     || '',
    business_name:       draft?.business_name        || '',
    phone:               draft?.phone                || '',
    address:             draft?.address              || '',
    city:                draft?.city                 || '',
    postal_code:         draft?.postal_code          || '',
    country:             draft?.country              || 'Maroc',
    website:             draft?.website              || '',
    primary_need:        draft?.primary_need         || '',
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const onChange = useCallback((field, value) => {
    setData(prev => {
      const next = { ...prev, [field]: value };
      saveDraft(next);
      return next;
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  /* ── Validation per step ── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!data.name.trim()) e.name = 'Nom requis';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Email invalide';
      if (data.password.length < 6) e.password = 'Minimum 6 caractères';
      if (data.password !== data.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    }
    if (s === 2) {
      if (!data.establishment_type) e.establishment_type = 'Veuillez sélectionner un type';
    }
    if (s === 3) {
      if (!data.unit_count_range) e.unit_count_range = 'Veuillez choisir une tranche';
    }
    if (s === 4) {
      if (!data.business_name?.trim()) e.business_name = 'Nom de l\'établissement requis';
      if (!data.phone?.trim()) e.phone = 'Téléphone requis';
      if (!data.address?.trim()) e.address = 'Adresse requise';
      if (!data.city?.trim()) e.city = 'Ville requise';
      if (!data.country) e.country = 'Pays requis';
    }
    if (s === 5) {
      if (!data.primary_need) e.primary_need = 'Veuillez sélectionner un besoin';
    }
    return e;
  };

  const handleNext = () => {
    const e = validate(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setDirection(1);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setDirection(-1);
    setStep(s => s - 1);
  };

  /* ── Final submit ── */
  const handleSubmit = async () => {
    const e = validate(5);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setDirection(1);
    setStep(6);
    setSubmitting(true);
    setSubmitError('');

    try {
      let userId = googleUser?.id || null;

      if (!googleMode) {
        const { data: authData, error: signUpErr } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: { data: { full_name: data.name.trim() } },
        });
        if (signUpErr) throw signUpErr;
        userId = authData?.user?.id;
      }

      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      if (userId && SUPABASE_READY) {
        await supabase.from('profiles').upsert({
          id: userId,
          full_name: data.name.trim() || googleUser?.user_metadata?.full_name || '',
          email: data.email.trim() || googleUser?.email || '',
          role: 'user',
          plan: 'trial',
          trial_ends_at: trialEndsAt,
          establishment_type: data.establishment_type,
          establishment_custom: data.establishment_custom || null,
          unit_count_range: data.unit_count_range,
          business_name: data.business_name?.trim() || null,
          phone: data.phone?.trim() || null,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          postal_code: data.postal_code?.trim() || null,
          country: data.country || null,
          website: data.website?.trim() || null,
          primary_need: data.primary_need,
          avatar_url: googleUser?.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }

      clearDraft();
      setSubmitting(false);
      setDone(true);

      setTimeout(() => { onComplete?.('trial'); }, 2200);
    } catch (err) {
      setSubmitting(false);
      let msg = err.message || 'Une erreur est survenue. Réessayez.';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        msg = 'Cet email est déjà utilisé. Connectez-vous plutôt.';
      }
      setSubmitError(msg);
    }
  };

  /* ── Framer Motion variants ── */
  const variants = {
    enter:  (d) => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
    center: { opacity: 1, x: 0 },
    exit:   (d) => ({ opacity: 0, x: d > 0 ? -48 : 48 }),
  };

  const isLastDataStep = step === 5;
  const isSuccessStep  = step === 6;

  return (
    <div className="ow-root">
      {/* Back to login */}
      {!isSuccessStep && (
        <div className="ow-top-bar">
          {!googleMode && (
            <button className="ow-switch-link" type="button" onClick={onSwitchToLogin}>
              <ChevronLeft size={14}/> Déjà un compte ? Se connecter
            </button>
          )}
        </div>
      )}

      {/* Progress */}
      {!isSuccessStep && <StepIndicator current={step} total={TOTAL_STEPS}/>}

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="ow-step-wrapper"
        >
          {step === 1 && <Step1 data={data} onChange={onChange} errors={errors}/>}
          {step === 2 && <Step2 data={data} onChange={onChange} errors={errors}/>}
          {step === 3 && <Step3 data={data} onChange={onChange} errors={errors}/>}
          {step === 4 && <Step4 data={data} onChange={onChange} errors={errors}/>}
          {step === 5 && <Step5 data={data} onChange={onChange} errors={errors}/>}
          {step === 6 && <Step6 userName={data.name} submitting={submitting} error={submitError}/>}
        </motion.div>
      </AnimatePresence>

      {/* Navigation footer */}
      {!isSuccessStep && (
        <div className="ow-footer">
          <button
            type="button"
            className="ow-btn-back"
            onClick={handleBack}
            disabled={step <= (googleMode ? 2 : 1)}
          >
            <ChevronLeft size={16}/> Retour
          </button>

          {isLastDataStep ? (
            <button type="button" className="ow-btn-next primary" onClick={handleSubmit}>
              <Sparkles size={15}/> Activer mon essai gratuit
            </button>
          ) : (
            <button type="button" className="ow-btn-next" onClick={handleNext}>
              Continuer <ChevronRight size={16}/>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard;
