import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Usb, CheckCircle2, XCircle, AlertTriangle,
  Loader2, X, Wifi, RefreshCw, Info
} from 'lucide-react';
import {
  isSerialSupported,
  connect,
  disconnect,
  writeCard,
  writeCardDemo,
  isConnected,
} from '../../lib/cardEncoder';
import './CardEncoderModal.css';

/* ── Steps ── */
const STEP = {
  CONNECT : 'connect',   // Plug in encoder
  PLACE   : 'place',     // Place card on encoder
  WRITING : 'writing',   // Encoding in progress
  SUCCESS : 'success',   // Done ✓
  ERROR   : 'error',     // Error ✗
};

/* ════════════════════════════════════════════════════════════
   CardEncoderModal
   Props:
     open       : bool
     onClose    : fn()
     cardData   : { guestName, room, floor, checkIn, checkOut, pin }
     demoMode   : bool (skip real serial — dev/testing)
════════════════════════════════════════════════════════════ */
export default function CardEncoderModal({ open, onClose, cardData = {}, demoMode = false, onEncoded = null }) {
  const [step,       setStep]       = useState(STEP.CONNECT);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [cardUid,    setCardUid]    = useState(null);
  const [connected,  setConnected]  = useState(false);
  const [serialWarn, setSerialWarn] = useState(false);

  /* Reset when modal opens */
  useEffect(() => {
    if (open) {
      setStep(STEP.CONNECT);
      setErrorMsg('');
      setCardUid(null);
      setConnected(false);
      setSerialWarn(!isSerialSupported() && !demoMode);
    } else {
      // Disconnect encoder when modal closes
      if (isConnected()) disconnect().catch(() => {});
    }
  }, [open, demoMode]);

  /* ── Step 1 : Connect encoder ── */
  const handleConnect = useCallback(async () => {
    setErrorMsg('');
    if (demoMode || !isSerialSupported()) {
      setConnected(true);
      setStep(STEP.PLACE);
      return;
    }
    const res = await connect();
    if (res.ok) {
      setConnected(true);
      setStep(STEP.PLACE);
    } else {
      setErrorMsg(res.error);
    }
  }, [demoMode]);

  /* ── Step 2 → 3 : Write card ── */
  const handleWrite = useCallback(async () => {
    setStep(STEP.WRITING);
    setErrorMsg('');
    const fn = (demoMode || !isSerialSupported()) ? writeCardDemo : writeCard;
    const res = await fn(cardData);
    if (res.ok) {
      setCardUid(res.cardUid);
      setStep(STEP.SUCCESS);
    } else {
      setErrorMsg(res.error || 'Échec d\'encodage.');
      setStep(STEP.ERROR);
    }
  }, [cardData, demoMode]);

  /* ── Retry from error ── */
  const handleRetry = useCallback(async () => {
    setStep(STEP.PLACE);
    setErrorMsg('');
  }, []);

  /* ── Close helper ── */
  const handleClose = useCallback(() => {
    if (isConnected()) disconnect().catch(() => {});
    onClose();
  }, [onClose]);

  /* ── Success / Terminer: persist encoded UID then close ── */
  const handleSuccess = useCallback(() => {
    if (isConnected()) disconnect().catch(() => {});
    if (cardUid && onEncoded) onEncoded(cardUid);
    onClose();
  }, [cardUid, onEncoded, onClose]);

  if (!open) return null;

  const guest    = cardData.guestName  || 'Client';
  const room     = cardData.room       || '—';
  const checkIn  = cardData.checkIn    || '—';
  const checkOut = cardData.checkOut   || '—';

  return (
    <div className="cem-overlay" onClick={handleClose}>
      <motion.div
        className="cem-modal"
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.93, y: 24  }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="cem-header">
          <div className="cem-header-icon">
            <CreditCard size={22} />
          </div>
          <div className="cem-header-text">
            <h2>Encodage de carte RFID</h2>
            <p>Périphérique : Encodeur CP210x USB</p>
          </div>
          <button className="cem-close" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* ── Guest info band ── */}
        <div className="cem-guest-band">
          <div className="cem-guest-avatar">{guest.charAt(0).toUpperCase()}</div>
          <div className="cem-guest-info">
            <strong>{guest}</strong>
            <span>Chambre {room} · {checkIn} → {checkOut}</span>
          </div>
          {demoMode && (
            <div className="cem-demo-badge"><Info size={11} /> Mode démo</div>
          )}
        </div>

        {/* ── Step indicator ── */}
        <StepBar step={step} />

        {/* ── Browser warning ── */}
        {serialWarn && (
          <div className="cem-warn-banner">
            <AlertTriangle size={14} />
            <span>
              Ce navigateur ne supporte pas l'API Web Serial.
              Utilisez <strong>Chrome</strong> ou <strong>Edge</strong> pour piloter l'encodeur.
              Le mode démonstration reste disponible.
            </span>
          </div>
        )}

        {/* ── Step content ── */}
        <div className="cem-body">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Connect */}
            {step === STEP.CONNECT && (
              <motion.div key="connect" className="cem-step" {...fade}>
                <div className="cem-illus cem-illus--usb">
                  <UsbIllustration connected={false} />
                </div>
                <h3>Branchez l'encodeur</h3>
                <p>
                  Connectez le câble USB de l'encodeur de cartes à l'ordinateur.
                  Assurez-vous que les pilotes <strong>CP210x</strong> sont installés.
                </p>
                {errorMsg && <ErrorBanner msg={errorMsg} />}
                <div className="cem-actions">
                  <button className="cem-btn-secondary" onClick={handleClose}>Annuler</button>
                  <button className="cem-btn-primary" onClick={handleConnect}>
                    <Usb size={15} />
                    {demoMode || !isSerialSupported() ? 'Continuer (démo)' : 'Sélectionner le port USB'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Place card */}
            {step === STEP.PLACE && (
              <motion.div key="place" className="cem-step" {...fade}>
                <div className="cem-illus cem-illus--card">
                  <CardScanIllustration scanning={false} />
                </div>
                <h3>Posez la carte sur l'encodeur</h3>
                <p>
                  Placez une carte <strong>Mifare</strong> vierge (ou réinitialisée)
                  bien centrée sur le lecteur de l'encodeur,
                  puis cliquez sur <em>Encoder</em>.
                </p>
                {errorMsg && <ErrorBanner msg={errorMsg} />}
                <div className="cem-card-preview">
                  <div className="cem-card-chip" />
                  <div className="cem-card-lines">
                    <span>{room && `Chambre ${room}`}</span>
                    <span>{checkIn} → {checkOut}</span>
                    <span className="cem-card-guest">{guest}</span>
                  </div>
                  <div className="cem-card-nfc"><Wifi size={16} /></div>
                </div>
                <div className="cem-actions">
                  <button className="cem-btn-secondary" onClick={() => setStep(STEP.CONNECT)}>Retour</button>
                  <button className="cem-btn-primary" onClick={handleWrite}>
                    <CreditCard size={15} /> Encoder la carte
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Writing */}
            {step === STEP.WRITING && (
              <motion.div key="writing" className="cem-step" {...fade}>
                <div className="cem-illus cem-illus--writing">
                  <CardScanIllustration scanning={true} />
                </div>
                <h3>Encodage en cours…</h3>
                <p>Ne retirez pas la carte. L'encodeur est en train d'écrire les données du séjour.</p>
                <div className="cem-progress-bar">
                  <div className="cem-progress-fill" />
                </div>
                <div className="cem-writing-rows">
                  <WritingRow label="Client"  value={guest}    />
                  <WritingRow label="Chambre" value={room}     />
                  <WritingRow label="Arrivée" value={checkIn}  />
                  <WritingRow label="Départ"  value={checkOut} />
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Success */}
            {step === STEP.SUCCESS && (
              <motion.div key="success" className="cem-step" {...fade}>
                <div className="cem-illus cem-illus--success">
                  <CheckCircle2 size={64} strokeWidth={1.5} className="cem-success-icon" />
                </div>
                <h3>Carte encodée avec succès !</h3>
                <p>
                  La période de séjour de <strong>{guest}</strong> a été programmée
                  sur la carte. Elle est maintenant opérationnelle.
                </p>
                {cardUid && (
                  <div className="cem-uid-row">
                    <span className="cem-uid-label">UID carte</span>
                    <code className="cem-uid-val">{cardUid}</code>
                  </div>
                )}
                <div className="cem-success-details">
                  <div><span>Chambre</span><strong>{room}</strong></div>
                  <div><span>Arrivée</span><strong>{checkIn}</strong></div>
                  <div><span>Départ</span><strong>{checkOut}</strong></div>
                </div>
                <div className="cem-actions">
                  <button className="cem-btn-secondary" onClick={() => setStep(STEP.PLACE)}>
                    <RefreshCw size={14} /> Encoder une autre carte
                  </button>
                  <button className="cem-btn-primary" onClick={handleSuccess}>
                    <CheckCircle2 size={15} /> Terminer
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 — Error */}
            {step === STEP.ERROR && (
              <motion.div key="error" className="cem-step" {...fade}>
                <div className="cem-illus cem-illus--error">
                  <XCircle size={64} strokeWidth={1.5} className="cem-error-icon" />
                </div>
                <h3>Échec d'encodage</h3>
                {errorMsg && <ErrorBanner msg={errorMsg} />}
                <div className="cem-actions">
                  <button className="cem-btn-secondary" onClick={handleClose}>Annuler</button>
                  <button className="cem-btn-primary" onClick={handleRetry}>
                    <RefreshCw size={14} /> Réessayer
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function StepBar({ step }) {
  const steps = [
    { id: STEP.CONNECT, label: 'Connexion' },
    { id: STEP.PLACE,   label: 'Carte'     },
    { id: STEP.WRITING, label: 'Encodage'  },
    { id: STEP.SUCCESS, label: 'Terminé'   },
  ];
  const visibleSteps = [STEP.CONNECT, STEP.PLACE, STEP.WRITING, STEP.SUCCESS];
  const idx = visibleSteps.indexOf(step === STEP.ERROR ? STEP.WRITING : step);
  return (
    <div className="cem-stepbar">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className={`cem-stepbar-item ${i <= idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}>
            <div className="cem-stepbar-dot">
              {i < idx ? <CheckCircle2 size={12} /> : <span>{i + 1}</span>}
            </div>
            <span>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`cem-stepbar-line ${i < idx ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="cem-error-banner">
      <AlertTriangle size={14} />
      <span>{msg}</span>
    </div>
  );
}

function WritingRow({ label, value }) {
  return (
    <div className="cem-writing-row">
      <span className="cem-wr-label">{label}</span>
      <span className="cem-wr-val">{value}</span>
      <Loader2 size={12} className="cem-wr-spin" />
    </div>
  );
}

function UsbIllustration({ connected }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" className="cem-svg">
      <rect x="10" y="30" width="60" height="20" rx="4" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      <rect x="70" y="36" width="20" height="8" rx="2" fill="#6366F1" />
      <rect x="90" y="34" width="12" height="12" rx="2" fill="#4F46E5" />
      <circle cx="102" cy="40" r="8" fill={connected ? '#10B981' : '#E5E7EB'} />
      <rect x="20" y="38" width="8" height="4" rx="1" fill="#6366F1" />
      <rect x="34" y="38" width="8" height="4" rx="1" fill="#6366F1" />
      <rect x="48" y="38" width="8" height="4" rx="1" fill="#6366F1" />
      <text x="14" y="62" fontSize="7" fill="#6B7280">Encodeur RFID</text>
      <text x="72" y="52" fontSize="6" fill={connected ? '#10B981' : '#9CA3AF'}>
        {connected ? 'OK' : 'USB'}
      </text>
    </svg>
  );
}

function CardScanIllustration({ scanning }) {
  return (
    <svg viewBox="0 0 140 90" fill="none" className="cem-svg">
      {/* Encoder base */}
      <rect x="20" y="45" width="100" height="36" rx="6" fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
      {/* Scan slot */}
      <rect x="45" y="55" width="50" height="16" rx="3" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1" />
      {/* LED */}
      <circle cx="115" cy="55" r="5" fill={scanning ? '#10B981' : '#6366F1'}>
        {scanning && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />}
      </circle>
      {/* Card */}
      <rect
        x="45" y={scanning ? '28' : '8'}
        width="50" height="32" rx="4"
        fill="#4F46E5" stroke="#3730A3" strokeWidth="1"
        style={{ transition: 'y 0.5s ease' }}
      >
        {scanning && <animate attributeName="y" values="8;32;32" dur="0.6s" fill="freeze" />}
      </rect>
      {/* Card chip */}
      <rect x="52" y={scanning ? '37' : '17'} width="10" height="8" rx="2" fill="#FBBF24">
        {scanning && <animate attributeName="y" values="17;41;41" dur="0.6s" fill="freeze" />}
      </rect>
      {/* NFC waves */}
      <path d="M74 16 Q82 16 82 24" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M74 12 Q86 12 86 24" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" fill="none">
        {scanning && <animate attributeName="opacity" values="0;1;0" dur="0.8s" repeatCount="indefinite" />}
      </path>
    </svg>
  );
}

/* Framer Motion fade preset */
const fade = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0  },
  exit:      { opacity: 0, y: -8 },
  transition: { duration: 0.2    },
};
