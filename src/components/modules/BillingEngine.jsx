import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, RefreshCcw, Search, MoreVertical,
  CreditCard, Building2, Receipt, ArrowUpRight, Send, Printer,
  FileCheck, Building, UploadCloud, Info, TrendingUp, AlertCircle,
  Clock, PieChart, User, CheckCircle2, Share2, ExternalLink, Plus,
  Landmark, Globe, Phone, Mail, MapPin, ChevronRight, Layers,
  Calendar, Hash, Banknote, ShieldCheck, Zap, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReservations, SOURCE_CFG } from '../../lib/reservationStore';
import './BillingEngine.css';

/* ─── COMPANY IDENTITY ─────────────────────────────────────── */
const COMPANY = {
  name:    'Hova Hospitality Group',
  tagline: 'Property Management System',
  address: '14 Rue de Rivoli, 75001 Paris, France',
  siret:   '521 234 567 00018',
  vat:     'FR52 521 234 567',
  phone:   '+33 1 23 45 67 89',
  email:   'facturation@hova-pms.com',
  web:     'www.hova-pms.com',
  iban:    'FR76 3000 6000 0112 3456 7890 189',
  bic:     'BNPAFRPP',
};

/* ─── TAX RATES ────────────────────────────────────────────── */
const TAX = {
  hebergement: 0.10,
  services:    0.20,
  city:        4,          // per night flat
};

/* ─── HELPERS ──────────────────────────────────────────────── */
const nights = (ci, co) => {
  const a = new Date(ci), b = new Date(co);
  return Math.max(1, Math.round((b - a) / 86400000));
};

const parseName = (raw = '') => {
  if (!raw.includes(',')) return raw.trim();
  const [last, first] = raw.split(',');
  return `${first.trim()} ${last.trim()}`;
};

const deriveInvoicesFromReservations = (resas) => {
  return resas.map((r, idx) => {
    const n       = nights(r.checkIn, r.checkOut);
    const base    = r.price || 150 * n;
    const taxHeb  = +(base * TAX.hebergement).toFixed(2);
    const taxSvc  = +(base * 0.05 * TAX.services).toFixed(2);
    const cityTax = +(n * TAX.city).toFixed(2);
    const total   = +(base + taxHeb + taxSvc + cityTax).toFixed(2);
    const today   = new Date('2026-05-18');
    const co      = new Date(r.checkOut);
    let status    = 'Draft';
    if (co < today) status = r.source === 'direct' ? 'Paid' : idx % 4 === 3 ? 'Overdue' : 'Paid';
    else             status = idx % 3 === 0 ? 'Proforma' : 'Draft';

    return {
      id:      `INV-${r.checkOut.slice(0,4)}-${String(r.id || idx + 1).padStart(3,'0')}`,
      resaId:  r.id,
      guest:   parseName(r.guest),
      email:   r.email || `${parseName(r.guest).toLowerCase().replace(' ','.')}@guest.com`,
      room:    r.room || r.property || 'N/A',
      nights:  n,
      checkIn: r.checkIn,
      checkOut:r.checkOut,
      source:  r.source,
      baseAmt: base,
      taxHeb,
      taxSvc,
      cityTax,
      amount:  total,
      status,
      date:    r.checkOut,
      type:    r.corporate ? 'Corporate' : 'Individual',
      items:   [
        { cat: 'Hébergement', desc: `Séjour ${n} nuit${n>1?'s':''} — ${r.room || r.property || 'Chambre'}`, amount: base, tax: TAX.hebergement },
        { cat: 'Taxe Séjour', desc: `City Tax (€4/nuit × ${n})`, amount: cityTax, tax: 0 },
        { cat: 'TVA Hébergement', desc: 'TVA 10% sur hébergement', amount: taxHeb, tax: 0 },
        ...(taxSvc > 0 ? [{ cat: 'TVA Services', desc: 'TVA 20% sur extras', amount: taxSvc, tax: 0 }] : []),
      ],
    };
  });
};

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85, MAD: 10.85 };
const currencySymbol = { EUR: '€', USD: '$', GBP: '£', MAD: 'DH' };

const BillingEngine = ({ pmsMode }) => {
  const [activeTab,    setActiveTab]    = useState('invoices');
  const [selectedInv,  setSelectedInv]  = useState(null);
  const [currency,     setCurrency]     = useState('EUR');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQ,      setSearchQ]      = useState('');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [rawResas,     setRawResas]     = useState([]);
  const [spinning,     setSpinning]     = useState(false);

  const [newForm, setNewForm] = useState({
    guest: '', room: '', type: 'Individual',
    date: new Date().toISOString().split('T')[0],
    items: [{ desc: '', amount: 0, cat: 'Hébergement' }],
  });

  /* load from store */
  const loadResas = () => {
    setSpinning(true);
    const r = getReservations();
    setRawResas(r);
    setTimeout(() => setSpinning(false), 600);
  };
  useEffect(() => { loadResas(); }, []);
  useEffect(() => {
    const handler = () => setRawResas(getReservations());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const allInvoices   = useMemo(() => deriveInvoicesFromReservations(rawResas), [rawResas]);
  const [manualInvs,  setManualInvs]  = useState([]);
  const invoicesList  = useMemo(() => [...manualInvs, ...allInvoices], [manualInvs, allInvoices]);

  const filtered = invoicesList.filter(inv => {
    const matchStatus = filterStatus === 'All' || inv.status === filterStatus;
    const matchQ      = !searchQ || inv.guest.toLowerCase().includes(searchQ.toLowerCase()) || inv.id.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchQ;
  });

  const fmt = (amt) => {
    const v = ((amt || 0) * exchangeRates[currency]);
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(v);
  };

  /* KPI aggregates */
  const kpi = useMemo(() => {
    const total   = invoicesList.reduce((s, i) => s + i.amount, 0);
    const ar      = invoicesList.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0);
    const overdue = invoicesList.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0);
    const vat     = invoicesList.reduce((s, i) => s + (i.taxHeb || 0) + (i.taxSvc || 0), 0);
    const city    = invoicesList.reduce((s, i) => s + (i.cityTax || 0), 0);
    const paid    = invoicesList.filter(i => i.status === 'Paid').length;
    return { total, ar, overdue, vat, city, paid, count: invoicesList.length };
  }, [invoicesList]);

  const getStatusCls = (s) => ({ Paid: 'status-paid', Overdue: 'status-overdue', Proforma: 'status-proforma', Draft: 'status-draft' }[s] || '');

  const sourceOf = (src) => {
    const cfg = SOURCE_CFG[src];
    if (cfg) return { label: src, color: cfg.text, bg: cfg.bg, abbr: cfg.abbr };
    return { label: src || 'Direct', color: '#64748B', bg: '#F1F5F9', abbr: '?' };
  };

  const simulateDownload = (id) => {
    setDownloading(true);
    setTimeout(() => { setDownloading(false); alert(`📄 Facture ${id} générée (PDF — A4 international)`); }, 1400);
  };

  return (
    <div className="be-wrap animate-fade-in">

      {/* ── PAGE HEADER ────────────────────────────────────── */}
      <header className="be-header">
        <div className="be-header-left">
          <div className="be-breadcrumb">Finance · Facturation & Taxes</div>
          <h1 className="be-title">
            Billing Engine
            <span className="be-badge">{pmsMode === 'hot' ? 'HOT' : 'PRO'}</span>
          </h1>
          <p className="be-subtitle">Centre financier global · Conformité fiscale internationale</p>
        </div>
        <div className="be-header-right">
          <button className={`be-sync-btn ${spinning ? 'spinning' : ''}`} onClick={loadResas} title="Synchroniser avec le PMS">
            <RefreshCcw size={15} />
            <span>Sync PMS</span>
          </button>
          <div className="be-currency-pill">
            <Banknote size={13} />
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="EUR">€ EUR</option>
              <option value="MAD">DH MAD</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
          <div className="be-divider" />
          <button className="be-btn-outline"><Share2 size={14} /> Exporter</button>
          <button className="be-btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Nouvelle Facture
          </button>
        </div>
      </header>

      {/* ── KPI STRIP ──────────────────────────────────────── */}
      <div className="be-kpi-strip">
        <motion.div className="be-kpi" whileHover={{ y: -3 }}>
          <div className="be-kpi-top">
            <span className="be-kpi-lbl">Revenus Totaux</span>
            <span className="be-kpi-trend up"><ArrowUpRight size={11} /> +12%</span>
          </div>
          <div className="be-kpi-val">{fmt(kpi.total)}</div>
          <div className="be-kpi-bar"><div style={{ width: '78%' }} /></div>
          <div className="be-kpi-sub">{kpi.count} factures · {kpi.paid} réglées</div>
        </motion.div>

        <motion.div className="be-kpi" whileHover={{ y: -3 }}>
          <div className="be-kpi-top">
            <span className="be-kpi-lbl">Créances (A/R)</span>
            <Clock size={12} className="be-kpi-icon amber" />
          </div>
          <div className="be-kpi-val amber">{fmt(kpi.ar)}</div>
          <div className="be-kpi-sub">{invoicesList.filter(i => i.status !== 'Paid').length} folios ouverts</div>
        </motion.div>

        <motion.div className="be-kpi overdue" whileHover={{ y: -3 }}>
          <div className="be-kpi-top">
            <span className="be-kpi-lbl">Impayés (Échus)</span>
            <AlertCircle size={12} className="be-kpi-icon red" />
          </div>
          <div className="be-kpi-val red">{fmt(kpi.overdue)}</div>
          <div className="be-kpi-sub">{invoicesList.filter(i => i.status === 'Overdue').length} dossiers — Action requise</div>
        </motion.div>

        <motion.div className="be-kpi" whileHover={{ y: -3 }}>
          <div className="be-kpi-top">
            <span className="be-kpi-lbl">Provision Taxes</span>
            <Landmark size={12} className="be-kpi-icon blue" />
          </div>
          <div className="be-kpi-tax-rows">
            <div className="be-kpi-tax-row"><span>TVA collectée</span><strong>{fmt(kpi.vat)}</strong></div>
            <div className="be-kpi-tax-row"><span>Taxe séjour</span><strong>{fmt(kpi.city)}</strong></div>
          </div>
          <div className="be-kpi-sub">Prêt pour reversement DGI</div>
        </motion.div>

        <motion.div className="be-kpi" whileHover={{ y: -3 }}>
          <div className="be-kpi-top">
            <span className="be-kpi-lbl">Canaux OTA</span>
            <Globe size={12} className="be-kpi-icon blue" />
          </div>
          <div className="be-kpi-channels">
            {Object.entries(SOURCE_CFG).slice(0,4).map(([k, v]) => {
              const cnt = invoicesList.filter(i => i.source === k).length;
              if (!cnt) return null;
              return (
                <div key={k} className="be-kpi-ch" style={{ background: v.bg, color: v.text }}>
                  {v.abbr} <strong>{cnt}</strong>
                </div>
              );
            })}
          </div>
          <div className="be-kpi-sub">Réservations synchronisées</div>
        </motion.div>
      </div>

      {/* ── MAIN GRID ──────────────────────────────────────── */}
      <div className="be-main-grid">

        {/* LEFT: LEDGER ──────────────────────────────────── */}
        <section className="be-panel be-ledger-panel">
          <div className="be-panel-head">
            <div className="be-tabs">
              <button className={`be-tab ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
                PMS Ledger <span className="be-count">{filtered.length}</span>
              </button>
              <button className={`be-tab ${activeTab === 'erp' ? 'active' : ''}`} onClick={() => setActiveTab('erp')}>
                ERP & Tax Sync
              </button>
            </div>
            {activeTab === 'invoices' && (
              <div className="be-filters">
                <select className="be-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="All">Tous statuts</option>
                  <option value="Paid">Payé</option>
                  <option value="Overdue">Impayé</option>
                  <option value="Proforma">Proforma</option>
                  <option value="Draft">Brouillon</option>
                </select>
                <div className="be-search">
                  <Search size={13} />
                  <input placeholder="Client, Réf…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          {activeTab === 'invoices' ? (
            <div className="be-table-scroll hide-scrollbar">
              <table className="be-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Client</th>
                    <th>Canal</th>
                    <th>Date</th>
                    <th>Montant TTC</th>
                    <th>Statut</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className={selectedInv?.id === inv.id ? 'be-row-selected' : ''} onClick={() => setSelectedInv(inv)}>
                      <td className="be-cell-id">{inv.id}</td>
                      <td>
                        <div className="be-entity">
                          <div className="be-avatar" style={{ background: inv.status === 'Paid' ? '#DCFCE7' : '#F1F5F9', color: inv.status === 'Paid' ? '#059669' : '#64748B' }}>
                            {inv.guest[0]}
                          </div>
                          <div>
                            <div className="be-entity-name">{inv.guest}</div>
                            <div className="be-entity-sub">{inv.room} · {inv.nights}n</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {(() => { const s = sourceOf(inv.source); return (
                          <span className="be-src-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        ); })()}
                      </td>
                      <td className="be-cell-date">{inv.date}</td>
                      <td className="be-cell-amt">{fmt(inv.amount)}</td>
                      <td><span className={`be-status ${getStatusCls(inv.status)}`}>{inv.status}</span></td>
                      <td>
                        <div className="be-row-btns">
                          <button className="be-row-btn" title="PDF" onClick={e => { e.stopPropagation(); simulateDownload(inv.id); }}>
                            <Download size={13} />
                          </button>
                          <button className="be-row-btn"><MoreVertical size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="be-empty-row">Aucune facture trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="be-erp-pane">
              <div className="be-erp-head">
                <h3>Synchronisation ERP & Comptabilité</h3>
                <p>Flux directs vers vos plateformes de gestion financière certifiées</p>
              </div>
              <div className="be-erp-grid">
                {[
                  { name: 'SAP Business One', last: 'Il y a 2h', ok: true },
                  { name: 'Sage Intacct', last: 'Il y a 5h', ok: true },
                  { name: 'QuickBooks Pro', last: 'Désynchronisé', ok: false },
                  { name: 'Xero Accounting', last: 'Il y a 1h', ok: true },
                ].map((s, i) => (
                  <div key={i} className={`be-erp-card ${s.ok ? '' : 'be-erp-error'}`}>
                    <div className="be-erp-icon"><RefreshCcw size={18} /></div>
                    <div className="be-erp-meta">
                      <strong>{s.name}</strong>
                      <span>{s.last}</span>
                    </div>
                    <span className={`be-erp-dot ${s.ok ? 'ok' : 'err'}`} />
                    <button className="be-erp-btn">Sync</button>
                  </div>
                ))}
              </div>
              <div className="be-tax-compliance">
                <div className="be-tc-head">
                  <ShieldCheck size={16} />
                  <h4>Conformité Fiscale</h4>
                </div>
                <div className="be-tc-grid">
                  {['DGI Export (PDF)', 'FEC Comptable', 'TVA Mensuelle', 'Liasse Fiscale'].map((label, i) => (
                    <div key={i} className="be-tc-item">
                      <FileText size={14} />
                      <span>{label}</span>
                      <button className="be-tc-btn"><Download size={12} /> Export</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT: INVOICE PREVIEW ────────────────────────── */}
        <section className="be-panel be-folio-panel">
          <AnimatePresence mode="wait">
            {selectedInv ? (
              <motion.div
                className="be-invoice"
                key={selectedInv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {/* ── WATERMARK ─────────────────────── */}
                {selectedInv.status === 'Paid' && <div className="be-watermark">PAYÉ</div>}
                {selectedInv.status === 'Overdue' && <div className="be-watermark overdue">ÉCHU</div>}

                {/* ── INVOICE HEADER ────────────────── */}
                <div className="be-inv-head">
                  <div className="be-inv-brand">
                    <div className="be-inv-logo">
                      <span className="be-logo-mark">H</span>
                      <div className="be-logo-text">
                        <strong>HOVA</strong>
                        <span>{COMPANY.tagline}</span>
                      </div>
                    </div>
                    <div className="be-inv-company">
                      <div className="be-co-line"><MapPin size={10} /> {COMPANY.address}</div>
                      <div className="be-co-line"><Globe size={10} /> {COMPANY.web}</div>
                      <div className="be-co-line"><Phone size={10} /> {COMPANY.phone}</div>
                      <div className="be-co-line"><Mail size={10} /> {COMPANY.email}</div>
                    </div>
                  </div>

                  <div className="be-inv-doc-info">
                    <div className="be-inv-type-badge">{selectedInv.status === 'Proforma' ? 'PROFORMA' : 'FACTURE'}</div>
                    <div className="be-inv-ref-grid">
                      <div className="be-ref-row"><span>N° Document</span><strong>{selectedInv.id}</strong></div>
                      <div className="be-ref-row"><span>Date d'émission</span><strong>{selectedInv.date}</strong></div>
                      <div className="be-ref-row"><span>Réf. Réservation</span><strong>#{selectedInv.resaId || selectedInv.id}</strong></div>
                      <div className="be-ref-row"><span>Devise</span><strong>{currency}</strong></div>
                    </div>
                  </div>
                </div>

                {/* ── FROM / TO ─────────────────────── */}
                <div className="be-inv-parties">
                  <div className="be-party">
                    <div className="be-party-label">Émetteur</div>
                    <div className="be-party-name">{COMPANY.name}</div>
                    <div className="be-party-line">SIRET : {COMPANY.siret}</div>
                    <div className="be-party-line">N° TVA : {COMPANY.vat}</div>
                    <div className="be-party-line">{COMPANY.address}</div>
                  </div>
                  <ChevronRight size={18} className="be-parties-arrow" />
                  <div className="be-party">
                    <div className="be-party-label">Facturé à</div>
                    <div className="be-party-name">{selectedInv.guest}</div>
                    <div className="be-party-line">
                      {(() => { const s = sourceOf(selectedInv.source); return (
                        <span className="be-src-badge sm" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      ); })()}
                    </div>
                    <div className="be-party-line">{selectedInv.room} · {selectedInv.nights} nuit{selectedInv.nights > 1 ? 's' : ''}</div>
                    <div className="be-party-line">Check-in : {selectedInv.checkIn} → {selectedInv.checkOut}</div>
                    <div className="be-party-line be-party-email">{selectedInv.email}</div>
                  </div>
                </div>

                {/* ── LINE ITEMS ────────────────────── */}
                <div className="be-inv-items">
                  <table className="be-inv-table">
                    <thead>
                      <tr>
                        <th className="be-th-desc">Désignation</th>
                        <th className="be-th-cat">Catégorie</th>
                        <th className="be-th-amt">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInv.items.map((item, i) => (
                        <tr key={i}>
                          <td className="be-td-desc">{item.desc}</td>
                          <td>
                            <span className="be-item-cat">{item.cat}</span>
                          </td>
                          <td className="be-td-amt">{fmt(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── TOTALS ────────────────────────── */}
                <div className="be-inv-totals">
                  <div className="be-total-row">
                    <span>Total HT</span>
                    <span>{fmt(selectedInv.baseAmt)}</span>
                  </div>
                  <div className="be-total-row">
                    <span>TVA Hébergement (10%)</span>
                    <span>{fmt(selectedInv.taxHeb)}</span>
                  </div>
                  {selectedInv.taxSvc > 0 && (
                    <div className="be-total-row">
                      <span>TVA Services (20%)</span>
                      <span>{fmt(selectedInv.taxSvc)}</span>
                    </div>
                  )}
                  <div className="be-total-row">
                    <span>Taxe de séjour</span>
                    <span>{fmt(selectedInv.cityTax)}</span>
                  </div>
                  <div className="be-total-row grand">
                    <span>TOTAL TTC</span>
                    <span className="be-grand-amt">{fmt(selectedInv.amount)}</span>
                  </div>
                </div>

                {/* ── PAYMENT & LEGAL ───────────────── */}
                <div className="be-inv-footer">
                  <div className="be-inv-payment">
                    <div className="be-payment-method">
                      <CreditCard size={13} />
                      <span>{selectedInv.status === 'Paid' ? 'Réglé — Carte de crédit' : 'En attente de règlement'}</span>
                    </div>
                    <div className="be-iban-block">
                      <div className="be-iban-row"><span>IBAN</span><code>{COMPANY.iban}</code></div>
                      <div className="be-iban-row"><span>BIC</span><code>{COMPANY.bic}</code></div>
                    </div>
                  </div>
                  <div className="be-inv-legal">
                    <div className="be-legal-line">Document certifié conforme aux obligations fiscales françaises (CGI Art. 289)</div>
                    <div className="be-legal-line">Généré par Hova Billing Engine · {new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })}</div>
                    <div className="be-legal-line">{COMPANY.web} · {COMPANY.email}</div>
                  </div>
                </div>

                {/* ── ACTIONS BAR ───────────────────── */}
                <div className="be-inv-actions">
                  <button className="be-action-btn" onClick={() => window.print()}>
                    <Printer size={14} /> Imprimer
                  </button>
                  <button className="be-action-btn" onClick={() => alert('Email envoyé au client !')}>
                    <Send size={14} /> Envoyer
                  </button>
                  <button
                    className={`be-action-btn primary ${downloading ? 'loading' : ''}`}
                    onClick={() => simulateDownload(selectedInv.id)}
                    disabled={downloading}
                  >
                    {downloading
                      ? <><RefreshCcw size={14} className="be-spinning" /> Génération…</>
                      : <><Download size={14} /> Export PDF</>
                    }
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="be-empty-folio">
                <div className="be-empty-icon">
                  <FileCheck size={36} />
                </div>
                <div className="be-empty-logo">
                  <span className="be-logo-mark sm">H</span>
                  <div>
                    <strong>HOVA</strong>
                    <span>Billing Engine</span>
                  </div>
                </div>
                <h3>Sélectionnez une écriture</h3>
                <p>Cliquez sur une ligne du Ledger pour visualiser et générer la facture officielle Hova avec toutes les informations fiscales.</p>
                <div className="be-empty-features">
                  {['Conformité TVA', 'Multi-devises', 'Export PDF/A4', 'IBAN intégré'].map(f => (
                    <span key={f} className="be-empty-feat"><Star size={10} /> {f}</span>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* ── NEW INVOICE MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="be-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="be-modal"
              initial={{ y: 40, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.97 }}
            >
              <div className="be-modal-head">
                <div>
                  <h2>Nouvelle Facture Manuelle</h2>
                  <p>Saisie des prestations et génération du document fiscal</p>
                </div>
                <button className="be-close" onClick={() => setModalOpen(false)}>×</button>
              </div>

              <div className="be-modal-body">
                <div className="be-form-grid">
                  <div className="be-field">
                    <label>Client / Entité</label>
                    <div className="be-input-wrap">
                      <User size={14} />
                      <input placeholder="Nom complet ou Société" value={newForm.guest} onChange={e => setNewForm({ ...newForm, guest: e.target.value })} />
                    </div>
                  </div>
                  <div className="be-field">
                    <label>{pmsMode === 'hot' ? 'Villa / Unité' : 'Chambre'}</label>
                    <div className="be-input-wrap">
                      <Building2 size={14} />
                      <input placeholder={pmsMode === 'hot' ? 'Villa Agadir…' : 'ex: 302'} value={newForm.room} onChange={e => setNewForm({ ...newForm, room: e.target.value })} />
                    </div>
                  </div>
                  <div className="be-field">
                    <label>Type de compte</label>
                    <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value })}>
                      <option value="Individual">Individuel</option>
                      <option value="Corporate">Entreprise B2B</option>
                    </select>
                  </div>
                  <div className="be-field">
                    <label>Date d'émission</label>
                    <input type="date" value={newForm.date} onChange={e => setNewForm({ ...newForm, date: e.target.value })} />
                  </div>
                </div>

                <div className="be-items-zone">
                  <div className="be-items-head">
                    <h4>Détail des prestations</h4>
                    <button className="be-add-line" onClick={() => setNewForm({ ...newForm, items: [...newForm.items, { desc: '', amount: 0, cat: 'Hébergement' }] })}>
                      + Ajouter ligne
                    </button>
                  </div>
                  <table className="be-builder">
                    <thead>
                      <tr><th>Description</th><th>Catégorie</th><th>Montant ({currencySymbol[currency]})</th><th /></tr>
                    </thead>
                    <tbody>
                      {newForm.items.map((item, idx) => (
                        <tr key={idx}>
                          <td><input placeholder="Désignation" value={item.desc} onChange={e => { const it = [...newForm.items]; it[idx].desc = e.target.value; setNewForm({ ...newForm, items: it }); }} /></td>
                          <td>
                            <select value={item.cat} onChange={e => { const it = [...newForm.items]; it[idx].cat = e.target.value; setNewForm({ ...newForm, items: it }); }}>
                              <option>Hébergement</option>
                              <option>Restauration</option>
                              <option>Spa & Wellness</option>
                              <option>Taxe Séjour</option>
                              <option>Autre Service</option>
                            </select>
                          </td>
                          <td><input type="number" value={item.amount} onChange={e => { const it = [...newForm.items]; it[idx].amount = parseFloat(e.target.value) || 0; setNewForm({ ...newForm, items: it }); }} /></td>
                          <td><button className="be-del-line" onClick={() => { const it = newForm.items.filter((_, i) => i !== idx); setNewForm({ ...newForm, items: it }); }}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="be-modal-foot">
                <div className="be-modal-total">
                  <span>Total TTC estimé</span>
                  <strong>{fmt(newForm.items.reduce((a, i) => a + (i.amount || 0), 0))}</strong>
                </div>
                <div className="be-modal-btns">
                  <button className="be-btn-outline" onClick={() => alert('Impression…')}><Printer size={14} /> Imprimer</button>
                  <button className="be-btn-outline" onClick={() => alert('Email envoyé !')}><Send size={14} /> Envoyer</button>
                  <button className="be-btn-primary" onClick={() => {
                    const total = newForm.items.reduce((a, i) => a + (i.amount || 0), 0);
                    const id    = `INV-${new Date().getFullYear()}-${String(manualInvs.length + 1).padStart(3, '0')}`;
                    setManualInvs([{
                      id, resaId: null, guest: newForm.guest || 'Nouveau Client',
                      email: '', room: newForm.room || 'N/A', nights: 1,
                      checkIn: newForm.date, checkOut: newForm.date,
                      source: 'direct', baseAmt: total, taxHeb: 0, taxSvc: 0, cityTax: 0,
                      amount: total, status: 'Draft', date: newForm.date,
                      type: newForm.type, items: newForm.items.map(i => ({ ...i, tax: 0 })),
                    }, ...manualInvs]);
                    setModalOpen(false);
                  }}>
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingEngine;
