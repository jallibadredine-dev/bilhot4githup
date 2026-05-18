import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, User, CreditCard, Key,
  Phone, Mail, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  LogOut, Filter, Search, Smartphone, Globe2, Zap, Star, BedDouble,
  Users, ArrowRight, RefreshCw, Building2, MoreHorizontal, Trash2
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

/* ─── MINI CALENDAR ──────────────────────────────────────── */
const MiniCal = ({ checkIn, checkOut }) => {
  const DAY_LBL = ['L','M','M','J','V','S','D'];
  const ci = parseDate(checkIn);
  const year = ci.getFullYear(), month = ci.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const getWeek = d => {
    const dt = new Date(d); dt.setHours(0,0,0,0);
    dt.setDate(dt.getDate() + 3 - (dt.getDay() + 6) % 7);
    const w1 = new Date(dt.getFullYear(), 0, 4);
    return 1 + Math.round(((dt.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  };
  const fmtD = d => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => { const d = i - firstDow + 1; return d >= 1 && d <= daysInMonth ? d : null; });
  const rows = [];
  for (let r = 0; r < totalCells / 7; r++) {
    const dayCells = cells.slice(r * 7, r * 7 + 7);
    if (dayCells.every(c => c === null)) continue;
    const firstReal = dayCells.find(c => c !== null);
    rows.push({ weekNum: getWeek(new Date(year, month, firstReal)), days: dayCells });
  }
  return (
    <div className="pc-mini-cal">
      <div className="pc-mini-cal-month">{new Date(year,month).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</div>
      <div className="pc-mini-cal-head">
        <span className="pc-mini-cal-wk-lbl"/>
        {DAY_LBL.map((d,i) => <span key={i} className="pc-mini-cal-dn">{d}</span>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="pc-mini-cal-row">
          <span className="pc-mini-cal-wk-lbl">{row.weekNum}</span>
          {row.days.map((d, ci) => {
            if (!d) return <span key={ci} className="pc-mini-cal-cell pc-mini-cal-empty"/>;
            const iso = fmtD(d);
            const isStart = iso === checkIn, isEnd = iso === checkOut;
            const inRange = iso > checkIn && iso < checkOut;
            return (
              <span key={ci} className={['pc-mini-cal-cell', isStart&&'pc-mini-cal-start', isEnd&&'pc-mini-cal-end', inRange&&'pc-mini-cal-in-range'].filter(Boolean).join(' ')}>
                {d}
              </span>
            );
          })}
        </div>
      ))}
    </div>
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
  const [createStep, setCreateStep] = useState(1);
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
    firstName:'', lastName:'', email:'', phone:'', roomId:'',
    checkIn: fmtISO(TODAY), checkOut: fmtISO(addDays(TODAY,2)),
    source:'Direct', status:'confirmed', price:'', notes:'', guests:'2',
    pricingPlan:'default', mealPlan:'none', guestPays:'',
    company:'', resaType:'', amenities:'', floor:'',
    roomCount:1, pricingType:'custom', samePriceAll:true,
    pricePerDay:'50', adults:1, children:0,
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
    const guestName = [form.firstName, form.lastName].filter(Boolean).join(', ') || '';
    if (!guestName.trim() || !form.roomId) return;
    const totalPrice = parseFloat(form.price) || parseFloat(form.pricePerDay || 0) * nights(form.checkIn, form.checkOut);
    const newR = {
      id: `R${String(reservas.length + 1).padStart(3,'0')}`,
      ...form,
      guest: guestName,
      price: totalPrice,
      paid: 0,
      guests: (form.adults || 1) + (form.children || 0),
      hasKey: false,
    };
    upsertResa(newR);
    persistReservation(newR);
    setCreating(false);
    setCreateStep(1);
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

      {/* CREATE MODAL */}
      <AnimatePresence>
        {creating && (
          <div className="pc-modal-overlay" onClick={()=>{setCreating(false);setCreateStep(1);}}>
            <motion.div
              className="pc-modal pc-modal-lg"
              initial={{opacity:0,scale:0.97,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.97,y:16}}
              transition={{duration:0.2}}
              onClick={e=>e.stopPropagation()}
            >
              {/* Header */}
              <div className="pc-modal-head">
                <div>
                  <h2>Nouvelle Réservation <span className="pc-step-badge">Étape {createStep} de 2</span></h2>
                  <p>{createStep===1?'Détails du séjour — configuration du logement et des tarifs':'Coordonnées du client & finalisation'}</p>
                </div>
                <div className="pc-step-progress">
                  {[1,2].map(s=>(
                    <React.Fragment key={s}>
                      <div className={`pc-step-dot${createStep>=s?' active':''}`}>{s}</div>
                      {s<2&&<div className={`pc-step-line${createStep>=2?' active':''}`}/>}
                    </React.Fragment>
                  ))}
                </div>
                <button className="pc-close-btn" onClick={()=>{setCreating(false);setCreateStep(1);}}><X size={18}/></button>
              </div>

              {/* Body */}
              <div className="pc-modal-body pc-modal-split">

                {/* LEFT MAIN */}
                <div className="pc-modal-main">

                  {createStep===1&&(<>
                    {/* Row 1 — 5 columns */}
                    <div className="pc-form-row-top5">
                      <div className="pc-form-group pc-fg-dates">
                        <label>Plage de dates</label>
                        <div className="pc-date-pair">
                          <Calendar size={13} className="pc-date-pair-icon"/>
                          <input type="date" className="pc-input pc-input-date" value={form.checkIn} onChange={e=>setForm(f=>({...f,checkIn:e.target.value}))}/>
                          <span className="pc-date-sep">–</span>
                          <input type="date" className="pc-input pc-input-date" value={form.checkOut} onChange={e=>setForm(f=>({...f,checkOut:e.target.value}))}/>
                        </div>
                      </div>
                      <div className="pc-form-group">
                        <label>Plan tarifaire</label>
                        <select className="pc-input" value={form.pricingPlan} onChange={e=>setForm(f=>({...f,pricingPlan:e.target.value}))}>
                          <option value="default">Default prices</option>
                          <option value="weekend">Weekend</option>
                          <option value="season">Haute saison</option>
                          <option value="promo">Promo</option>
                        </select>
                      </div>
                      <div className="pc-form-group">
                        <label>Premier repas</label>
                        <select className="pc-input" value={form.mealPlan} onChange={e=>setForm(f=>({...f,mealPlan:e.target.value}))}>
                          <option value="none">Aucune</option>
                          <option value="breakfast">Petit-déjeuner</option>
                          <option value="halfboard">Demi-pension</option>
                          <option value="fullboard">Pension complète</option>
                        </select>
                      </div>
                      <div className="pc-form-group">
                        <label>L'invité paie</label>
                        <select className="pc-input" value={form.guestPays} onChange={e=>setForm(f=>({...f,guestPays:e.target.value}))}>
                          <option value="">Sélectionner…</option>
                          <option value="now">Maintenant</option>
                          <option value="arrival">À l'arrivée</option>
                          <option value="checkout">Au départ</option>
                        </select>
                      </div>
                      <div className="pc-form-group">
                        <label>Canaux de vente</label>
                        <select className="pc-input" value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))}>
                          {Object.keys(SOURCE_CFG).map(s=><option key={s} value={s}>{s}</option>)}
                          <option value="Private">Private reserva…</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2 — Name */}
                    <div className="pc-form-row">
                      <div className="pc-form-group">
                        <label>Prénom</label>
                        <input className="pc-input" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))} placeholder="Prénom" autoFocus/>
                      </div>
                      <div className="pc-form-group">
                        <label>Nom de famille</label>
                        <input className="pc-input" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))} placeholder="Nom de famille"/>
                      </div>
                    </div>

                    {/* Row 3 — Company / Type / Status */}
                    <div className="pc-form-row-3">
                      <div className="pc-form-group">
                        <label>Entreprise</label>
                        <select className="pc-input" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}>
                          <option value="">Aucune</option>
                          <option value="corp1">Corporate A</option>
                          <option value="corp2">Corporate B</option>
                        </select>
                      </div>
                      <div className="pc-form-group">
                        <label>Type de réservation</label>
                        <input className="pc-input" value={form.resaType} onChange={e=>setForm(f=>({...f,resaType:e.target.value}))} placeholder="Type de réservation"/>
                      </div>
                      <div className="pc-form-group">
                        <label>État</label>
                        <select className="pc-input" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                          {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Row 4 — Filters + Mini Calendar */}
                    <div className="pc-cal-row">
                      <div className="pc-cal-row-left">
                        <div className="pc-form-row">
                          <div className="pc-form-group">
                            <label>Commodités</label>
                            <select className="pc-input" value={form.amenities} onChange={e=>setForm(f=>({...f,amenities:e.target.value}))}>
                              <option value="">Sélect…</option>
                              <option value="wifi">Wi-Fi</option>
                              <option value="parking">Parking</option>
                              <option value="pool">Piscine</option>
                              <option value="spa">Spa</option>
                            </select>
                          </div>
                          <div className="pc-form-group">
                            <label>Sols</label>
                            <select className="pc-input" value={form.floor} onChange={e=>setForm(f=>({...f,floor:e.target.value}))}>
                              <option value="">Sélect…</option>
                              <option value="0">Rez-de-chaussée</option>
                              <option value="1">1er étage</option>
                              <option value="2">2ème étage</option>
                              <option value="3">3ème étage</option>
                            </select>
                          </div>
                        </div>
                        <div className="pc-form-group">
                          <label>Chambre <span className="req">*</span></label>
                          <select className="pc-input" value={form.roomId} onChange={e=>setForm(f=>({...f,roomId:e.target.value}))}>
                            <option value="">Sélectionnez une chambre…</option>
                            {ROOMS.map(r=><option key={r.id} value={r.id}>Ch.{r.id} — {r.name} ({r.type})</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="pc-cal-row-right">
                        <MiniCal checkIn={form.checkIn} checkOut={form.checkOut}/>
                      </div>
                    </div>

                    {/* Row 5 — Room count + Tarification */}
                    <div className="pc-form-row">
                      <div className="pc-form-group">
                        <label>Nombre de chambres</label>
                        <div className="pc-counter">
                          <button className="pc-counter-btn" type="button" onClick={()=>setForm(f=>({...f,roomCount:Math.max(1,f.roomCount-1)}))}>−</button>
                          <span className="pc-counter-val">{form.roomCount}</span>
                          <button className="pc-counter-btn" type="button" onClick={()=>setForm(f=>({...f,roomCount:f.roomCount+1}))}>+</button>
                        </div>
                      </div>
                      <div className="pc-form-group">
                        <label>Type de tarification</label>
                        <select className="pc-input" value={form.pricingType} onChange={e=>setForm(f=>({...f,pricingType:e.target.value}))}>
                          <option value="custom">Personnalisé</option>
                          <option value="standard">Standard</option>
                          <option value="promo">Promo</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 6 — Toggle + Prices */}
                    <div className="pc-price-row">
                      <label className="pc-toggle-label">
                        <div className={`pc-toggle${form.samePriceAll?' on':''}`} onClick={()=>setForm(f=>({...f,samePriceAll:!f.samePriceAll}))}>
                          <div className="pc-toggle-thumb"/>
                        </div>
                        <span>Même prix pour toutes les chambres</span>
                      </label>
                      <div className="pc-price-inputs">
                        <div className="pc-form-group">
                          <label>Prix par jour</label>
                          <input className="pc-input" type="number" min="0" value={form.pricePerDay}
                            onChange={e=>{const ppd=e.target.value;const n=nights(form.checkIn,form.checkOut);setForm(f=>({...f,pricePerDay:ppd,price:String(parseFloat(ppd||0)*n)}));}}
                            placeholder="0"/>
                        </div>
                        <div className="pc-form-group">
                          <label>Prix total</label>
                          <input className="pc-input" type="number" min="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0"/>
                        </div>
                      </div>
                    </div>

                    {/* Row 7 — Clients */}
                    <div className="pc-guests-row">
                      <span className="pc-guests-count">{form.adults+form.children}</span>
                      <span className="pc-guests-label">Clients</span>
                      <div className="pc-guests-breakdown">
                        <span>Adultes {form.adults}</span>
                        <input type="range" min="1" max="10" value={form.adults} onChange={e=>setForm(f=>({...f,adults:parseInt(e.target.value)}))} className="pc-range"/>
                      </div>
                      <div className="pc-guests-breakdown">
                        <span>Enfants {form.children}</span>
                        <input type="range" min="0" max="6" value={form.children} onChange={e=>setForm(f=>({...f,children:parseInt(e.target.value)}))} className="pc-range"/>
                      </div>
                    </div>
                  </>)}

                  {createStep===2&&(<>
                    <div className="pc-step2-recap">
                      <div className="pc-recap-title">Récapitulatif du séjour</div>
                      <div className="pc-recap-grid">
                        <div className="pc-recap-item"><span className="pc-recap-lbl">Client</span><span className="pc-recap-val">{[form.firstName,form.lastName].filter(Boolean).join(' ')||'—'}</span></div>
                        <div className="pc-recap-item"><span className="pc-recap-lbl">Chambre</span><span className="pc-recap-val">{ROOMS.find(r=>r.id===form.roomId)?.name||'—'}</span></div>
                        <div className="pc-recap-item"><span className="pc-recap-lbl">Séjour</span><span className="pc-recap-val">{form.checkIn} → {form.checkOut} · {nights(form.checkIn,form.checkOut)} nuit{nights(form.checkIn,form.checkOut)>1?'s':''}</span></div>
                        <div className="pc-recap-item"><span className="pc-recap-lbl">Prix total</span><span className="pc-recap-val">{parseFloat(form.price||0).toLocaleString('fr-FR')} €</span></div>
                      </div>
                    </div>
                    <div className="pc-form-row">
                      <div className="pc-form-group">
                        <label>Email</label>
                        <input className="pc-input" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="client@example.com" autoFocus/>
                      </div>
                      <div className="pc-form-group">
                        <label>Téléphone</label>
                        <input className="pc-input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+33 6 …"/>
                      </div>
                    </div>
                    <div className="pc-form-group">
                      <label>Notes internes</label>
                      <textarea className="pc-input pc-textarea" rows={3} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Demandes spéciales, préférences, allergies…"/>
                    </div>
                    {form.source&&(
                      <div className="pc-form-preview">
                        <SourceBadge source={form.source} size="md"/>
                        <StatusPill status={form.status}/>
                        {form.checkIn&&form.checkOut&&(
                          <span className="pc-preview-nights">
                            {nights(form.checkIn,form.checkOut)} nuit{nights(form.checkIn,form.checkOut)>1?'s':''}
                            {form.price?` · ${parseFloat(form.price).toLocaleString('fr-FR')} €`:''}
                          </span>
                        )}
                      </div>
                    )}
                  </>)}
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="pc-modal-side">
                  <div className="pc-side-title">Chambres sélectionnées</div>
                  {form.roomId?(()=>{
                    const room=ROOMS.find(r=>r.id===form.roomId);
                    const total=parseFloat(form.price)||parseFloat(form.pricePerDay||0)*nights(form.checkIn,form.checkOut);
                    return(
                      <div className="pc-sel-room-card">
                        <div className="pc-sel-room-top">
                          <button className="pc-sel-room-del" onClick={()=>setForm(f=>({...f,roomId:''}))}>
                            <Trash2 size={13}/>
                          </button>
                          <div className="pc-sel-room-badge"><BedDouble size={13}/> {form.roomCount}</div>
                          <div className="pc-sel-room-price">{total.toLocaleString('fr-FR',{minimumFractionDigits:2})} EUR</div>
                        </div>
                        <div className="pc-sel-room-name">{room?.name||`Ch. ${form.roomId}`}</div>
                        <div className="pc-sel-room-meta">{nights(form.checkIn,form.checkOut)} nuit{nights(form.checkIn,form.checkOut)>1?'s':''} · {room?.type||''}</div>
                        <div className="pc-sel-room-avail"><span className="pc-avail-dot"/> Disponible · 1 Votre réservation</div>
                      </div>
                    );
                  })():(
                    <div className="pc-sel-room-empty">
                      <BedDouble size={28} style={{color:'#CBD5E1',marginBottom:8}}/>
                      <p>Sélectionnez une chambre dans le formulaire</p>
                    </div>
                  )}
                  {form.roomId&&form.checkIn&&form.checkOut&&(
                    <div className="pc-side-summary">
                      <div className="pc-side-sum-row"><span>Arrivée</span><span>{new Date(form.checkIn+'T00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</span></div>
                      <div className="pc-side-sum-row"><span>Départ</span><span>{new Date(form.checkOut+'T00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}</span></div>
                      <div className="pc-side-sum-row"><span>Durée</span><span>{nights(form.checkIn,form.checkOut)} nuit{nights(form.checkIn,form.checkOut)>1?'s':''}</span></div>
                      <div className="pc-side-sum-row"><span>Clients</span><span>{form.adults} adulte{form.adults>1?'s':''}{form.children>0?` + ${form.children} enfant${form.children>1?'s':''}`:''}
                      </span></div>
                      <div className="pc-side-sum-row pc-side-sum-total"><span>Total</span><span>{parseFloat(form.price||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} €</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pc-modal-foot">
                <button className="pc-panel-btn-sec" onClick={()=>{setCreating(false);setCreateStep(1);}}>Annuler</button>
                {createStep===1?(
                  <button className="pc-panel-btn-prim" onClick={()=>setCreateStep(2)}>
                    Suivant <ArrowRight size={14}/>
                  </button>
                ):(
                  <>
                    <button className="pc-panel-btn-sec" style={{marginLeft:'auto'}} onClick={()=>setCreateStep(1)}>← Retour</button>
                    <button className="pc-panel-btn-prim" onClick={submitCreate} disabled={!form.roomId||(!form.firstName?.trim()&&!form.lastName?.trim())}>
                      <Plus size={15}/> Ajouter
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanningCalendar;
