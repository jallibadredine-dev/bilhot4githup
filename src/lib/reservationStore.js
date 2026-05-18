/**
 * HOVA — Shared Reservation Store
 * Source unique des réservations, partagée entre :
 *  - PlanningCalendar  (écriture)
 *  - GuestCRM          (lecture + dérivation clients)
 *  - CheckinManager    (lecture)
 * Persiste dans localStorage : hova_reservations
 */

export const RES_KEY = 'hova_reservations';

/* ─── Source / OTA config ───────────────────────────────── */
export const SOURCE_CFG = {
  'Booking.com': { bg: '#003580', text: '#fff', light: '#EFF6FF', abbr: 'BK', flag: '🏨' },
  'Airbnb':      { bg: '#FF5A5F', text: '#fff', light: '#FFF1F2', abbr: 'AB', flag: '🏠' },
  'Expedia':     { bg: '#FFC72C', text: '#1A1A1A', light: '#FFFBEB', abbr: 'EX', flag: '✈️' },
  'Direct':      { bg: '#16A34A', text: '#fff', light: '#F0FDF4', abbr: 'DR', flag: '📞' },
  'Manuel':      { bg: '#7C3AED', text: '#fff', light: '#F5F3FF', abbr: 'MN', flag: '✏️' },
  'TripAdvisor': { bg: '#00AA6C', text: '#fff', light: '#F0FFF4', abbr: 'TA', flag: '🌿' },
  'Vrbo':        { bg: '#3D5ECC', text: '#fff', light: '#EFF6FF', abbr: 'VR', flag: '🏡' },
};

/* ─── Room map (mirrors PlanningCalendar) ─────────────────── */
export const ROOM_MAP = {
  '101': 'Suite Panorama',
  '102': 'Chambre Standard',
  '103': 'Chambre Standard',
  '201': 'Junior Suite',
  '202': 'Suite Deluxe',
  '304': 'Penthouse VIP',
  '305': 'Chambre Vue Mer',
  '106': 'Suite Jardin',
};

/* ─── Initial seed (mirrors INIT_RESA in PlanningCalendar) ── */
const SEED = [
  { id:'R001', guest:'Chen, Robert',    roomId:'304', checkIn:'2026-05-14', checkOut:'2026-05-18', status:'in-house',    source:'Booking.com', price:1200, paid:600,  guests:2, notes:'VIP — champagne bienvenue.', hasKey:true,  email:'r.chen@mail.com',      phone:'+33 6 11 22 33 44' },
  { id:'R002', guest:'Dupont, Alice',   roomId:'101', checkIn:'2026-05-15', checkOut:'2026-05-17', status:'checked-out', source:'Direct',      price:340,  paid:340,  guests:2, notes:'', hasKey:false, email:'a.dupont@mail.com',    phone:'+33 6 22 33 44 55' },
  { id:'R003', guest:'Martin, Sophie',  roomId:'201', checkIn:'2026-05-12', checkOut:'2026-05-16', status:'checked-out', source:'Airbnb',      price:480,  paid:480,  guests:1, notes:'Early check-out demandé.', hasKey:false, email:'s.martin@mail.com',    phone:'+33 6 33 44 55 66' },
  { id:'R004', guest:'Smith, John',     roomId:'202', checkIn:'2026-05-17', checkOut:'2026-05-20', status:'pending',     source:'Airbnb',      price:520,  paid:0,    guests:3, notes:'', hasKey:false, email:'j.smith@mail.com',     phone:'+44 7 44 55 66 77' },
  { id:'R005', guest:'Müller, Hans',    roomId:'103', checkIn:'2026-05-18', checkOut:'2026-05-23', status:'confirmed',   source:'Expedia',     price:750,  paid:375,  guests:2, notes:'Lit bébé requis.', hasKey:false, email:'h.muller@mail.com',    phone:'+49 6 55 66 77 88' },
  { id:'R006', guest:'Leroy, Emma',     roomId:'305', checkIn:'2026-05-16', checkOut:'2026-05-19', status:'in-house',    source:'Booking.com', price:410,  paid:410,  guests:2, notes:'', hasKey:true,  email:'e.leroy@mail.com',     phone:'+33 6 66 77 88 99' },
  { id:'R007', guest:'Zhang, Wei',      roomId:'201', checkIn:'2026-05-20', checkOut:'2026-05-26', status:'confirmed',   source:'Direct',      price:900,  paid:450,  guests:2, notes:'', hasKey:false, email:'w.zhang@mail.com',     phone:'+86 13 77 88 99 00' },
  { id:'R008', guest:'Leblanc, Paul',   roomId:'102', checkIn:'2026-05-17', checkOut:'2026-05-19', status:'in-house',    source:'Booking.com', price:270,  paid:135,  guests:1, notes:'', hasKey:true,  email:'p.leblanc@mail.com',   phone:'+33 6 88 99 00 11' },
  { id:'R009', guest:'Garcia, Ana',     roomId:'101', checkIn:'2026-05-22', checkOut:'2026-05-28', status:'confirmed',   source:'Airbnb',      price:960,  paid:480,  guests:2, notes:"Anniversaire 25 mai.", hasKey:false, email:'a.garcia@mail.com',    phone:'+34 6 99 00 11 22' },
  { id:'R010', guest:'Kumar, Raj',      roomId:'202', checkIn:'2026-05-21', checkOut:'2026-05-23', status:'confirmed',   source:'Direct',      price:380,  paid:190,  guests:2, notes:'', hasKey:false, email:'r.kumar@mail.com',     phone:'+91 98 00 11 22 33' },
  { id:'R011', guest:'Rossi, Marco',    roomId:'106', checkIn:'2026-05-15', checkOut:'2026-05-18', status:'in-house',    source:'Expedia',     price:420,  paid:420,  guests:2, notes:'', hasKey:true,  email:'m.rossi@mail.com',     phone:'+39 3 11 22 33 44' },
  { id:'R012', guest:'Okafor, Nnamdi',  roomId:'304', checkIn:'2026-05-23', checkOut:'2026-05-27', status:'confirmed',   source:'Booking.com', price:1600, paid:800,  guests:4, notes:'Suite à préparer en avance.', hasKey:false, email:'n.okafor@mail.com',    phone:'+234 80 22 33 44 55' },
  { id:'R013', guest:'Bernstein, Eva',  roomId:'103', checkIn:'2026-05-14', checkOut:'2026-05-17', status:'checked-out', source:'Direct',      price:300,  paid:300,  guests:1, notes:'', hasKey:false, email:'e.bern@mail.com',      phone:'+43 7 33 44 55 66' },
  { id:'R014', guest:'Petit, Claire',   roomId:'305', checkIn:'2026-05-21', checkOut:'2026-05-25', status:'confirmed',   source:'Airbnb',      price:580,  paid:290,  guests:2, notes:'', hasKey:false, email:'c.petit@mail.com',     phone:'+33 6 44 55 66 77' },
  { id:'R015', guest:'Torres, Diego',   roomId:'106', checkIn:'2026-05-19', checkOut:'2026-05-22', status:'confirmed',   source:'Expedia',     price:450,  paid:225,  guests:3, notes:'', hasKey:false, email:'d.torres@mail.com',    phone:'+52 55 55 66 77 88' },
  /* Multi-séjour pour démonstration CRM fidélité */
  { id:'R016', guest:'Chen, Robert',    roomId:'304', checkIn:'2026-03-01', checkOut:'2026-03-05', status:'checked-out', source:'Booking.com', price:980,  paid:980,  guests:2, notes:'Client habituel.', hasKey:false, email:'r.chen@mail.com',      phone:'+33 6 11 22 33 44' },
  { id:'R017', guest:'Chen, Robert',    roomId:'201', checkIn:'2026-01-10', checkOut:'2026-01-13', status:'checked-out', source:'Direct',      price:540,  paid:540,  guests:2, notes:'', hasKey:false, email:'r.chen@mail.com',      phone:'+33 6 11 22 33 44' },
  { id:'R018', guest:'Leroy, Emma',     roomId:'101', checkIn:'2026-02-14', checkOut:'2026-02-17', status:'checked-out', source:'Airbnb',      price:390,  paid:390,  guests:2, notes:'Saint-Valentin.', hasKey:false, email:'e.leroy@mail.com',     phone:'+33 6 66 77 88 99' },
  { id:'R019', guest:'Dupont, Alice',   roomId:'202', checkIn:'2026-04-05', checkOut:'2026-04-08', status:'checked-out', source:'Direct',      price:360,  paid:360,  guests:1, notes:'', hasKey:false, email:'a.dupont@mail.com',    phone:'+33 6 22 33 44 55' },
  { id:'R020', guest:'Zhang, Wei',      roomId:'304', checkIn:'2026-03-20', checkOut:'2026-03-25', status:'checked-out', source:'Booking.com', price:1100, paid:1100, guests:2, notes:'', hasKey:false, email:'w.zhang@mail.com',     phone:'+86 13 77 88 99 00' },
];

/* ─── Storage helpers ────────────────────────────────────── */
const initStore = () => {
  try {
    const raw = localStorage.getItem(RES_KEY);
    if (!raw) {
      localStorage.setItem(RES_KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch { return SEED; }
};

export const getReservations = () => {
  try {
    const raw = localStorage.getItem(RES_KEY);
    if (!raw) return initStore();
    return JSON.parse(raw);
  } catch { return SEED; }
};

export const saveReservations = (list) => {
  try {
    localStorage.setItem(RES_KEY, JSON.stringify(list));
    window.dispatchEvent(new StorageEvent('storage', { key: RES_KEY }));
  } catch {}
};

export const addReservation = (resa) => {
  const list = getReservations();
  const updated = [resa, ...list];
  saveReservations(updated);
  return updated;
};

export const updateReservation = (id, patch) => {
  const list = getReservations().map(r => r.id === id ? { ...r, ...patch } : r);
  saveReservations(list);
  return list;
};

/* ─── Derive CRM guest profiles from reservations ─────────── */
const TODAY_ISO = '2026-05-18';
const TODAY_DATE = new Date(TODAY_ISO + 'T00:00:00');

const parseDate = (s) => new Date(s + 'T00:00:00');

const diffDays = (a) => Math.round((TODAY_DATE - parseDate(a)) / 86400000);

const fmtShort = (iso) => {
  const d = parseDate(iso);
  const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const parseName = (raw) => {
  if (!raw) return { full: 'Inconnu', initials: '?' };
  const parts = raw.split(', ');
  const full = parts.length > 1 ? `${parts[1]} ${parts[0]}` : parts[0];
  const words = full.trim().split(' ');
  const initials = words.map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  return { full, initials };
};

const deriveTier = (visits, totalSpent) => {
  if (visits >= 6 || totalSpent >= 3000) return 'Platinum';
  if (visits >= 4 || totalSpent >= 1500) return 'Gold';
  if (visits >= 2 || totalSpent >= 600)  return 'Silver';
  return 'Bronze';
};

const deriveStatus = (bookings) => {
  if (bookings.some(b => b.status === 'in-house')) return 'Présent';
  const hasFuture = bookings.some(b => parseDate(b.checkIn) > TODAY_DATE);
  if (hasFuture) return 'À venir';
  if (bookings.length >= 3) return 'Loyal';
  return 'Nouveau';
};

const TL_TYPE = {
  'checked-out': 'checkout',
  'in-house':    'checkin',
  'confirmed':   'email',
  'pending':     'email',
};

const TL_TEXT = {
  'checked-out': (b) => `Check-out — ${ROOM_MAP[b.roomId] || b.roomId} · ${b.source} · ${b.price.toLocaleString('fr-FR')} €`,
  'in-house':    (b) => `En séjour — ${ROOM_MAP[b.roomId] || b.roomId} (${fmtShort(b.checkIn)}→${fmtShort(b.checkOut)})`,
  'confirmed':   (b) => `Réservation confirmée via ${b.source} — ${ROOM_MAP[b.roomId] || b.roomId}`,
  'pending':     (b) => `Réservation en attente — ${b.source}`,
};

export const deriveGuestsFromReservations = (reservations) => {
  const grouped = {};
  reservations.forEach(r => {
    const key = (r.email || r.guest || '').toLowerCase().trim();
    if (!key) return;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const guests = Object.entries(grouped).map(([, bookings]) => {
    const sorted = [...bookings].sort((a, b) => parseDate(b.checkIn) - parseDate(a.checkIn));
    const latest = sorted[0];
    const { full: name, initials } = parseName(latest.guest);

    const totalSpent = bookings.reduce((s, b) => s + (Number(b.price) || 0), 0);
    const visits = bookings.length;
    const tier = deriveTier(visits, totalSpent);
    const status = deriveStatus(bookings);

    const daysSinceLast = diffDays(latest.checkIn);
    const score = Math.min(99, Math.round(
      Math.min(visits * 8, 40) +
      Math.min(totalSpent / 80, 35) +
      (daysSinceLast <= 7 ? 25 : daysSinceLast <= 30 ? 15 : daysSinceLast <= 90 ? 5 : 0)
    ));
    const sentiment = score >= 65 ? 'positive' : score >= 40 ? 'neutral' : 'negative';
    const churn = daysSinceLast > 180 ? 'high' : daysSinceLast > 90 ? 'medium' : 'low';
    const nps = score >= 80 ? 9 : score >= 60 ? 7 : score >= 40 ? 5 : 4;
    const probability = Math.min(98, score + 3);

    const upcoming = sorted.filter(b => parseDate(b.checkIn) > TODAY_DATE)
      .sort((a, b) => parseDate(a.checkIn) - parseDate(b.checkIn));
    const nextStay = upcoming.length
      ? `${fmtShort(upcoming[0].checkIn)} ${parseDate(upcoming[0].checkIn).getFullYear()}`
      : '—';

    const lastStayLabel =
      daysSinceLast === 0 ? "Aujourd'hui" :
      daysSinceLast === 1 ? 'Hier' :
      daysSinceLast < 7  ? `Il y a ${daysSinceLast} j.` :
      daysSinceLast < 31 ? `Il y a ${Math.round(daysSinceLast/7)} sem.` :
      `Il y a ${Math.round(daysSinceLast/30)} mois`;

    const room = ROOM_MAP[latest.roomId] || latest.roomId || '—';
    const sources = [...new Set(bookings.map(b => b.source))];
    const tags = [
      ...sources,
      visits >= 5 ? 'Fidèle' : null,
      latest.notes?.includes('VIP') ? 'VIP' : null,
    ].filter(Boolean).slice(0, 5);

    const timeline = sorted.slice(0, 5).map(b => ({
      date: fmtShort(b.checkIn),
      icon: TL_TYPE[b.status] || 'email',
      text: (TL_TEXT[b.status] || TL_TEXT['email'])(b),
    }));

    const crmBookings = sorted.map(b => ({
      id: b.id,
      dates: `${fmtShort(b.checkIn)} – ${fmtShort(b.checkOut)} ${parseDate(b.checkOut).getFullYear()}`,
      room: ROOM_MAP[b.roomId] || b.roomId,
      amount: `${Number(b.price).toLocaleString('fr-FR')} €`,
      source: b.source,
      status:
        b.status === 'in-house'    ? 'inhouse' :
        b.status === 'checked-out' ? 'completed' : 'upcoming',
    }));

    return {
      id: (latest.email || latest.guest || '').toLowerCase(),
      initials,
      name,
      email: latest.email || '',
      phone: latest.phone || '',
      nationality: '—',
      tier,
      status,
      sentiment,
      score,
      totalSpent: `${totalSpent.toLocaleString('fr-FR')} €`,
      visits,
      lastStay: lastStayLabel,
      nextStay,
      room,
      wallet: '0,00 €',
      points: Math.floor(totalSpent / 10),
      probability,
      tags,
      churn,
      nps,
      timeline,
      bookings: crmBookings,
      sources,
      _raw: latest,
    };
  });

  return guests.sort((a, b) => b.score - a.score);
};

/* ─── Init store if empty ────────────────────────────────── */
initStore();
