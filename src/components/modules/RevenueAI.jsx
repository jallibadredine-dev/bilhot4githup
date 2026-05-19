import React, { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Building2, BarChart3, PieChart, RefreshCw, Sparkles,
  Download, ChevronUp, ChevronDown, Info, DollarSign,
  Home, Percent, Activity, Globe, Target, Zap, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import './RevenueAI.css';

/* ── Data ───────────────────────────────────────────────── */
const PROPERTIES = [
  {
    id: 1, name: 'Villa Océan — Suite Prestige', type: 'Suite', units: 1,
    rev: { mtd: 18400, qtd: 52800, ytd: 198400, l12: 221000 },
    occ: { mtd: 94, qtd: 88, ytd: 82, l12: 80 },
    adr: { mtd: 650, qtd: 620, ytd: 590, l12: 570 },
    revpar: { mtd: 611, qtd: 546, ytd: 484, l12: 456 },
    commission: 15.2,
    expenses: 3200,
    trend: [14200, 15800, 16400, 17200, 18400, 18400],
    status: 'up', ota: 'Airbnb',
  },
  {
    id: 2, name: 'Riad Médina — Chambre Patio', type: 'Chambre', units: 3,
    rev: { mtd: 12600, qtd: 34200, ytd: 128000, l12: 142000 },
    occ: { mtd: 87, qtd: 81, ytd: 74, l12: 72 },
    adr: { mtd: 320, qtd: 305, ytd: 290, l12: 280 },
    revpar: { mtd: 278, qtd: 247, ytd: 215, l12: 202 },
    commission: 18.5,
    expenses: 2100,
    trend: [9800, 11200, 11800, 12000, 12600, 12600],
    status: 'up', ota: 'Booking.com',
  },
  {
    id: 3, name: 'Appartement Gueliz T2', type: 'Appartement', units: 2,
    rev: { mtd: 7800, qtd: 20400, ytd: 76000, l12: 88000 },
    occ: { mtd: 71, qtd: 68, ytd: 61, l12: 65 },
    adr: { mtd: 185, qtd: 178, ytd: 169, l12: 172 },
    revpar: { mtd: 131, qtd: 121, ytd: 103, l12: 112 },
    commission: 13.0,
    expenses: 1400,
    trend: [8200, 7600, 7200, 7400, 7800, 7800],
    status: 'down', ota: 'Airbnb',
  },
  {
    id: 4, name: 'Dar El Bacha — Chambre Artisanale', type: 'Chambre', units: 4,
    rev: { mtd: 9200, qtd: 26600, ytd: 98000, l12: 110000 },
    occ: { mtd: 79, qtd: 75, ytd: 69, l12: 71 },
    adr: { mtd: 215, qtd: 208, ytd: 196, l12: 200 },
    revpar: { mtd: 170, qtd: 156, ytd: 135, l12: 142 },
    commission: 16.8,
    expenses: 1800,
    trend: [8600, 8800, 9000, 9200, 9200, 9200],
    status: 'stable', ota: 'Booking.com',
  },
];

const OTA_MIX = [
  { name: 'Booking.com', pct: 42, rev: 20160, color: '#003580' },
  { name: 'Airbnb',      pct: 35, rev: 16800, color: '#2563EB' },
  { name: 'Direct',      pct: 13, rev: 6240,  color: '#10B981' },
  { name: 'Expedia',     pct:  7, rev: 3360,  color: '#FFB400' },
  { name: 'Autres',      pct:  3, rev: 1440,  color: '#94A3B8' },
];

const MONTHS = ['Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai'];
const MONTHLY_TOTAL = [34200, 38600, 36800, 42400, 44200, 48000];

const AI_TIPS = [
  { icon: Zap,          color: '#2563EB', bg: '#FFF1F3', title: 'Hausse tarifaire suggérée',        body: 'Les 3 prochains week-ends affichent une demande +34% vs N-1. Recommandation : +€45/nuit sur la Suite Prestige.' },
  { icon: Target,       color: '#6366F1', bg: '#F5F3FF', title: 'Réduire dépendance Booking.com',   body: 'Les commissions OTA vous coûtent 8 420 MAD ce mois. Pousser les offres directes permettrait d\'économiser ≈ €1 200.' },
  { icon: AlertTriangle,color: '#F59E0B', bg: '#FFFBEB', title: 'Taux faible — Appartement Gueliz', body: 'Occupation en baisse de -6 pts vs trimestre précédent. Vérifiez la parité tarifaire et les photos de l\'annonce.' },
];

const PERIODS = [
  { id: 'mtd', label: 'Ce mois (MTD)' },
  { id: 'qtd', label: 'Ce trimestre (QTD)' },
  { id: 'ytd', label: 'Cette année (YTD)' },
  { id: 'l12', label: '12 derniers mois' },
];

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n);
const fmtK = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;

/* ── Component ──────────────────────────────────────────── */
const RevenueAI = () => {
  const [period,    setPeriod]    = useState('mtd');
  const [sortCol,   setSortCol]   = useState('rev');
  const [sortDir,   setSortDir]   = useState('desc');
  const [syncing,   setSyncing]   = useState(false);
  const [expanded,  setExpanded]  = useState(null);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const sorted = useMemo(() => {
    return [...PROPERTIES].sort((a, b) => {
      let va = sortCol === 'rev' ? a.rev[period] : sortCol === 'occ' ? a.occ[period] : sortCol === 'adr' ? a.adr[period] : sortCol === 'revpar' ? a.revpar[period] : sortCol === 'net' ? (a.rev[period] - a.expenses) : a.rev[period];
      let vb = sortCol === 'rev' ? b.rev[period] : sortCol === 'occ' ? b.occ[period] : sortCol === 'adr' ? b.adr[period] : sortCol === 'revpar' ? b.revpar[period] : sortCol === 'net' ? (b.rev[period] - b.expenses) : b.rev[period];
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [period, sortCol, sortDir]);

  const totals = useMemo(() => ({
    rev:     PROPERTIES.reduce((s, p) => s + p.rev[period], 0),
    net:     PROPERTIES.reduce((s, p) => s + p.rev[period] - p.expenses, 0),
    occ:     Math.round(PROPERTIES.reduce((s, p) => s + p.occ[period], 0) / PROPERTIES.length),
    adr:     Math.round(PROPERTIES.reduce((s, p) => s + p.adr[period], 0) / PROPERTIES.length),
    revpar:  Math.round(PROPERTIES.reduce((s, p) => s + p.revpar[period], 0) / PROPERTIES.length),
    commission: PROPERTIES.reduce((s, p) => s + p.rev[period] * p.commission / 100, 0),
  }), [period]);

  const yieldPct = ((totals.net / totals.rev) * 100).toFixed(1);
  const maxBar = Math.max(...MONTHLY_TOTAL);

  const sortToggle = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortCol === col
    ? (sortDir === 'desc' ? <ChevronDown size={11}/> : <ChevronUp size={11}/>)
    : null;

  return (
    <div className="rai2-root">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <div className="rai2-hero">
        <div className="rai2-hero-top">
          <div className="rai2-hero-title">
            <div className="rai2-hero-icon"><BarChart3 size={18}/></div>
            <div>
              <h1>Portefeuille Locatif</h1>
              <p>{PROPERTIES.length} propriétés · {PROPERTIES.reduce((s, p) => s + p.units, 0)} unités locatives</p>
            </div>
          </div>
          <div className="rai2-hero-actions">
            <div className="rai2-period-tabs">
              {PERIODS.map(p => (
                <button key={p.id} className={`rai2-period-tab ${period === p.id ? 'active' : ''}`} onClick={() => setPeriod(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            <button className={`rai2-sync-btn ${syncing ? 'syncing' : ''}`} onClick={handleSync}>
              <RefreshCw size={13}/> {syncing ? 'Sync…' : 'Synchroniser'}
            </button>
          </div>
        </div>

        <div className="rai2-kpi-strip">
          <div className="rai2-kpi">
            <div className="rai2-kpi-label">Revenu Brut</div>
            <div className="rai2-kpi-value">{fmt(totals.rev)}</div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> +8.4%</div>
          </div>
          <div className="rai2-kpi-divider"/>
          <div className="rai2-kpi">
            <div className="rai2-kpi-label">Revenu Net</div>
            <div className="rai2-kpi-value">{fmt(totals.net)}</div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> +6.1%</div>
          </div>
          <div className="rai2-kpi-divider"/>
          <div className="rai2-kpi">
            <div className="rai2-kpi-label">Taux Occupation Moy.</div>
            <div className="rai2-kpi-value">{totals.occ}<span>%</span></div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> +3.2 pts</div>
          </div>
          <div className="rai2-kpi-divider"/>
          <div className="rai2-kpi">
            <div className="rai2-kpi-label">ADR Moyen</div>
            <div className="rai2-kpi-value">{totals.adr} <span>MAD</span></div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> +4.8%</div>
          </div>
          <div className="rai2-kpi-divider"/>
          <div className="rai2-kpi">
            <div className="rai2-kpi-label">RevPAR Moyen</div>
            <div className="rai2-kpi-value">{totals.revpar} <span>MAD</span></div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> +7.2%</div>
          </div>
          <div className="rai2-kpi-divider"/>
          <div className="rai2-kpi accent">
            <div className="rai2-kpi-label">Rendement Net</div>
            <div className="rai2-kpi-value">{yieldPct}<span>%</span></div>
            <div className="rai2-kpi-trend up"><ArrowUpRight size={12}/> Commissions: {fmt(totals.commission)}</div>
          </div>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════ */}
      <div className="rai2-body">

        {/* ── Portfolio Table ─────────────────────────────── */}
        <section className="rai2-card">
          <div className="rai2-card-header">
            <div className="rai2-card-title"><Building2 size={15}/> Portefeuille Propriétés</div>
            <button className="rai2-card-action"><Download size={13}/> Exporter CSV</button>
          </div>
          <div className="rai2-table-wrap">
            <table className="rai2-table">
              <thead>
                <tr>
                  <th className="left">Propriété</th>
                  <th className="clickable" onClick={() => sortToggle('rev')}>Revenu Brut <SortIcon col="rev"/></th>
                  <th className="clickable" onClick={() => sortToggle('net')}>Revenu Net <SortIcon col="net"/></th>
                  <th className="clickable" onClick={() => sortToggle('occ')}>Occupation <SortIcon col="occ"/></th>
                  <th className="clickable" onClick={() => sortToggle('adr')}>ADR <SortIcon col="adr"/></th>
                  <th className="clickable" onClick={() => sortToggle('revpar')}>RevPAR <SortIcon col="revpar"/></th>
                  <th>Commission</th>
                  <th>Tendance</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => {
                  const net = p.rev[period] - p.expenses;
                  const commAmt = p.rev[period] * p.commission / 100;
                  const maxT = Math.max(...p.trend);
                  return (
                    <tr key={p.id} className={expanded === p.id ? 'expanded' : ''} onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                      <td className="left">
                        <div className="rai2-prop-cell">
                          <div className="rai2-prop-avatar">{p.name[0]}</div>
                          <div>
                            <div className="rai2-prop-name">{p.name}</div>
                            <div className="rai2-prop-meta">{p.type} · {p.units} unité{p.units > 1 ? 's' : ''} · {p.ota}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="rai2-val-main">{fmt(p.rev[period])}</span></td>
                      <td><span className="rai2-val-main green">{fmt(net)}</span></td>
                      <td>
                        <div className="rai2-occ-cell">
                          <div className="rai2-occ-bar"><div className="rai2-occ-fill" style={{ width: `${p.occ[period]}%`, background: p.occ[period] >= 85 ? '#10B981' : p.occ[period] >= 70 ? '#F59E0B' : '#EF4444' }}/></div>
                          <span>{p.occ[period]}%</span>
                        </div>
                      </td>
                      <td><span className="rai2-val">{p.adr[period]} MAD</span></td>
                      <td><span className="rai2-val">{p.revpar[period]} MAD</span></td>
                      <td>
                        <div className="rai2-comm-cell">
                          <span className="rai2-comm-pct">{p.commission}%</span>
                          <span className="rai2-comm-amt">{fmt(commAmt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rai2-sparkline">
                          {p.trend.map((v, i) => (
                            <div key={i} className="rai2-spark-bar" style={{ height: `${Math.round((v / maxT) * 28)}px`, background: i === p.trend.length - 1 ? '#2563EB' : '#E2E8F0' }}/>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`rai2-status-badge ${p.status}`}>
                          {p.status === 'up' ? '↑ Hausse' : p.status === 'down' ? '↓ Baisse' : '→ Stable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="rai2-total-row">
                  <td className="left"><strong>Total Portefeuille</strong></td>
                  <td><strong>{fmt(totals.rev)}</strong></td>
                  <td><strong className="green">{fmt(totals.net)}</strong></td>
                  <td><strong>{totals.occ}%</strong></td>
                  <td><strong>{totals.adr} MAD</strong></td>
                  <td><strong>{totals.revpar} MAD</strong></td>
                  <td><strong>{fmt(totals.commission)}</strong></td>
                  <td colSpan={2}><span className="rai2-yield-badge">Rendement {yieldPct}%</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ── Analytics Row ───────────────────────────────── */}
        <div className="rai2-analytics-row">

          {/* Monthly Trend */}
          <section className="rai2-card flex-2">
            <div className="rai2-card-header">
              <div className="rai2-card-title"><Activity size={15}/> Tendance mensuelle</div>
              <span className="rai2-card-badge">6 derniers mois</span>
            </div>
            <div className="rai2-bar-chart">
              {MONTHLY_TOTAL.map((v, i) => (
                <div key={i} className="rai2-bar-col">
                  <div className="rai2-bar-label-top">{fmtK(v)}</div>
                  <div className="rai2-bar-track">
                    <motion.div
                      className={`rai2-bar-fill ${i === MONTHLY_TOTAL.length - 1 ? 'current' : ''}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.round((v / maxBar) * 100)}%` }}
                      transition={{ delay: i * 0.06, duration: 0.5 }}
                    />
                  </div>
                  <div className="rai2-bar-month">{MONTHS[i]}</div>
                </div>
              ))}
            </div>
          </section>

          {/* OTA Distribution */}
          <section className="rai2-card">
            <div className="rai2-card-header">
              <div className="rai2-card-title"><Globe size={15}/> Distribution OTA</div>
            </div>
            <div className="rai2-ota-list">
              {OTA_MIX.map((o, i) => (
                <div key={i} className="rai2-ota-row">
                  <div className="rai2-ota-dot" style={{ background: o.color }}/>
                  <span className="rai2-ota-name">{o.name}</span>
                  <div className="rai2-ota-track">
                    <motion.div className="rai2-ota-fill" style={{ background: o.color }} initial={{ width: 0 }} animate={{ width: `${o.pct}%` }} transition={{ delay: i * 0.08, duration: 0.5 }}/>
                  </div>
                  <span className="rai2-ota-pct">{o.pct}%</span>
                  <span className="rai2-ota-rev">{fmt(o.rev)}</span>
                </div>
              ))}
            </div>
            <div className="rai2-ota-tip">
              <Info size={11}/> Pousser les réservations directes économise en moyenne <strong>15–18%</strong> de commissions.
            </div>
          </section>

        </div>

        {/* ── AI Optimizer ────────────────────────────────── */}
        <section className="rai2-card">
          <div className="rai2-card-header">
            <div className="rai2-card-title"><Sparkles size={15}/> Optimisations IA suggérées</div>
            <span className="rai2-badge-ai">AI-Driven</span>
          </div>
          <div className="rai2-ai-tips">
            {AI_TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div key={i} className="rai2-ai-tip">
                  <div className="rai2-ai-tip-icon" style={{ background: tip.bg, color: tip.color }}><Icon size={15}/></div>
                  <div className="rai2-ai-tip-body">
                    <div className="rai2-ai-tip-title">{tip.title}</div>
                    <div className="rai2-ai-tip-text">{tip.body}</div>
                  </div>
                  <button className="rai2-ai-tip-btn" style={{ color: tip.color, background: tip.bg, border: `1px solid ${tip.color}30` }}>Appliquer</button>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default RevenueAI;
