import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Key, Wifi, Calendar,
  MapPin, User, FileText, PenTool, Shield, Star, Copy, Check,
  Home, Clock, Phone, Mail, AlertCircle, Eye, EyeOff, Sparkles
} from 'lucide-react';
import {
  getCheckinByToken, completeCheckin, isExpired, fmtDateLong
} from '../../lib/checkin';
import './GuestCheckinPage.css';

const STEPS = [
  { id: 'welcome',   label: 'Bienvenue',  icon: Home },
  { id: 'identity',  label: 'Identité',   icon: User },
  { id: 'rules',     label: 'Règles',     icon: FileText },
  { id: 'signature', label: 'Signature',  icon: PenTool },
  { id: 'access',    label: 'Accès',      icon: Key },
];

// ── Signature Canvas ──────────────────────────────────────────────────────
const SignatureCanvas = ({ onSave }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    setIsEmpty(false);
  }, []);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1A1A2E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, []);

  const stopDraw = useCallback(() => {
    drawing.current = false;
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  }, [onSave]);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSave(null);
  };

  return (
    <div className="gc-sig-wrap">
      <canvas
        ref={canvasRef}
        width={340}
        height={160}
        className="gc-sig-canvas"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="gc-sig-footer">
        <span className="gc-sig-hint">Signez avec votre doigt ou la souris</span>
        <button className="gc-sig-clear" onClick={clear}>Effacer</button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const GuestCheckinPage = ({ token }) => {
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState('');

  // Identity form
  const [identity, setIdentity] = useState({
    firstName: '', lastName: '', nationality: 'Marocaine',
    docType: 'cni', docNumber: '', email: '', phone: '',
  });

  // Rules accepted
  const [rulesAccepted, setRulesAccepted] = useState(false);

  // Signature
  const [signature, setSignature] = useState(null);

  // PIN visibility
  const [pinVisible, setPinVisible] = useState(false);

  useEffect(() => {
    const found = getCheckinByToken(token);
    setCheckin(found);
    if (found?.status === 'completed') setCompleted(true);
    setLoading(false);
  }, [token]);

  const goNext = () => {
    setDirection(1);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
  };

  const handleComplete = () => {
    const updated = completeCheckin(token, {
      identity: { ...identity, firstName: identity.firstName, lastName: identity.lastName },
      signature,
    });
    if (updated) {
      setCheckin(updated);
      setCompleted(true);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2500);
    });
  };

  const identityValid = identity.firstName && identity.lastName && identity.docNumber;
  const signatureValid = !!signature;

  const canAdvance = () => {
    if (STEPS[step].id === 'identity') return identityValid;
    if (STEPS[step].id === 'rules') return rulesAccepted;
    if (STEPS[step].id === 'signature') return signatureValid;
    return true;
  };

  if (loading) {
    return (
      <div className="gc-loading">
        <div className="gc-spin-ring" />
        <p>Chargement de votre check-in…</p>
      </div>
    );
  }

  if (!checkin) {
    return (
      <div className="gc-error-page">
        <div className="gc-error-icon"><AlertCircle size={42} /></div>
        <h2>Lien invalide</h2>
        <p>Ce lien de check-in n'existe pas ou a expiré.<br />Contactez votre hôte.</p>
      </div>
    );
  }

  if (isExpired(checkin) && !completed) {
    return (
      <div className="gc-error-page">
        <div className="gc-error-icon expired"><Clock size={42} /></div>
        <h2>Lien expiré</h2>
        <p>Ce lien de check-in a expiré.<br />Contactez votre hôte pour obtenir un nouveau lien.</p>
        {checkin.guestPhone && (
          <a href={`tel:${checkin.guestPhone}`} className="gc-cta-btn">Appeler l'hôte</a>
        )}
      </div>
    );
  }

  // ── Completed screen ───────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="gc-page">
        <div className="gc-completed">
          <motion.div
            className="gc-success-anim"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14 }}
          >
            <CheckCircle2 size={64} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1>Check-in validé !</h1>
            <p>Bienvenue, {checkin.identity?.firstName || checkin.guestName} ! Voici vos informations d'accès.</p>
          </motion.div>

          <motion.div
            className="gc-access-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="gc-pin-reveal">
              <div className="gc-pin-label"><Key size={14} /> Code d'accès</div>
              <div className="gc-pin-val">
                {pinVisible ? checkin.pin : '• • • • • •'}
              </div>
              <div className="gc-pin-actions">
                <button className="gc-pin-toggle" onClick={() => setPinVisible(v => !v)}>
                  {pinVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  {pinVisible ? 'Masquer' : 'Afficher'}
                </button>
                <button className="gc-copy-btn" onClick={() => copyText(checkin.pin, 'pin')}>
                  {copied === 'pin' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'pin' ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            <div className="gc-access-info-list">
              <div className="gc-access-info-row">
                <Home size={15} />
                <strong>{checkin.propertyName}</strong>
              </div>
              {checkin.propertyAddress && (
                <div className="gc-access-info-row">
                  <MapPin size={15} />
                  <span>{checkin.propertyAddress}</span>
                </div>
              )}
              <div className="gc-access-info-row">
                <Calendar size={15} />
                <span>Du {fmtDateLong(checkin.arrivalDate)} au {fmtDateLong(checkin.departureDate)}</span>
              </div>
              {checkin.lockName && (
                <div className="gc-access-info-row">
                  <Key size={15} />
                  <span>Serrure : {checkin.lockName}</span>
                </div>
              )}
            </div>

            {(checkin.wifiName || checkin.wifiPassword) && (
              <div className="gc-wifi-card">
                <div className="gc-wifi-title"><Wifi size={14} /> Wi-Fi</div>
                <div className="gc-wifi-row">
                  <span className="gc-wifi-label">Réseau</span>
                  <span className="gc-wifi-val">{checkin.wifiName || '–'}</span>
                  <button className="gc-copy-sm" onClick={() => copyText(checkin.wifiName, 'wifi-name')}>
                    {copied === 'wifi-name' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
                <div className="gc-wifi-row">
                  <span className="gc-wifi-label">Mot de passe</span>
                  <span className="gc-wifi-val">{checkin.wifiPassword || '–'}</span>
                  <button className="gc-copy-sm" onClick={() => copyText(checkin.wifiPassword, 'wifi-pass')}>
                    {copied === 'wifi-pass' ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          <motion.p
            className="gc-completed-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Conservez cette page dans vos favoris pour retrouver votre code.
          </motion.p>
        </div>
      </div>
    );
  }

  // ── Step-by-step flow ──────────────────────────────────────────────────
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="gc-page">
      {/* Progress */}
      <div className="gc-progress-bar">
        <div className="gc-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Branding */}
      <div className="gc-topbar">
        <div className="gc-logo">H</div>
        <span>Hova · Check-in Digital</span>
      </div>

      {/* Steps */}
      <div className="gc-steps-dots">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`gc-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            {i < step ? <Check size={10} /> : i + 1}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="gc-slide-wrap">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
            className="gc-slide"
          >

            {/* ─ WELCOME ─ */}
            {STEPS[step].id === 'welcome' && (
              <div className="gc-step-content">
                <div className="gc-welcome-emoji">{checkin.propertyEmoji || '🏡'}</div>
                <h1 className="gc-step-title">Bienvenue,<br />{checkin.guestName || 'cher(e) client(e)'} !</h1>
                <p className="gc-step-sub">{checkin.propertyDesc}</p>

                <div className="gc-summary-card">
                  <div className="gc-summary-row">
                    <Home size={16} />
                    <div>
                      <strong>{checkin.propertyName}</strong>
                      {checkin.propertyAddress && <span>{checkin.propertyAddress}</span>}
                    </div>
                  </div>
                  <div className="gc-summary-row">
                    <Calendar size={16} />
                    <div>
                      <strong>Arrivée</strong>
                      <span>{fmtDateLong(checkin.arrivalDate)}</span>
                    </div>
                  </div>
                  <div className="gc-summary-row">
                    <Calendar size={16} />
                    <div>
                      <strong>Départ</strong>
                      <span>{fmtDateLong(checkin.departureDate)}</span>
                    </div>
                  </div>
                  <div className="gc-summary-row">
                    <Key size={16} />
                    <div>
                      <strong>Accès</strong>
                      <span>{checkin.lockName} · Code fourni après validation</span>
                    </div>
                  </div>
                </div>

                <p className="gc-welcome-note">
                  Ce processus prend environ <strong>2 minutes</strong>.<br />
                  Votre code d'accès sera révélé à la fin.
                </p>
              </div>
            )}

            {/* ─ IDENTITY ─ */}
            {STEPS[step].id === 'identity' && (
              <div className="gc-step-content">
                <div className="gc-step-icon indigo"><User size={28} /></div>
                <h1 className="gc-step-title">Votre identité</h1>
                <p className="gc-step-sub">Conformément à la réglementation, vos informations sont requises pour l'enregistrement de votre séjour.</p>

                <div className="gc-form">
                  <div className="gc-form-row">
                    <div className="gc-field">
                      <label>Prénom *</label>
                      <input type="text" placeholder="Marie" value={identity.firstName}
                        onChange={e => setIdentity(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div className="gc-field">
                      <label>Nom *</label>
                      <input type="text" placeholder="Dupont" value={identity.lastName}
                        onChange={e => setIdentity(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="gc-field">
                    <label>Nationalité</label>
                    <input type="text" placeholder="Française" value={identity.nationality}
                      onChange={e => setIdentity(p => ({ ...p, nationality: e.target.value }))} />
                  </div>
                  <div className="gc-form-row">
                    <div className="gc-field">
                      <label>Type de pièce d'identité</label>
                      <select value={identity.docType} onChange={e => setIdentity(p => ({ ...p, docType: e.target.value }))}>
                        <option value="cni">Carte nationale d'identité</option>
                        <option value="passport">Passeport</option>
                        <option value="permis">Permis de conduire</option>
                        <option value="carte_sejour">Carte de séjour</option>
                      </select>
                    </div>
                    <div className="gc-field">
                      <label>Numéro de document *</label>
                      <input type="text" placeholder="AB123456" value={identity.docNumber}
                        onChange={e => setIdentity(p => ({ ...p, docNumber: e.target.value }))} />
                    </div>
                  </div>
                  <div className="gc-form-row">
                    <div className="gc-field">
                      <label>Email</label>
                      <input type="email" placeholder="marie@email.com" value={identity.email}
                        onChange={e => setIdentity(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="gc-field">
                      <label>Téléphone</label>
                      <input type="tel" placeholder="+33 6 00 00 00 00" value={identity.phone}
                        onChange={e => setIdentity(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="gc-gdpr-note">
                  <Shield size={12} />
                  Données chiffrées · Conformité RGPD · Uniquement utilisées pour cet hébergement
                </div>
              </div>
            )}

            {/* ─ RULES ─ */}
            {STEPS[step].id === 'rules' && (
              <div className="gc-step-content">
                <div className="gc-step-icon amber"><FileText size={28} /></div>
                <h1 className="gc-step-title">Règlement intérieur</h1>
                <p className="gc-step-sub">Veuillez lire et accepter le règlement du logement avant votre séjour.</p>

                <div className="gc-rules-box">
                  <pre className="gc-rules-text">{checkin.houseRules}</pre>
                </div>

                <label className="gc-accept-check">
                  <input type="checkbox" checked={rulesAccepted}
                    onChange={e => setRulesAccepted(e.target.checked)} />
                  <div className="gc-check-box">
                    {rulesAccepted && <Check size={14} />}
                  </div>
                  <span>J'ai lu et j'accepte le règlement intérieur ainsi que les conditions d'hébergement.</span>
                </label>
              </div>
            )}

            {/* ─ SIGNATURE ─ */}
            {STEPS[step].id === 'signature' && (
              <div className="gc-step-content">
                <div className="gc-step-icon green"><PenTool size={28} /></div>
                <h1 className="gc-step-title">Signature digitale</h1>
                <p className="gc-step-sub">Signez ci-dessous pour confirmer votre identité et accepter les conditions.</p>

                <SignatureCanvas onSave={setSignature} />

                <p className="gc-sig-legal">
                  En signant, vous certifiez l'exactitude des informations fournies et acceptez les conditions du séjour.
                  Cette signature a valeur légale conformément au règlement eIDAS.
                </p>
              </div>
            )}

            {/* ─ ACCESS (preview before final submit) ─ */}
            {STEPS[step].id === 'access' && (
              <div className="gc-step-content">
                <div className="gc-step-icon purple"><Key size={28} /></div>
                <h1 className="gc-step-title">Presque terminé !</h1>
                <p className="gc-step-sub">Vérifiez vos informations avant de valider votre check-in et accéder à votre code.</p>

                <div className="gc-recap">
                  <div className="gc-recap-row">
                    <User size={14} />
                    <span>{identity.firstName} {identity.lastName}</span>
                    <span className="gc-recap-detail">{identity.nationality}</span>
                  </div>
                  <div className="gc-recap-row">
                    <FileText size={14} />
                    <span>{identity.docType.toUpperCase()}</span>
                    <span className="gc-recap-detail">{identity.docNumber}</span>
                  </div>
                  {signature && (
                    <div className="gc-recap-row">
                      <PenTool size={14} />
                      <span>Signature</span>
                      <img src={signature} alt="sig" className="gc-recap-sig" />
                    </div>
                  )}
                  <div className="gc-recap-row">
                    <Check size={14} />
                    <span>Règlement intérieur accepté</span>
                  </div>
                </div>

                <div className="gc-pin-locked">
                  <div className="gc-pin-locked-icon"><Key size={22} /></div>
                  <div>
                    <strong>Votre code d'accès</strong>
                    <p>Sera révélé après validation</p>
                  </div>
                  <div className="gc-pin-dots">● ● ● ● ● ●</div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="gc-nav">
        {step > 0 && (
          <button className="gc-btn-back" onClick={goPrev}>
            <ChevronLeft size={18} /> Retour
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            className="gc-btn-next"
            onClick={goNext}
            disabled={!canAdvance()}
          >
            Suivant <ChevronRight size={18} />
          </button>
        ) : (
          <button
            className="gc-btn-validate"
            onClick={handleComplete}
            disabled={!identityValid || !signatureValid || !rulesAccepted}
          >
            <Sparkles size={16} /> Valider mon check-in
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestCheckinPage;
