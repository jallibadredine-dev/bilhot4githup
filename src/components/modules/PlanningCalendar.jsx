import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, User, CreditCard, Key,
  Phone, Mail, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  LogOut, Filter, Search, Smartphone, Globe2, Zap, Star, BedDouble,
  Users, ArrowRight, RefreshCw, Building2, MoreHorizontal
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { persistReservation } from '../../store/realtime';
import './PlanningCalendar.css';

/* ─── CONSTANTS ─────────────────────────────────────────── */
const TODAY    = new Date(2026, 4, 17); // May 17 2026
const SIDEBAR  = 190;
const ROW_H    = 68;
const HEADER_H = 56;
const VIEWS    = {
  week:  { label: '7 j',  days: 7,  colW: 96 },
  bi:    { label: '14 j', days: 14, colW: 60 },
  month: { label: 'Mois', days: 31, colW: 40 },
};
const DAY_ABR    = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const MONTH_ABR  = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

const SOURCE_CFG = {
  'Booking.com': { bg: '#003580', text: '#fff',    abbr: 'B.',  light: '#EFF6FF' },
  'Airbnb':      { bg: '#FF5A5F', text: '#fff',    abbr: 'A.',  light: '#FFF1F2' },
  'Expedia':     { bg: '#FFC72C', text: '#1A1A1A', abbr: 'E.',  light: '#FFFBEB' },
  'Direct':      { bg: '#16A34A', text: '#fff',    abbr: 'D.',  light: '#F0FDF4' },
  'Manuel':      { bg: '#7C3AED', text: '#fff',    abbr: 'M.',  light: '#F5F3FF' },
};

const STATUS_CFG = {
  'confirmed':   { label: 'Confirmée',   color: '#2563EB', bg: '#DBEAFE', dot: '#2563EB' },
  'in-house':    { label: 'En séjour',   color: '#15803D', bg: '#DCFCE7', dot: '#16A34A' },
  'pending':     { label: 'En attente',  color: '#B45309', bg: '#FEF3C7', dot: '#F59E0B' },
  'checked-out': { label: 'Parti',       color: '#475569', bg: '#F1F5F9', dot: '#94A3B8' },
};

const ROOMS = [
  { id:'101', name:'Suite Panorama',    type:'Suite Supérieure',    img:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=80&h=80&fit=crop' },
  { id:'102', name:'Chambre Standard',  type:'Standard Confort',    img:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=80&h=80&fit=crop' },
  { id:'103', name:'Chambre Standard',  type:'Vue Jardin',          img:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=80&h=80&fit=crop' },
  { id:'201', name:'Junior Suite',      type:'Suite Confort',       img:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=80&h=80&fit=crop' },
  { id:'202', name:'Suite Deluxe',      type:'Deluxe Balcon',       img:'https://images.unsplash.com/photo-1549294413-26f195200c16?w=80&h=80&fit=crop' },
  { id:'304', name:'Penthouse VIP',     type:'Penthouse Prestige',  img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=80&h=80&fit=crop' },
  { id:'305', name:'Chambre Vue Mer',   type:'Supérieure Mer',      img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=80&h=80&fit=crop' },
  { id:'106', name:'Suite Jardin',      type:'Junior Suite Jardin', img:'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=80&h=80&fit=crop' },
];

const INIT_RESA = [
  { id:'R001', guest:'Chen, Robert',    roomId:'304', checkIn:'2026-05-14', checkOut:'2026-05-18', status:'in-house',    source:'Booking.com', price:1200, paid:600,  guests:2, notes:'VIP — champagne bienvenue.',       hasKey:true,  email:'r.chen@mail.com',   phone:'+33 6 11 22 33 44' },
  { id:'R002', guest:'Dupont, Alice',   roomId:'101', checkIn:'2026-05-15', checkOut:'2026-05-17', status:'checked-out', source:'Direct',      price:340,  paid:340,  guests:2, notes:'',                                hasKey:false, email:'a.dupont@mail.com', phone:'+33 6 22 33 44 55' },
  { id:'R003', guest:'Martin, Sophie',  roomId:'201', checkIn:'2026-05-12', checkOut:'2026-05-16', status:'checked-out', source:'Airbnb',      price:480,  paid:480,  guests:1, notes:'Early check-out demandé.',         hasKey:false, email:'s.martin@mail.com', phone:'+33 6 33 44 55 66' },
  { id:'R004', guest:'Smith, John',     roomId:'202', checkIn:'2026-05-17', checkOut:'2026-05-20', status:'pending',     source:'Airbnb',      price:520,  paid:0,    guests:3, notes:'',                                hasKey:false, email:'j.smith@mail.com',  phone:'+44 7 44 55 66 77' },
  { id:'R005', guest:'Müller, Hans',    roomId:'103', checkIn:'2026-05-18', checkOut:'2026-05-23', status:'confirmed',   source:'Expedia',     price:750,  paid:375,  guests:2, notes:'Lit bébé requis.',                hasKey:false, email:'h.muller@mail.com', phone:'+49 6 55 66 77 88' },
  { id:'R006', guest:'Leroy, Emma',     roomId:'305', checkIn:'2026-05-16', checkOut:'2026-05-19', status:'in-house',    source:'Booking.com', price:410,  paid:410,  guests:2, notes:'',                                hasKey:true,  email:'e.leroy@mail.com',  phone:'+33 6 66 77 88 99' },
  { id:'R007', guest:'Zhang, Wei',      roomId:'201', checkIn:'2026-05-20', checkOut:'2026-05-26', status:'confirmed',   source:'Direct',      price:900,  paid:450,  guests:2, notes:'',                                hasKey:false, email:'w.zhang@mail.com',  phone:'+86 13 77 88 99 00' },
  { id:'R008', guest:'Leblanc, Paul',   roomId:'102', checkIn:'2026-05-17', checkOut:'2026-05-19', status:'in-house',    source:'Booking.com', price:270,  paid:135,  guests:1, notes:'',                                hasKey:true,  email:'p.leblanc@mail.com',phone:'+33 6 88 99 00 11' },
  { id:'R009', guest:'Garcia, Ana',     roomId:'101', checkIn:'2026-05-22', checkOut:'2026-05-28', status:'confirmed',   source:'Airbnb',      price:960,  paid:480,  guests:2, notes:'Anniversaire 25 mai.',             hasKey:false, email:'a.garcia@mail.com', phone:'+34 6 99 00 11 22' },
  { id:'R010', guest:'Kumar, Raj',      roomId:'202', checkIn:'2026-05-21', checkOut:'2026-05-23', status:'confirmed',   source:'Direct',      price:380,  paid:190,  guests:2, notes:'',                                hasKey:false, email:'r.kumar@mail.com',  phone:'+91 98 00 11 22 33' },
  { id:'R011', guest:'Rossi, Marco',    roomId:'106', checkIn:'2026-05-15', checkOut:'2026-05-18', status:'in-house',    source:'Expedia',     price:420,  paid:420,  guests:2, notes:'',                                hasKey:true,  email:'m.rossi@mail.com',  phone:'+39 3 11 22 33 44' },
  { id:'R012', guest:'Okafor, Nnamdi',  roomId:'304', checkIn:'2026-05-23', checkOut:'2026-05-27', status:'confirmed',   source:'Booking.com', price:1600, paid:800,  guests:4, notes:'Suite à préparer en avance.',     hasKey:false, email:'n.okafor@mail.com', phone:'+234 80 22 33 44 55' },
  { id:'R013', guest:'Bernstein, Eva',  roomId:'103', checkIn:'2026-05-14', checkOut:'2026-05-17', status:'checked-out', source:'Direct',      price:300,  paid:300,  guests:1, notes:'',                                hasKey:false, email:'e.bern@mail.com',   phone:'+43 7 33 44 55 66' },
  { id:'R014', guest:'Petit, Claire',   roomId:'305', checkIn:'2026-05-21', checkOut:'2026-05-25', status:'confirmed',   source:'Airbnb',      price:580,  paid:290,  guests:2, notes:'',                                hasKey:false, email:'c.petit@mail.com',  phone:'+33 6 44 55 66 77' },
  { id:'R015', guest:'Torres, Diego',   roomId:'106', checkIn:'2026-05-19', checkOut:'2026-05-22', status:'confirmed',   source:'Expedia',     price:450,  paid:225,  guests:3, notes:'',                                hasKey:false, email:'d.torres@mail.com', phone:'+52 55 55 66 77 88' },
];

/* ─── HELPERS ───────────────────────────────────────────── */
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const diffDays = (a, b) => Math.round((parseDate(a) - parseDate(b)) / 86400000);
const parseDate = (s) => typeof s === 'string' ? new Date(s + 'T00:00:00') : s;
const fmtDate  = (d) => `${d.getDate()} ${MONTH_ABR[d.getMonth()]}`;
const fmtISO   = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const isToday  = (d) => diffDays(d, TODAY) === 0;
const isWeekend= (d) => [0,6].includes(d.getDay());
const nights   = (ci, co) => Math.max(1, diffDays(co, ci));

/* ─── SUB-COMPONENTS ─────────────────────────────────────── */
const SourceBadge = ({ source, size = 'sm' }) => {
  const cfg = SOURCE_CFG[source] || SOURCE_CFG['Manuel'];
  return (
    <span className={`pc-source-badge pc-source-${size}`} style={{ background: cfg.bg, color: cfg.text }}>
      {size === 'sm' ? cfg.abbr : source}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG['confirmed'];
  return (
    <span className="pc-status-pill" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="pc-status-dot" style={{ background: cfg.dot }}/>
      {cfg.label}
    </span>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const PlanningCalendar = () => {
  // Read directly from the centralized store — reactive to realtime updates
  const storeResas    = useAppStore(s => s.reservations);
  const upsertResa    = useAppStore(s => s.upsertReservation);
  // Fallback to built-in demo data when store is empty (no Supabase connection)
  const reservas      = storeResas.length > 0 ? storeResas : INIT_RESA;

  const [viewKey,   setViewKey]   = useState('bi');
  const [startDate, setStartDate] = useState(() => addDays(TODAY, -3));
  const [selected,  setSelected]  = useState(null);
  const [panelTab,  setPanelTab]  = useState('detail');
  const [creating,  setCreating]  = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQ,   setSearchQ]   = useState('');
  const [showSearch,setShowSearch]= useState(false);
  const [pin,       setPin]       = useState(null);
  const gridRef = useRef(null);

  const view  = VIEWS[viewKey];
  const colW  = view.colW;
  const vDays = view.days;
  const endDate = addDays(startDate, vDays - 1);

  const [form, setForm] = useState({
    guest:'', email:'', phone:'', roomId:'', checkIn: fmtISO(TODAY), checkOut: fmtISO(addDays(TODAY,2)),
    source:'Direct', status:'confirmed', price:'', notes:'', guests:'2',
  });

  /* reservas is derived from the global store — no local persistence needed */

  /* ─── Navigation ─── */
  const goToday  = () => setStartDate(addDays(TODAY, -3));
  const goPrev   = () => setStartDate(d => addDays(d, -vDays));
  const goNext   = () => setStartDate(d => addDays(d, vDays));

  /* ─── Visible days array ─── */
  const days = Array.from({ length: vDays }, (_, i) => addDays(startDate, i));

  /* ─── Filtered reservations ─── */
  const filtered = reservas.filter(r => {
    if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
    if (searchQ && !r.guest.toLowerCase().includes(searchQ.toLowerCase())) return false;
    const ci = diffDays(r.checkIn, startDate);
    const co = diffDays(r.checkOut, startDate);
    return co > 0 && ci < vDays;
  });

  /* ─── Bar geometry for a reservation ─── */
  const barGeo = (res) => {
    const colStart = Math.max(0, diffDays(res.checkIn, startDate));
    const colEnd   = Math.min(vDays, diffDays(res.checkOut, startDate));
    if (colEnd <= colStart) return null;
    return {
      left: colStart * colW,
      width: (colEnd - colStart) * colW - 3,
      clippedLeft: colStart > diffDays(res.checkIn, startDate),
    };
  };

  /* ─── Handlers ─── */
  const openRes = (res, e) => { e.stopPropagation(); setSelected(res); setPanelTab('detail'); setPin(null); };
  const closePanel = () => setSelected(null);
  const handleCellClick = (roomId, dayIdx) => {
    const d = addDays(startDate, dayIdx);
    setForm(f => ({ ...f, roomId, checkIn: fmtISO(d), checkOut: fmtISO(addDays(d, 2)) }));
    setCreating(true);
  };

  const submitCreate = () => {
    if (!form.guest.trim() || !form.roomId) return;
    const newR = {
      id: `R${String(reservas.length + 1).padStart(3,'0')}`,
      ...form,
      price: parseFloat(form.price) || 0,
      paid: 0,
      guests: parseInt(form.guests) || 1,
      hasKey: false,
    };
    upsertResa(newR);           // optimistic update in store
    persistReservation(newR);  // persist to Supabase (fire-and-forget)
    setCreating(false);
  };

  const genPin = () => {
    setPin(`${Math.floor(1000+Math.random()*9000)}-${Math.floor(10+Math.random()*90)}`);
    if (selected) {
      const updated = { ...selected, hasKey: true };
      upsertResa(updated);            // optimistic update in store
      persistReservation(updated);   // persist to Supabase
      setSelected(s => ({ ...s, hasKey: true }));
    }
  };

  /* ─── Today column index ─── */
  const todayIdx = diffDays(TODAY, startDate);
  const todayVisible = todayIdx >= 0 && todayIdx < vDays;

  /* ─── Date range label ─── */
  const rangeLabel = `${fmtDate(startDate)} — ${fmtDate(endDate)} ${endDate.getFullYear()}`;

  /* ─── Occupancy today ─── */
  const todayOccupied = reservas.filter(r => {
    const ci = diffDays(r.checkIn, TODAY);
    const co = diffDays(r.checkOut, TODAY);
    return ci <= 0 && co > 0;
  }).length;

  return (
    <div className="pc-root">

      {/* ══ TOOLBAR ══════════════════════════════════════════ */}
      <div className="pc-toolbar">
        <div className="pc-toolbar-left">
          <div className="pc-nav-group">
            <button className="pc-nav-btn" onClick={goPrev}><ChevronLeft size={16}/></button>
            <button className="pc-nav-btn" onClick={goNext}><ChevronRight size={16}/></button>
          </div>
          <button className="pc-today-btn" onClick={goToday}>Aujourd'hui</button>
          <span className="pc-date-range">{rangeLabel}</span>
        </div>

        <div className="pc-toolbar-center">
          {['all', 'Booking.com', 'Airbnb', 'Expedia', 'Direct', 'Manuel'].map(src => (
            <button
              key={src}
              className={`pc-filter-chip ${sourceFilter === src ? 'active' : ''}`}
              style={sourceFilter === src && src !== 'all' ? {
                background: SOURCE_CFG[src]?.bg,
                color: SOURCE_CFG[src]?.text,
                borderColor: SOURCE_CFG[src]?.bg,
              } : {}}
              onClick={() => setSourceFilter(src)}
            >
              {src === 'all' ? `Tous (${reservas.length})` : src}
            </button>
          ))}
        </div>

        <div className="pc-toolbar-right">
          {showSearch
            ? <input className="pc-search-input" autoFocus placeholder="Rechercher un client…"
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                onBlur={() => { if (!searchQ) setShowSearch(false); }}/>
            : <button className="pc-icon-btn" onClick={() => setShowSearch(true)} title="Rechercher"><Search size={15}/></button>
          }
          <div className="pc-view-toggle">
            {Object.entries(VIEWS).map(([k, v]) => (
              <button key={k} className={viewKey === k ? 'active' : ''} onClick={() => setViewKey(k)}>
                {v.label}
              </button>
            ))}
          </div>
          <button className="pc-add-btn" onClick={() => { setForm(f => ({...f, roomId:'', checkIn:fmtISO(TODAY), checkOut:fmtISO(addDays(TODAY,2))})); setCreating(true); }}>
            <Plus size={15}/> Nouvelle Résa
          </button>
        </div>
      </div>

      {/* ══ GRID (scrollable) ════════════════════════════════ */}
      <div className="pc-grid-wrap" ref={gridRef}>
        <div className="pc-inner" style={{ width: SIDEBAR + vDays * colW }}>

          {/* ── Day header ── */}
          <div className="pc-day-header" style={{ paddingLeft: SIDEBAR }}>
            {days.map((d, i) => (
              <div
                key={i}
                className={`pc-day-col ${isToday(d) ? 'today' : ''} ${isWeekend(d) ? 'weekend' : ''}`}
                style={{ width: colW }}
              >
                <span className="pc-day-abr">{DAY_ABR[d.getDay()]}</span>
                <span className="pc-day-num">{d.getDate()}</span>
                {colW >= 52 && <span className="pc-day-month">{MONTH_ABR[d.getMonth()]}</span>}
              </div>
            ))}
          </div>

          {/* ── Tracks ── */}
          <div className="pc-tracks">
            {/* Today vertical line */}
            {todayVisible && (
              <div
                className="pc-today-line"
                style={{ left: SIDEBAR + todayIdx * colW + colW / 2 }}
              />
            )}

            {ROOMS.map(room => {
              const roomResas = filtered.filter(r => r.roomId === room.id);
              const isOccupiedToday = reservas.some(r => r.roomId === room.id && diffDays(r.checkIn, TODAY) <= 0 && diffDays(r.checkOut, TODAY) > 0);

              return (
                <div className="pc-track-row" key={room.id}>
                  {/* Sidebar label */}
                  <div className="pc-track-label" style={{ width: SIDEBAR }}>
                    <img src={room.img} alt={room.name} className="pc-room-img" loading="lazy"/>
                    <div className="pc-room-info">
                      <span className="pc-room-num">Ch. {room.id}</span>
                      <span className="pc-room-name">{room.name}</span>
                      <span className="pc-room-type">{room.type}</span>
                    </div>
                    <div className={`pc-room-dot ${isOccupiedToday ? 'occupied' : 'free'}`}/>
                  </div>

                  {/* Day cells + bars */}
                  <div className="pc-track-cells" style={{ width: vDays * colW }}>
                    {/* Click cells */}
                    <div className="pc-cells-flex">
                      {days.map((d, i) => (
                        <div
                          key={i}
                          className={`pc-cell ${isToday(d) ? 'today' : ''} ${isWeekend(d) ? 'weekend' : ''}`}
                          style={{ width: colW }}
                          onClick={() => handleCellClick(room.id, i)}
                        />
                      ))}
                    </div>

                    {/* Reservation bars */}
                    {roomResas.map(res => {
                      const geo = barGeo(res);
                      if (!geo) return null;
                      const cfg = SOURCE_CFG[res.source] || SOURCE_CFG['Manuel'];
                      const n   = nights(res.checkIn, res.checkOut);
                      return (
                        <motion.div
                          key={res.id}
                          className={`pc-bar status-${res.status} ${geo.clippedLeft ? 'clipped-left' : ''}`}
                          style={{ left: geo.left, width: geo.width, background: cfg.bg }}
                          onClick={(e) => openRes(res, e)}
                          whileHover={{ y: -1, filter: 'brightness(1.08)', zIndex: 20 }}
                          title={`${res.guest} · ${res.checkIn} → ${res.checkOut}`}
                        >
                          <div className="pc-bar-abbr" style={{ background: 'rgba(0,0,0,0.25)', color: cfg.text }}>
                            {cfg.abbr}
                          </div>
                          <div className="pc-bar-body">
                            <span className="pc-bar-guest" style={{ color: cfg.text }}>
                              {res.guest.split(',')[0]}
                            </span>
                            {geo.width > 80 && (
                              <span className="pc-bar-meta" style={{ color: cfg.text + 'CC' }}>
                                {n}n · {fmtDate(parseDate(res.checkIn))}
                              </span>
                            )}
                          </div>
                          {res.hasKey && (
                            <div className="pc-bar-key" style={{ color: cfg.text + 'CC' }}>
                              <Key size={10}/>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Footer: Occupancy row ── */}
          <div className="pc-occ-row" style={{ paddingLeft: SIDEBAR }}>
            {days.map((d, i) => {
              const occ = reservas.filter(r => {
                const ci = diffDays(r.checkIn, d);
                const co = diffDays(r.checkOut, d);
                return ci <= 0 && co > 0;
              }).length;
              const pct = Math.round((occ / ROOMS.length) * 100);
              return (
                <div key={i} className={`pc-occ-cell ${isToday(d) ? 'today' : ''}`} style={{ width: colW }}>
                  {colW >= 52 && <span>{occ}/{ROOMS.length}</span>}
                  <div className="pc-occ-bar" style={{ height: `${pct}%` }}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ SIDE PANEL ═══════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <motion.div className="pc-panel-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePanel}>
            <motion.div
              className="pc-panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="pc-panel-head" style={{ borderTop: `4px solid ${SOURCE_CFG[selected.source]?.bg}` }}>
                <div className="pc-panel-head-left">
                  <span className="pc-panel-guest">{selected.guest}</span>
                  <div className="pc-panel-meta">
                    <span className="pc-panel-id">{selected.id}</span>
                    <SourceBadge source={selected.source} size="md"/>
                    <StatusPill status={selected.status}/>
                  </div>
                </div>
                <button className="pc-close-btn" onClick={closePanel}><X size={18}/></button>
              </div>

              {/* Info strip */}
              <div className="pc-panel-strip">
                <div className="pc-strip-item">
                  <Calendar size={13} color="#64748B"/>
                  <span>{fmtDate(parseDate(selected.checkIn))} → {fmtDate(parseDate(selected.checkOut))}</span>
                </div>
                <div className="pc-strip-item">
                  <BedDouble size={13} color="#64748B"/>
                  <span>{ROOMS.find(r => r.id === selected.roomId)?.name || 'Ch. '+selected.roomId}</span>
                </div>
                <div className="pc-strip-item">
                  <Users size={13} color="#64748B"/>
                  <span>{selected.guests} pers. · {nights(selected.checkIn, selected.checkOut)} nuits</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="pc-panel-tabs">
                {[['detail','Détails'],['finance','Finances'],['access','Accès IoT']].map(([k,l]) => (
                  <button key={k} className={panelTab === k ? 'active' : ''} onClick={() => setPanelTab(k)}>{l}</button>
                ))}
              </div>

              {/* Tab bodies */}
              <div className="pc-panel-body">
                {panelTab === 'detail' && (
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="pc-tab-pane">
                    <div className="pc-info-grid">
                      {[
                        ['Check-in', selected.checkIn + ' à 14h00'],
                        ['Check-out', selected.checkOut + ' à 11h00'],
                        ['Statut', STATUS_CFG[selected.status]?.label],
                        ['Canal OTA', selected.source],
                        ['Adultes', selected.guests + ' adultes'],
                        ['Nuits', nights(selected.checkIn, selected.checkOut) + ' nuits'],
                      ].map(([k,v]) => (
                        <div className="pc-info-block" key={k}>
                          <span className="pc-info-label">{k}</span>
                          <span className="pc-info-value">{v}</span>
                        </div>
                      ))}
                    </div>
                    {(selected.email || selected.phone) && (
                      <div className="pc-contact-row">
                        {selected.email && <a href={`mailto:${selected.email}`} className="pc-contact-chip"><Mail size={12}/>{selected.email}</a>}
                        {selected.phone && <a href={`tel:${selected.phone}`} className="pc-contact-chip"><Phone size={12}/>{selected.phone}</a>}
                      </div>
                    )}
                    {selected.notes && (
                      <div className="pc-notes-box">
                        <span className="pc-notes-label">Notes</span>
                        <p>{selected.notes}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {panelTab === 'finance' && (
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="pc-tab-pane">
                    <div className="pc-finance-kpis">
                      <div className="pc-fin-kpi">
                        <span>Total séjour</span>
                        <strong>{selected.price.toLocaleString('fr-FR')} €</strong>
                      </div>
                      <div className="pc-fin-kpi">
                        <span>Payé</span>
                        <strong style={{color:'#16A34A'}}>{selected.paid.toLocaleString('fr-FR')} €</strong>
                      </div>
                      <div className="pc-fin-kpi">
                        <span>Solde dû</span>
                        <strong style={{color: (selected.price - selected.paid) > 0 ? '#DC2626':'#16A34A'}}>
                          {Math.max(0, selected.price - selected.paid).toLocaleString('fr-FR')} €
                        </strong>
                      </div>
                    </div>
                    <table className="pc-fin-table">
                      <tbody>
                        <tr><td>Hébergement ({nights(selected.checkIn, selected.checkOut)} nuits)</td><td>{selected.price.toLocaleString('fr-FR')} €</td></tr>
                        <tr><td>Taxe de séjour</td><td>{(nights(selected.checkIn, selected.checkOut) * 2.5).toFixed(2)} €</td></tr>
                        <tr><td>Acompte OTA</td><td style={{color:'#16A34A'}}>- {selected.paid.toLocaleString('fr-FR')} €</td></tr>
                        <tr className="pc-fin-total">
                          <td>Solde à régler</td>
                          <td style={{color: (selected.price + nights(selected.checkIn,selected.checkOut)*2.5 - selected.paid) > 0 ? '#DC2626':'#16A34A'}}>
                            {Math.max(0, selected.price + nights(selected.checkIn,selected.checkOut)*2.5 - selected.paid).toFixed(2)} €
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {panelTab === 'access' && (
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="pc-tab-pane">
                    <div className="pc-iot-card">
                      <div className="pc-iot-header">
                        <Key size={16} color="#7C3AED"/>
                        <span>{ROOMS.find(r => r.id === selected.roomId)?.name}</span>
                        <span className={`pc-iot-status ${selected.hasKey ? 'active' : 'idle'}`}>
                          {selected.hasKey ? 'Code actif' : 'En attente'}
                        </span>
                      </div>
                      {(selected.hasKey || pin) ? (
                        <div className="pc-pin-display">{pin || '••••-••'}</div>
                      ) : (
                        <button className="pc-gen-pin-btn" onClick={genPin}>
                          <Smartphone size={15}/> Générer Code PIN TTLock
                        </button>
                      )}
                      <div className="pc-iot-send-row">
                        <button className="pc-send-btn"><MessageSquare size={13}/> WhatsApp</button>
                        <button className="pc-send-btn">📱 SMS</button>
                        <button className="pc-send-btn"><Mail size={13}/> Email</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Panel footer */}
              <div className="pc-panel-footer">
                <button className="pc-panel-btn-sec">Contacter Client</button>
                <button className="pc-panel-btn-prim">Check-in / Modifier</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CREATE MODAL ════════════════════════════════════ */}
      <AnimatePresence>
        {creating && (
          <div className="pc-modal-overlay" onClick={() => setCreating(false)}>
            <motion.div
              className="pc-modal"
              initial={{ opacity:0, scale:0.96, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96, y:20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="pc-modal-head">
                <div>
                  <h2>Nouvelle Réservation</h2>
                  <p>Ajout manuel — visible immédiatement dans le planning</p>
                </div>
                <button className="pc-close-btn" onClick={() => setCreating(false)}><X size={18}/></button>
              </div>

              <div className="pc-modal-body">
                <div className="pc-form-row">
                  <div className="pc-form-group pc-form-wide">
                    <label>Nom du client <span className="req">*</span></label>
                    <input className="pc-input" value={form.guest} onChange={e=>setForm(f=>({...f,guest:e.target.value}))} placeholder="Ex: Dupont, Marie" autoFocus/>
                  </div>
                  <div className="pc-form-group">
                    <label>Adultes</label>
                    <input className="pc-input" type="number" min="1" max="10" value={form.guests} onChange={e=>setForm(f=>({...f,guests:e.target.value}))} />
                  </div>
                </div>

                <div className="pc-form-row">
                  <div className="pc-form-group">
                    <label>Email</label>
                    <input className="pc-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="client@example.com"/>
                  </div>
                  <div className="pc-form-group">
                    <label>Téléphone</label>
                    <input className="pc-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+33 6 …"/>
                  </div>
                </div>

                <div className="pc-form-row">
                  <div className="pc-form-group">
                    <label>Check-in <span className="req">*</span></label>
                    <input className="pc-input" type="date" value={form.checkIn} onChange={e=>setForm(f=>({...f,checkIn:e.target.value}))}/>
                  </div>
                  <div className="pc-form-group">
                    <label>Check-out <span className="req">*</span></label>
                    <input className="pc-input" type="date" value={form.checkOut} onChange={e=>setForm(f=>({...f,checkOut:e.target.value}))}/>
                  </div>
                </div>

                <div className="pc-form-row">
                  <div className="pc-form-group pc-form-wide">
                    <label>Chambre <span className="req">*</span></label>
                    <select className="pc-input" value={form.roomId} onChange={e=>setForm(f=>({...f,roomId:e.target.value}))}>
                      <option value="">Sélectionnez une chambre…</option>
                      {ROOMS.map(r => <option key={r.id} value={r.id}>Ch. {r.id} — {r.name} ({r.type})</option>)}
                    </select>
                  </div>
                  <div className="pc-form-group">
                    <label>Prix total (€)</label>
                    <input className="pc-input" type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0"/>
                  </div>
                </div>

                <div className="pc-form-row">
                  <div className="pc-form-group">
                    <label>Canal / Source</label>
                    <select className="pc-input" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}>
                      {Object.keys(SOURCE_CFG).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="pc-form-group">
                    <label>Statut</label>
                    <select className="pc-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                      {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pc-form-group">
                  <label>Notes internes</label>
                  <textarea className="pc-input pc-textarea" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Demandes spéciales, préférences, allergies…"/>
                </div>

                {/* Source preview */}
                {form.source && (
                  <div className="pc-form-preview">
                    <SourceBadge source={form.source} size="md"/>
                    <StatusPill status={form.status}/>
                    {form.checkIn && form.checkOut && (
                      <span className="pc-preview-nights">
                        {nights(form.checkIn, form.checkOut)} nuit{nights(form.checkIn,form.checkOut)>1?'s':''}
                        {form.price ? ` · ${parseFloat(form.price).toLocaleString('fr-FR')} €` : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pc-modal-foot">
                <button className="pc-panel-btn-sec" onClick={() => setCreating(false)}>Annuler</button>
                <button
                  className="pc-panel-btn-prim"
                  onClick={submitCreate}
                  disabled={!form.guest.trim() || !form.roomId}
                >
                  <Plus size={15}/> Créer la Réservation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanningCalendar;
