import React, { useState } from 'react';
import { Check, Minus, Plus, Zap, Globe, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PricingSimulator.css';

/* ── Tarification (MAD — Dirhams marocains) ──────────── */
const PLANS = [
  {
    id: 'starter',
    name: 'PMS Standard',
    subtitle: 'Gestion interne & réception',
    badge: null,
    unitLabel: '25 MAD/ch',
    formula: (rooms) => rooms * 25,
    color: '#3B82F6',
    features: ['PMS Cloud', 'Calendrier', 'Facturation', 'Support email'],
  },
  {
    id: 'pro',
    name: 'PMS Intégral',
    subtitle: 'Channel Manager + IA inclus',
    badge: 'Populaire',
    unitLabel: '30 MAD/ch',
    formula: (rooms) => rooms * 30,
    color: '#FF385C',
    features: ['Tout Standard', 'Channel Manager', 'Revenue AI', 'Serrures IoT'],
    integrations: true,
  },
];

const ENGAGEMENTS = [
  { id: 'monthly',   label: '1 Mois',   months: 1,  discount: 0,    discLabel: null },
  { id: 'yearly',    label: '1 An',     months: 12, discount: 0.05, discLabel: '-5%' },
  { id: 'biennial',  label: '2 Ans',    months: 24, discount: 0.10, discLabel: '-10%' },
  { id: 'triennial', label: '3 Ans',    months: 36, discount: 0.20, discLabel: '-20%' },
];

const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const PricingSimulator = ({ onStart }) => {
  const [planId, setPlanId] = useState('pro');
  const [rooms, setRooms] = useState(10);
  const [engId, setEngId] = useState('monthly');

  const plan = PLANS.find(p => p.id === planId);
  const eng  = ENGAGEMENTS.find(e => e.id === engId);

  const baseMonthly    = plan.formula(rooms);
  const discountedMonthly = baseMonthly * (1 - eng.discount);
  const total          = discountedMonthly * eng.months;
  const savings        = (baseMonthly * eng.months) - total;

  const changeRooms = (delta) => setRooms(r => Math.max(1, Math.min(500, r + delta)));

  return (
    <div className="ps-wrap">
      {/* ── Left: description ── */}
      <div className="ps-left">
        <div className="ps-eyebrow">Simulateur de tarif</div>
        <h2 className="ps-title">Un prix juste,<br />calculé pour vous</h2>
        <p className="ps-desc">
          Payez exactement selon le nombre de chambres que vous gérez.
          Pas de surprise, pas de frais cachés.
        </p>
        <ul className="ps-perks">
          {[
            '14 jours d\'essai gratuit',
            'Facturation mensuelle ou annuelle',
            'Sans engagement — résiliable à tout moment',
            'Migration et onboarding offerts',
          ].map(t => (
            <li key={t}><Check size={14} />{t}</li>
          ))}
        </ul>
        <div className="ps-formula-note">
          <Info size={13}/>
          <span>
            <strong>PMS Standard :</strong> 25 MAD × nombre de chambres<br/>
            <strong>PMS Intégral :</strong> 30 MAD × nombre de chambres (Channel Manager inclus)
          </span>
        </div>
      </div>

      {/* ── Right: simulator card ── */}
      <motion.div
        className="ps-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Plan selector */}
        <div className="ps-section">
          <div className="ps-section-label">NIVEAU DE SERVICE</div>
          <div className="ps-plan-grid">
            {PLANS.map(p => (
              <button
                key={p.id}
                className={`ps-plan-btn ${planId === p.id ? 'active' : ''}`}
                style={{ '--plan-color': p.color }}
                onClick={() => setPlanId(p.id)}
              >
                {p.badge && <span className="ps-plan-badge">{p.badge}</span>}
                <div className="ps-plan-name">{p.name}</div>
                <div className="ps-plan-sub">{p.subtitle}</div>
                {p.integrations && (
                  <div className="ps-plan-icons">
                    <span className="ps-ota-dot" style={{ background:'#FF5A5F' }}>A</span>
                    <span className="ps-ota-dot" style={{ background:'#003580' }}>B</span>
                    <span className="ps-ota-dot" style={{ background:'#00A650' }}>V</span>
                    <span className="ps-ota-dot ps-plus">+</span>
                  </div>
                )}
                <div className="ps-plan-price">{p.unitLabel}</div>
                {planId === p.id && <div className="ps-plan-check"><Check size={11}/></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Room counter */}
        <div className="ps-section">
          <div className="ps-section-label">NOMBRE DE CHAMBRES</div>
          <div className="ps-stepper">
            <button className="ps-step-btn" onClick={() => changeRooms(-1)} disabled={rooms <= 1}>
              <Minus size={16}/>
            </button>
            <div className="ps-step-display">
              <input
                type="number"
                min={1} max={500}
                value={rooms}
                onChange={e => setRooms(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                className="ps-step-input"
              />
            </div>
            <button className="ps-step-btn" onClick={() => changeRooms(1)} disabled={rooms >= 500}>
              <Plus size={16}/>
            </button>
          </div>
          {planId === 'pro' && (
            <div className="ps-pack-info">
              <Zap size={11}/>
              {Math.ceil(rooms / 15)} pack{Math.ceil(rooms / 15) > 1 ? 's' : ''} de 15 chambres
              {rooms % 15 !== 0 && <span className="ps-pack-unused"> · {15 - (rooms % 15)} ch. bonus incluses</span>}
            </div>
          )}
        </div>

        {/* Engagement */}
        <div className="ps-section">
          <div className="ps-section-label">ENGAGEMENT</div>
          <div className="ps-eng-grid">
            {ENGAGEMENTS.map(e => (
              <button
                key={e.id}
                className={`ps-eng-btn ${engId === e.id ? 'active' : ''}`}
                onClick={() => setEngId(e.id)}
              >
                <span className="ps-eng-label">{e.label}</span>
                {e.discLabel && <span className="ps-eng-disc">{e.discLabel}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Result panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${planId}-${rooms}-${engId}`}
            className="ps-result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="ps-result-top">
              <span className="ps-result-label">Coût mensuel estimé</span>
              <span className="ps-result-monthly">{fmt(discountedMonthly)} MAD/m</span>
            </div>
            <div className="ps-result-total-row">
              <span>
                Total {eng.months === 1 ? 'pour 1 mois' : `sur ${eng.months / 12 === 1 ? '1 an' : `${eng.months / 12} ans`}`}
              </span>
              <span className="ps-result-total">{fmt(total)} MAD</span>
            </div>
            {savings > 0 && (
              <div className="ps-result-savings">
                <Check size={11}/> Économie de {fmt(savings)} MAD vs mensuel
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <button className="ps-cta-btn" onClick={onStart}>
          Démarrer mon essai gratuit
          <ChevronRight size={16}/>
        </button>
        <div className="ps-cta-sub">14 jours gratuits · Sans carte bancaire</div>
      </motion.div>
    </div>
  );
};

export default PricingSimulator;
