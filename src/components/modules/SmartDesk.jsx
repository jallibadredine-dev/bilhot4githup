import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Scan, CheckCircle2, ShieldAlert, UserPlus, Search,
  ChevronRight, Smartphone, CreditCard, Sparkles, Info, ArrowRight,
  Usb, Camera, FileText, X, RefreshCw, AlertTriangle, CheckCircle,
  Calendar, Clock, Building2, Key, LogIn, LogOut, Filter,
  ChevronDown, Wifi, Star, Phone, Mail, Globe, Printer,
  ScanLine, Shield, ZapOff, Zap, MoreHorizontal, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartDesk.css';

/* ─── DATA ───────────────────────────────────────────────── */
const DOC_TYPES = [
  { id: 'passport', label: 'Passeport',        icon: '🛂', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'cin',      label: 'Carte Nationale',  icon: '🪪', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'dl',       label: 'Permis Conduire',  icon: '🚗', color: '#0891B2', bg: '#ECFEFF' },
  { id: 'visa',     label: 'Visa',             icon: '✈️', color: '#059669', bg: '#ECFDF5' },
  { id: 'resident', label: 'Titre de Séjour',  icon: '🏠', color: '#D97706', bg: '#FFFBEB' },
];

const DEMO_SCAN = {
  passport:  { lastName: 'MARTIN',   firstName: 'Sophie',   docNumber: 'AB123456', nationality: 'FRA', dob: '15/03/1988', expiry: '20/07/2029', gender: 'F', issueCountry: 'FRANCE', mrz1: 'P<FRAMARTINSOPHIE<<<<<<<<<<<<<<<<<<<<<<<<<', mrz2: 'AB1234567FRA8803152F29070261234567890<<<<56' },
  cin:       { lastName: 'DUPONT',   firstName: 'Jean',     docNumber: 'CNI2234567', nationality: 'FRA', dob: '22/11/1975', expiry: '18/04/2030', gender: 'M', issueCountry: 'FRANCE', mrz1: '', mrz2: '' },
  dl:        { lastName: 'BENALI',   firstName: 'Karim',    docNumber: 'DL-987654321', nationality: 'MAR', dob: '07/06/1990', expiry: '03/09/2026', gender: 'M', issueCountry: 'MAROC', mrz1: '', mrz2: '' },
  visa:      { lastName: 'CHEN',     firstName: 'Li',       docNumber: 'V-AA99887766', nationality: 'CHN', dob: '11/02/1983', expiry: '30/10/2025', gender: 'F', issueCountry: 'CHINE', mrz1: '', mrz2: '' },
  resident:  { lastName: 'KOWALSKI', firstName: 'Anna',     docNumber: 'TR2024-55432', nationality: 'POL', dob: '29/08/1995', expiry: '14/02/2027', gender: 'F', issueCountry: 'FRANCE', mrz1: '', mrz2: '' },
};

const ARRIVALS_DATA = [
  { id: 1, name: 'Sophie Martin',  room: '304', type: 'VIP',      source: 'Airbnb',       checkIn: "Auj. 14:00", nights: 3,  amount: 387, status: 'arriving',   alert: false },
  { id: 2, name: 'Jean Dupont',    room: 'Att', type: 'Standard', source: 'Booking.com',  checkIn: "Auj. 15:30", nights: 2,  amount: 198, status: 'pending',    alert: true,  alertMsg: 'Pièce identité manquante' },
  { id: 3, name: 'Robert Chen',    room: '102', type: 'Elite',    source: 'Direct',       checkIn: "Fait",       nights: 4,  amount: 720, status: 'checked_in', alert: false },
  { id: 4, name: 'Fatima El Idrissi', room: '201', type: 'Standard', source: 'Expedia', checkIn: "Auj. 16:00", nights: 1,  amount: 145, status: 'arriving',   alert: false },
  { id: 5, name: 'Tomáš Novák',    room: 'Att', type: 'Standard', source: 'Booking.com',  checkIn: "Auj. 18:00", nights: 5,  amount: 625, status: 'pending',    alert: false },
  { id: 6, name: 'Maria García',   room: '103', type: 'Superior', source: 'Direct',       checkIn: "Fait",       nights: 2,  amount: 290, status: 'checked_in', alert: false },
];

const STATUS_CFG = {
  arriving:   { label: 'En route',   color: '#2563EB', bg: '#EFF6FF', dot: '#3B82F6' },
  pending:    { label: 'En attente', color: '#D97706', bg: '#FFFBEB', dot: '#F59E0B' },
  checked_in: { label: 'Enregistré', color: '#059669', bg: '#ECFDF5', dot: '#10B981' },
  no_show:    { label: 'No-show',    color: '#DC2626', bg: '#FFF5F5', dot: '#EF4444' },
};

const MANUAL_EMPTY = { lastName: '', firstName: '', docNumber: '', nationality: '', dob: '', expiry: '', gender: 'M' };

/* ─── COMPONENT ──────────────────────────────────────────── */
const SmartDesk = () => {
  const [arrivals,         setArrivals]         = useState(ARRIVALS_DATA);
  const [searchQ,          setSearchQ]          = useState('');
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [selectedGuest,    setSelectedGuest]    = useState(null);

  /* scanner state */
  const [docType,          setDocType]          = useState('passport');
  const [scanMode,         setScanMode]         = useState('idle');   // idle | scanning | result | manual
  const [scanResult,       setScanResult]       = useState(null);
  const [scanProgress,     setScanProgress]     = useState(0);
  const [connectedScanner, setConnectedScanner] = useState(null);
  const [manualData,       setManualData]       = useState(MANUAL_EMPTY);
  const [scanPhase,        setScanPhase]        = useState('');
  const scanIntervalRef = useRef(null);

  /* stats */
  const statsData = [
    { label: 'Arrivées',     value: '8',   sub: 'Aujourd\'hui',    color: '#2563EB', bg: '#EFF6FF', icon: LogIn },
    { label: 'Départs',      value: '5',   sub: 'Aujourd\'hui',    color: '#7C3AED', bg: '#F5F3FF', icon: LogOut },
    { label: 'Enregistrés',  value: '3',   sub: 'Déjà check-in',   color: '#059669', bg: '#ECFDF5', icon: CheckCircle },
    { label: 'En attente',   value: '2',   sub: 'Nécessite action', color: '#D97706', bg: '#FFFBEB', icon: AlertTriangle },
    { label: 'Taux Occup.',  value: '76%', sub: 'Capacité dispo',   color: '#2563EB', bg: '#FFF1F2', icon: Building2 },
    { label: 'Revenu/nuit',  value: '318€', sub: 'ADR moyen',       color: '#0891B2', bg: '#ECFEFF', icon: CreditCard },
  ];

  const filtered = arrivals.filter(g => {
    const matchQ = !searchQ || g.name.toLowerCase().includes(searchQ.toLowerCase()) || g.room.includes(searchQ);
    const matchF = filterStatus === 'all' || g.status === filterStatus;
    return matchQ && matchF;
  });

  /* ── Scanner connection ── */
  const connectScanner = async () => {
    if (navigator.usb) {
      try {
        const dev = await navigator.usb.requestDevice({ filters: [] });
        setConnectedScanner({ name: dev.productName || 'Scanner USB', type: 'usb', vendor: dev.manufacturerName });
        return;
      } catch (_) { /* user cancelled */ }
    }
    setConnectedScanner({ name: 'IS30 Passport Scanner', type: 'sim', vendor: 'InnoCom' });
  };

  const disconnectScanner = () => setConnectedScanner(null);

  /* ── Simulate scan ── */
  const startScan = () => {
    setScanMode('scanning');
    setScanResult(null);
    setScanProgress(0);
    const phases = ['Détection du document…', 'Lecture zone MRZ…', 'Extraction biométrique…', 'Vérification sécurité…', 'Analyse IA terminée'];
    let step = 0;
    scanIntervalRef.current = setInterval(() => {
      step++;
      setScanProgress(Math.min(step * 22, 98));
      setScanPhase(phases[Math.min(step - 1, phases.length - 1)]);
      if (step >= 5) {
        clearInterval(scanIntervalRef.current);
        setScanProgress(100);
        setScanPhase('');
        setTimeout(() => {
          setScanMode('result');
          setScanResult({ ...DEMO_SCAN[docType], docType, riskLevel: 'Faible', matchScore: '97%', fraudFlags: [] });
        }, 300);
      }
    }, 600);
  };

  useEffect(() => () => clearInterval(scanIntervalRef.current), []);

  const resetScanner = () => { setScanMode('idle'); setScanResult(null); setScanProgress(0); setManualData(MANUAL_EMPTY); };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setScanResult({ ...manualData, docType, riskLevel: 'N/A', matchScore: 'Manuel', fraudFlags: [] });
    setScanMode('result');
  };

  /* ── Check-in guest ── */
  const handleCheckin = (guestId) => {
    setArrivals(prev => prev.map(g => g.id === guestId ? { ...g, status: 'checked_in' } : g));
    setSelectedGuest(null);
  };

  const currentDocCfg = DOC_TYPES.find(d => d.id === docType);

  return (
    <div className="sd-container">

      {/* ── TOP BAR ── */}
      <div className="sd-topbar">
        <div className="sd-topbar-left">
          <div>
            <h1 className="sd-title">Front Desk <span className="sd-ai-badge"><Sparkles size={10}/> AI-Powered</span></h1>
            <p className="sd-subtitle">Réception · Check-in · Gestion arrivées</p>
          </div>
        </div>
        <div className="sd-topbar-right">
          <div className="sd-search-wrap">
            <Search size={15} className="sd-search-icon"/>
            <input
              className="sd-search-input"
              placeholder="Nom, chambre, réservation…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
          <button className="sd-btn sd-btn-ghost"><Download size={15}/><span>Rapport</span></button>
          <button className="sd-btn sd-btn-primary"><UserPlus size={15}/><span>Nouveau Walk-in</span></button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="sd-stats-bar">
        {statsData.map((s, i) => (
          <div key={i} className="sd-stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg }}>
            <div className="sd-stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={16}/>
            </div>
            <div className="sd-stat-body">
              <span className="sd-stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="sd-stat-label">{s.label}</span>
              <span className="sd-stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="sd-main-grid">

        {/* ══ LEFT: ARRIVAL QUEUE ══ */}
        <div className="sd-arrivals-panel">
          <div className="sd-panel-head">
            <div className="sd-panel-title">
              <Users size={17} color="#2563EB"/>
              <h3>File d'Arrivée</h3>
              <span className="sd-badge-count">{filtered.length} guest{filtered.length > 1 ? 's' : ''}</span>
            </div>
            <div className="sd-filter-tabs">
              {[['all','Tous'],['arriving','En route'],['pending','En attente'],['checked_in','Enregistrés']].map(([k,l]) => (
                <button
                  key={k}
                  className={`sd-filter-tab ${filterStatus === k ? 'active' : ''}`}
                  onClick={() => setFilterStatus(k)}
                >{l}</button>
              ))}
            </div>
          </div>

          <div className="sd-arrival-list">
            {filtered.length === 0 && (
              <div className="sd-empty-state">
                <Users size={28} color="#CCCCCC"/>
                <p>Aucune arrivée trouvée</p>
              </div>
            )}
            {filtered.map(guest => {
              const sCfg = STATUS_CFG[guest.status];
              const isSelected = selectedGuest?.id === guest.id;
              return (
                <div
                  key={guest.id}
                  className={`sd-guest-card ${guest.alert ? 'has-alert' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedGuest(isSelected ? null : guest)}
                >
                  <div className="sd-guest-left">
                    <div className="sd-guest-avatar" style={{ background: guest.type === 'VIP' ? '#FFF1F2' : guest.type === 'Elite' ? '#EFF6FF' : '#F7F7F7', color: guest.type === 'VIP' ? '#2563EB' : guest.type === 'Elite' ? '#2563EB' : '#555555' }}>
                      {guest.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="sd-guest-info">
                      <div className="sd-guest-name-row">
                        <span className="sd-guest-name">{guest.name}</span>
                        {guest.type === 'VIP' && <span className="sd-vip-badge">VIP</span>}
                        {guest.type === 'Elite' && <span className="sd-elite-badge">Elite</span>}
                      </div>
                      <div className="sd-guest-meta">
                        <span><Building2 size={11}/> Chambre {guest.room}</span>
                        <span><Globe size={11}/> {guest.source}</span>
                        <span><Clock size={11}/> {guest.checkIn}</span>
                        <span><Calendar size={11}/> {guest.nights} nuit{guest.nights > 1 ? 's' : ''}</span>
                      </div>
                      {guest.alert && (
                        <div className="sd-alert-msg"><ShieldAlert size={12}/>{guest.alertMsg}</div>
                      )}
                    </div>
                  </div>
                  <div className="sd-guest-right">
                    <div className="sd-guest-amount">{guest.amount}€</div>
                    <span className="sd-status-pill" style={{ background: sCfg.bg, color: sCfg.color }}>
                      <span className="sd-status-dot" style={{ background: sCfg.dot }}/>
                      {sCfg.label}
                    </span>
                    {guest.status !== 'checked_in' && (
                      <button
                        className="sd-checkin-btn"
                        onClick={e => { e.stopPropagation(); handleCheckin(guest.id); }}
                      >
                        Check-in <ChevronRight size={13}/>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT: AI DOCUMENT SCANNER ══ */}
        <div className="sd-scanner-panel">

          {/* Scanner panel header */}
          <div className="sd-panel-head sd-panel-head-scanner">
            <div className="sd-panel-title">
              <Sparkles size={17} color="#2563EB"/>
              <h3>AI Document Scanner</h3>
            </div>
            <div className="sd-scanner-connection">
              {connectedScanner ? (
                <div className="sd-conn-status connected">
                  <span className="sd-conn-dot"/>
                  <span>{connectedScanner.name}</span>
                  <button className="sd-conn-disconnect" onClick={disconnectScanner} title="Déconnecter">
                    <X size={12}/>
                  </button>
                </div>
              ) : (
                <button className="sd-btn-connect" onClick={connectScanner}>
                  <Usb size={14}/> Connecter Scanner
                </button>
              )}
            </div>
          </div>

          {/* Document type selector */}
          <div className="sd-doc-types">
            {DOC_TYPES.map(dt => (
              <button
                key={dt.id}
                className={`sd-doc-type-btn ${docType === dt.id ? 'active' : ''}`}
                style={docType === dt.id ? { background: dt.bg, borderColor: dt.color, color: dt.color } : {}}
                onClick={() => { setDocType(dt.id); resetScanner(); }}
              >
                <span className="sd-doc-type-icon">{dt.icon}</span>
                <span>{dt.label}</span>
              </button>
            ))}
          </div>

          {/* Scan area */}
          <div className="sd-scan-area">
            <AnimatePresence mode="wait">

              {/* Idle state */}
              {scanMode === 'idle' && (
                <motion.div key="idle" className="sd-scan-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="sd-scan-frame">
                    <div className="sd-scan-corner tl"/><div className="sd-scan-corner tr"/>
                    <div className="sd-scan-corner bl"/><div className="sd-scan-corner br"/>
                    <div className="sd-scan-idle-icon">{currentDocCfg?.icon}</div>
                    <p className="sd-scan-idle-text">Placer le {currentDocCfg?.label} dans la zone de lecture</p>
                  </div>
                  <div className="sd-scan-actions">
                    <button className="sd-scan-btn sd-scan-btn-primary" onClick={startScan}>
                      <ScanLine size={16}/>
                      {connectedScanner ? `Scanner avec ${connectedScanner.name}` : 'Simuler un Scan'}
                    </button>
                    <button className="sd-scan-btn sd-scan-btn-ghost" onClick={() => { setScanMode('manual'); }}>
                      <FileText size={15}/> Saisie Manuelle
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Scanning animation */}
              {scanMode === 'scanning' && (
                <motion.div key="scanning" className="sd-scanning-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="sd-scan-frame active">
                    <div className="sd-scan-corner tl"/><div className="sd-scan-corner tr"/>
                    <div className="sd-scan-corner bl"/><div className="sd-scan-corner br"/>
                    <div className="sd-scan-laser"/>
                    <div className="sd-scanning-icon-wrap">
                      <Scan size={40} className="sd-spin-slow"/>
                    </div>
                  </div>
                  <div className="sd-scan-progress-wrap">
                    <div className="sd-scan-progress-bar">
                      <motion.div className="sd-scan-progress-fill" animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }}/>
                    </div>
                    <p className="sd-scan-phase">{scanPhase || 'Initialisation…'}</p>
                  </div>
                </motion.div>
              )}

              {/* Result */}
              {scanMode === 'result' && scanResult && (
                <motion.div key="result" className="sd-scan-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="sd-result-header">
                    <div className="sd-result-ok">
                      <CheckCircle size={20} color="#059669"/>
                      <div>
                        <span className="sd-result-ok-title">Document Vérifié</span>
                        <span className="sd-result-ok-sub">Score IA: {scanResult.matchScore} · Risque: {scanResult.riskLevel}</span>
                      </div>
                    </div>
                    <button className="sd-icon-btn" onClick={resetScanner} title="Nouveau scan"><RefreshCw size={15}/></button>
                  </div>

                  <div className="sd-result-body">
                    {/* Photo placeholder + names */}
                    <div className="sd-result-identity">
                      <div className="sd-result-photo">
                        <div className="sd-photo-placeholder">
                          <Users size={28} color="#AAAAAA"/>
                          <span>Photo</span>
                        </div>
                      </div>
                      <div className="sd-result-names">
                        <div className="sd-result-full-name">{scanResult.firstName} {scanResult.lastName}</div>
                        <div className="sd-result-doc-type-tag" style={{ background: currentDocCfg?.bg, color: currentDocCfg?.color }}>
                          {currentDocCfg?.icon} {currentDocCfg?.label}
                        </div>
                      </div>
                    </div>

                    {/* Fields grid */}
                    <div className="sd-result-fields">
                      {[
                        ['Nom',          scanResult.lastName],
                        ['Prénom',       scanResult.firstName],
                        ['N° Document',  scanResult.docNumber],
                        ['Nationalité',  scanResult.nationality],
                        ['Date naissance', scanResult.dob],
                        ['Expiration',   scanResult.expiry],
                      ].map(([label, val]) => (
                        <div key={label} className="sd-field-row">
                          <span className="sd-field-label">{label}</span>
                          <span className="sd-field-val">{val || '—'}</span>
                        </div>
                      ))}
                    </div>

                    {/* MRZ line (passport only) */}
                    {scanResult.mrz1 && (
                      <div className="sd-mrz-section">
                        <span className="sd-mrz-label">Zone MRZ</span>
                        <code className="sd-mrz-code">{scanResult.mrz1}<br/>{scanResult.mrz2}</code>
                      </div>
                    )}

                    {/* Risk assessment */}
                    <div className="sd-risk-row">
                      <div className="sd-risk-badge low">
                        <Shield size={13}/> Risque {scanResult.riskLevel}
                      </div>
                      <div className="sd-risk-badge match">
                        <Sparkles size={12}/> Match {scanResult.matchScore}
                      </div>
                    </div>
                  </div>

                  <div className="sd-result-actions">
                    <button className="sd-scan-btn sd-scan-btn-primary">
                      <CheckCircle2 size={15}/> Valider & Enregistrer
                    </button>
                    <button className="sd-scan-btn sd-scan-btn-ghost" onClick={startScan}>
                      <RefreshCw size={14}/> Rescanner
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Manual entry form */}
              {scanMode === 'manual' && (
                <motion.div key="manual" className="sd-manual-form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="sd-manual-header">
                    <FileText size={16} color="#2563EB"/>
                    <span>Saisie Manuelle — {currentDocCfg?.label}</span>
                    <button className="sd-icon-btn" onClick={resetScanner}><X size={14}/></button>
                  </div>
                  <form className="sd-manual-fields" onSubmit={handleManualSubmit}>
                    <div className="sd-mf-row">
                      <div className="sd-mf-group">
                        <label>Nom de famille <span className="sd-req">*</span></label>
                        <input required placeholder="MARTIN" value={manualData.lastName} onChange={e => setManualData(p => ({ ...p, lastName: e.target.value }))}/>
                      </div>
                      <div className="sd-mf-group">
                        <label>Prénom(s) <span className="sd-req">*</span></label>
                        <input required placeholder="Sophie" value={manualData.firstName} onChange={e => setManualData(p => ({ ...p, firstName: e.target.value }))}/>
                      </div>
                    </div>
                    <div className="sd-mf-row">
                      <div className="sd-mf-group">
                        <label>N° Document <span className="sd-req">*</span></label>
                        <input required placeholder="AB123456" value={manualData.docNumber} onChange={e => setManualData(p => ({ ...p, docNumber: e.target.value }))}/>
                      </div>
                      <div className="sd-mf-group">
                        <label>Nationalité</label>
                        <input placeholder="FRA / MAR / ESP…" value={manualData.nationality} onChange={e => setManualData(p => ({ ...p, nationality: e.target.value }))}/>
                      </div>
                    </div>
                    <div className="sd-mf-row">
                      <div className="sd-mf-group">
                        <label>Date de naissance</label>
                        <input type="date" value={manualData.dob} onChange={e => setManualData(p => ({ ...p, dob: e.target.value }))}/>
                      </div>
                      <div className="sd-mf-group">
                        <label>Date expiration</label>
                        <input type="date" value={manualData.expiry} onChange={e => setManualData(p => ({ ...p, expiry: e.target.value }))}/>
                      </div>
                    </div>
                    <div className="sd-mf-row">
                      <div className="sd-mf-group">
                        <label>Genre</label>
                        <select value={manualData.gender} onChange={e => setManualData(p => ({ ...p, gender: e.target.value }))}>
                          <option value="M">Masculin</option>
                          <option value="F">Féminin</option>
                          <option value="X">Autre</option>
                        </select>
                      </div>
                    </div>
                    <div className="sd-mf-actions">
                      <button type="submit" className="sd-scan-btn sd-scan-btn-primary">
                        <CheckCircle2 size={15}/> Confirmer
                      </button>
                      <button type="button" className="sd-scan-btn sd-scan-btn-ghost" onClick={resetScanner}>
                        Annuler
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Quick stats */}
          <div className="sd-scanner-footer">
            <div className="sd-scan-stat">
              <CheckCircle size={14} color="#059669"/>
              <span>12 docs scannés aujourd'hui</span>
            </div>
            <div className="sd-scan-stat">
              <Shield size={14} color="#D97706"/>
              <span>0 alerte fraude</span>
            </div>
            <div className="sd-scan-stat">
              <Printer size={14} color="#717171"/>
              <span>Fiche police prête</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── MASS CHECK-IN BAR ── */}
      <div className="sd-mass-bar">
        <div className="sd-mass-bar-left">
          <div className="sd-mass-icon"><Sparkles size={16}/></div>
          <div>
            <strong>Flux de Groupe — Renault Paris</strong>
            <span>15 chambres prêtes · Attribution automatique disponible</span>
          </div>
        </div>
        <div className="sd-mass-bar-right">
          <span className="sd-mass-count">15 / 15 confirmés</span>
          <button className="sd-mass-btn">
            <Zap size={15}/> Attribution Auto IA
          </button>
        </div>
      </div>

    </div>
  );
};

export default SmartDesk;
