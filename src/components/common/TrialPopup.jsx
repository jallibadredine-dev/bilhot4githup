import React, { useEffect, useState } from 'react';
import './TrialPopup.css';

const msPerDay = 1000 * 60 * 60 * 24;

function formatDateDDMMYYYY(v) {
  try {
    const d = new Date(v);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch { return '' }
}

const TrialPopup = ({ trialInfo, onOpenBilling }) => {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('hova_trial_popup_dismissed') ? false : true;
    } catch { return true }
  });

  const [daysLeft, setDaysLeft] = useState(trialInfo?.daysLeft ?? 0);

  useEffect(() => {
    if (!trialInfo || trialInfo.expired) return;
    function compute() {
      const ends = new Date(trialInfo.endsAt).getTime();
      const now = Date.now();
      const d = Math.ceil((ends - now) / msPerDay);
      setDaysLeft(Math.max(0, d));
      if (d <= 0) {
        // auto-hide when expired
        setVisible(false);
      }
    }
    compute();
    const id = setInterval(compute, 60 * 1000); // update every minute
    return () => clearInterval(id);
  }, [trialInfo]);

  if (!trialInfo || trialInfo.expired || !visible) return null;

  const handleClose = () => {
    try { sessionStorage.setItem('hova_trial_popup_dismissed', '1'); } catch {}
    setVisible(false);
  };

  return (
    <div className="trial-popup" role="status" aria-live="polite">
      <div className="trial-popup-left">
        <div className="trial-popup-title">Essai gratuit</div>
        <div className="trial-popup-body">Il reste <strong>{daysLeft}</strong> jour{daysLeft > 1 ? 's' : ''} — se termine le {formatDateDDMMYYYY(trialInfo.endsAt)}</div>
      </div>
      <div className="trial-popup-actions">
        <button className="trial-popup-btn" onClick={() => onOpenBilling ? onOpenBilling() : null}>S'abonner</button>
        <button className="trial-popup-close" onClick={handleClose} aria-label="Fermer">✕</button>
      </div>
    </div>
  );
};

export default TrialPopup;
