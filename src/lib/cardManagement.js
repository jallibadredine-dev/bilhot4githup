/* ═══════════════════════════════════════════════════════════════════
   CARD MANAGEMENT SERVICE  —  src/lib/cardManagement.js
   ─────────────────────────────────────────────────────────────────
   Hotel RFID/NFC access-card lifecycle management.
   Uses Supabase when tables exist; falls back to localStorage.
   TTHotel/TTLock API calls are stubbed — wired when encoder present.
   ═══════════════════════════════════════════════════════════════════ */

import { supabase, SUPABASE_READY } from './supabase';

/* ── Storage keys (localStorage fallback) ─────────────────────── */
const LS_CARDS  = 'hova_access_cards';
const LS_EVENTS = 'hova_card_events';

/* ── Status enum ─────────────────────────────────────────────── */
export const CARD_STATUS = {
  PENDING:     'pending',
  ACTIVE:      'active',
  EXPIRED:     'expired',
  DEACTIVATED: 'deactivated',
  LOST:        'lost',
};

/* ── Event type enum ─────────────────────────────────────────── */
export const CARD_EVENT = {
  ENCODED:        'encoded',
  ACTIVATED:      'activated',
  DEACTIVATED:    'deactivated',
  EXPIRED:        'expired',
  LOST:           'lost',
  RE_ENCODED:     're-encoded',
  RENEWED:        'renewed',
  ACCESS_GRANTED: 'access_granted',
  ACCESS_DENIED:  'access_denied',
};

/* ══════════════════════════════════════════════════════════════════
   INTERNAL HELPERS
══════════════════════════════════════════════════════════════════ */

const lsGet  = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const lsSave = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/** Detect if Supabase table exists (swallow "relation does not exist") */
const _sbAvailable = async () => {
  if (!SUPABASE_READY || !supabase) return false;
  try {
    const { error } = await supabase.from('access_cards').select('id').limit(1);
    return !error || error.code !== '42P01';
  } catch { return false; }
};

let _sbReady = null; // cached after first check
const sbReady = async () => {
  if (_sbReady === null) _sbReady = await _sbAvailable();
  return _sbReady;
};

const uid = () => crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const now = () => new Date().toISOString();

/* ══════════════════════════════════════════════════════════════════
   CARD CRUD — localStorage layer
══════════════════════════════════════════════════════════════════ */

const _lsGetCards  = () => lsGet(LS_CARDS);
const _lsSaveCards = (cards) => lsSave(LS_CARDS, cards);

const _lsGetEvents  = () => lsGet(LS_EVENTS);
const _lsSaveEvents = (evts) => lsSave(LS_EVENTS, evts);

const _lsAddEvent = (event) => {
  const evts = _lsGetEvents();
  evts.unshift(event);
  _lsSaveEvents(evts.slice(0, 1000));
};

/* ══════════════════════════════════════════════════════════════════
   TTHotel / TTLock API STUBS
   These are called alongside local state changes; they gracefully
   no-op when no credentials or hardware are available.
══════════════════════════════════════════════════════════════════ */

/** Stub: ask TTHotel to encode a card on a specific lock */
const _tthotelEncode = async (lockId, cardData) => {
  const tok = localStorage.getItem('slh_tthotel_token');
  if (!tok || !lockId) return { ok: false, stub: true };
  try {
    const { tthotelAPI } = await import('./tthotel');
    const res = await tthotelAPI.issueGuestCard(tok, lockId, {
      guestName:  cardData.guest_name,
      checkIn:    cardData.activated_at,
      checkOut:   cardData.expires_at,
    });
    return { ok: true, cardUid: res?.cardId || null };
  } catch (err) {
    return { ok: false, error: err.message, stub: true };
  }
};

/** Stub: ask TTHotel to deactivate a card */
const _tthotelDeactivate = async (lockId, cardUid) => {
  const tok = localStorage.getItem('slh_tthotel_token');
  if (!tok || !lockId || !cardUid) return { ok: false, stub: true };
  try {
    const { tthotelAPI } = await import('./tthotel');
    await tthotelAPI.revokeGuestCard(tok, lockId, cardUid);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message, stub: true };
  }
};

/* ══════════════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════════════ */

/**
 * issueCard(data) — create a new card record
 * data: { guest_name, room_id, lock_id?, reservation_id?, guest_id?,
 *         activated_at, expires_at, card_uid?, notes? }
 * Returns the created card object.
 */
export async function issueCard(data) {
  const card = {
    id:             uid(),
    reservation_id: data.reservation_id || null,
    guest_id:       data.guest_id       || null,
    room_id:        data.room_id,
    lock_id:        data.lock_id        || null,
    card_uid:       data.card_uid       || null,
    status:         CARD_STATUS.PENDING,
    encoded_at:     now(),
    activated_at:   data.activated_at   || null,
    expires_at:     data.expires_at     || null,
    guest_name:     data.guest_name     || 'Client',
    notes:          data.notes          || null,
    created_at:     now(),
    updated_at:     now(),
  };

  if (await sbReady()) {
    const { data: row, error } = await supabase.from('access_cards').insert(card).select().single();
    if (!error && row) card.id = row.id;
  } else {
    const cards = _lsGetCards();
    cards.unshift(card);
    _lsSaveCards(cards);
  }

  await logEvent({ card_id: card.id, lock_id: card.lock_id, event_type: CARD_EVENT.ENCODED,
    details: { guest_name: card.guest_name, room_id: card.room_id } });

  // TTHotel API stub — fire-and-forget
  if (card.lock_id) {
    _tthotelEncode(card.lock_id, card).then(res => {
      if (res.ok && res.cardUid) updateCard(card.id, { card_uid: res.cardUid });
    }).catch(() => {});
  }

  return card;
}

/**
 * activateCard(cardId) — mark card active
 */
export async function activateCard(cardId) {
  return _updateStatus(cardId, CARD_STATUS.ACTIVE, CARD_EVENT.ACTIVATED, { activated_at: now() });
}

/**
 * deactivateCard(cardId, reason?) — mark card deactivated
 */
export async function deactivateCard(cardId, reason = '') {
  const card = await getCard(cardId);
  if (card?.lock_id && card?.card_uid) {
    _tthotelDeactivate(card.lock_id, card.card_uid).catch(() => {});
  }
  return _updateStatus(cardId, CARD_STATUS.DEACTIVATED, CARD_EVENT.DEACTIVATED, {}, reason);
}

/**
 * markCardLost(cardId) — mark card as lost
 */
export async function markCardLost(cardId) {
  const card = await getCard(cardId);
  if (card?.lock_id && card?.card_uid) {
    _tthotelDeactivate(card.lock_id, card.card_uid).catch(() => {});
  }
  return _updateStatus(cardId, CARD_STATUS.LOST, CARD_EVENT.LOST);
}

/**
 * reEncodeCard(cardId, newData?) — resets card to pending, creates new UID
 * Returns a new card record (old one is deactivated)
 */
export async function reEncodeCard(cardId, overrides = {}) {
  const old = await getCard(cardId);
  if (!old) throw new Error('Card not found');
  await deactivateCard(cardId, 're-encoded');
  const newCard = await issueCard({ ...old, id: undefined, card_uid: null, ...overrides });
  await logEvent({ card_id: cardId, lock_id: old.lock_id, event_type: CARD_EVENT.RE_ENCODED,
    details: { new_card_id: newCard.id } });
  return newCard;
}

/**
 * renewCard(cardId, newExpiresAt) — extend expiry
 */
export async function renewCard(cardId, newExpiresAt) {
  const updates = { expires_at: newExpiresAt, updated_at: now() };
  await updateCard(cardId, updates);
  await logEvent({ card_id: cardId, event_type: CARD_EVENT.RENEWED, details: { expires_at: newExpiresAt } });
}

/**
 * updateCard(cardId, updates) — partial update on a card
 */
export async function updateCard(cardId, updates) {
  const patch = { ...updates, updated_at: now() };
  if (await sbReady()) {
    await supabase.from('access_cards').update(patch).eq('id', cardId);
  } else {
    const cards = _lsGetCards().map(c => c.id === cardId ? { ...c, ...patch } : c);
    _lsSaveCards(cards);
  }
}

/**
 * autoExpireCards() — mark all cards whose expires_at < now as expired
 * Called by the automation engine on each cycle.
 * Returns count of newly expired cards.
 */
export async function autoExpireCards() {
  const cutoff = new Date().toISOString();
  let count = 0;

  if (await sbReady()) {
    const { data: toExpire } = await supabase
      .from('access_cards')
      .select('id, lock_id, card_uid')
      .in('status', [CARD_STATUS.ACTIVE, CARD_STATUS.PENDING])
      .lt('expires_at', cutoff);

    for (const c of toExpire || []) {
      await supabase.from('access_cards').update({ status: CARD_STATUS.EXPIRED, updated_at: now() }).eq('id', c.id);
      await logEvent({ card_id: c.id, lock_id: c.lock_id, event_type: CARD_EVENT.EXPIRED });
      if (c.lock_id && c.card_uid) _tthotelDeactivate(c.lock_id, c.card_uid).catch(() => {});
      count++;
    }
  } else {
    const cards = _lsGetCards();
    const updated = cards.map(c => {
      if ([CARD_STATUS.ACTIVE, CARD_STATUS.PENDING].includes(c.status) && c.expires_at && c.expires_at < cutoff) {
        logEvent({ card_id: c.id, lock_id: c.lock_id, event_type: CARD_EVENT.EXPIRED });
        if (c.lock_id && c.card_uid) _tthotelDeactivate(c.lock_id, c.card_uid).catch(() => {});
        count++;
        return { ...c, status: CARD_STATUS.EXPIRED, updated_at: now() };
      }
      return c;
    });
    _lsSaveCards(updated);
  }

  return count;
}

/**
 * autoActivateCards() — activate pending cards whose activated_at <= now
 * Returns count of newly activated cards.
 */
export async function autoActivateCards() {
  const cutoff = new Date().toISOString();
  let count = 0;

  if (await sbReady()) {
    const { data: toActivate } = await supabase
      .from('access_cards')
      .select('id')
      .eq('status', CARD_STATUS.PENDING)
      .lte('activated_at', cutoff);

    for (const c of toActivate || []) {
      await supabase.from('access_cards').update({ status: CARD_STATUS.ACTIVE, updated_at: now() }).eq('id', c.id);
      await logEvent({ card_id: c.id, event_type: CARD_EVENT.ACTIVATED });
      count++;
    }
  } else {
    const cards = _lsGetCards().map(c => {
      if (c.status === CARD_STATUS.PENDING && c.activated_at && c.activated_at <= cutoff) {
        logEvent({ card_id: c.id, event_type: CARD_EVENT.ACTIVATED });
        count++;
        return { ...c, status: CARD_STATUS.ACTIVE, updated_at: now() };
      }
      return c;
    });
    _lsSaveCards(cards);
  }

  return count;
}

/* ── READ FUNCTIONS ─────────────────────────────────────────────── */

export async function getAllCards({ status, room_id, limit = 200 } = {}) {
  if (await sbReady()) {
    let q = supabase.from('access_cards').select('*').order('created_at', { ascending: false }).limit(limit);
    if (status)  q = q.eq('status', status);
    if (room_id) q = q.eq('room_id', room_id);
    const { data } = await q;
    return data || [];
  }
  let cards = _lsGetCards();
  if (status)  cards = cards.filter(c => c.status === status);
  if (room_id) cards = cards.filter(c => c.room_id === room_id);
  return cards.slice(0, limit);
}

export async function getCard(cardId) {
  if (await sbReady()) {
    const { data } = await supabase.from('access_cards').select('*').eq('id', cardId).single();
    return data || null;
  }
  return _lsGetCards().find(c => c.id === cardId) || null;
}

export async function getCardsForReservation(reservationId) {
  if (await sbReady()) {
    const { data } = await supabase.from('access_cards').select('*')
      .eq('reservation_id', reservationId).order('created_at', { ascending: false });
    return data || [];
  }
  return _lsGetCards().filter(c => c.reservation_id === reservationId);
}

export async function getCardEvents(cardId) {
  if (await sbReady()) {
    const { data } = await supabase.from('card_events').select('*')
      .eq('card_id', cardId).order('created_at', { ascending: false });
    return data || [];
  }
  return _lsGetEvents().filter(e => e.card_id === cardId);
}

export async function getAllCardEvents({ limit = 100 } = {}) {
  if (await sbReady()) {
    const { data } = await supabase.from('card_events').select('*, access_cards(guest_name, room_id)')
      .order('created_at', { ascending: false }).limit(limit);
    return data || [];
  }
  return _lsGetEvents().slice(0, limit);
}

export async function getCardStats() {
  const cards = await getAllCards();
  return {
    total:       cards.length,
    active:      cards.filter(c => c.status === CARD_STATUS.ACTIVE).length,
    pending:     cards.filter(c => c.status === CARD_STATUS.PENDING).length,
    expired:     cards.filter(c => c.status === CARD_STATUS.EXPIRED).length,
    deactivated: cards.filter(c => c.status === CARD_STATUS.DEACTIVATED).length,
    lost:        cards.filter(c => c.status === CARD_STATUS.LOST).length,
  };
}

/* ── LOGGING ─────────────────────────────────────────────────────── */

export async function logEvent({ card_id, lock_id = null, event_type, performed_by = null, details = {} }) {
  const event = { id: uid(), card_id, lock_id, event_type, performed_by, details, created_at: now() };
  if (await sbReady()) {
    await supabase.from('card_events').insert(event);
  } else {
    _lsAddEvent(event);
  }
  return event;
}

/* ── INTERNAL ───────────────────────────────────────────────────── */

async function _updateStatus(cardId, status, eventType, extraFields = {}, notes = '') {
  await updateCard(cardId, { status, ...extraFields });
  await logEvent({ card_id: cardId, event_type: eventType, details: notes ? { notes } : {} });
}

/* ── DEMO SEED ──────────────────────────────────────────────────── */

export function seedDemoCards() {
  const existing = _lsGetCards();
  if (existing.length > 0) return;
  const today = new Date();
  const fmt = (d) => d.toISOString();
  const d = (days) => { const dt = new Date(today); dt.setDate(dt.getDate() + days); return fmt(dt); };

  const cards = [
    { id: uid(), room_id: '101', guest_name: 'Marie Dupont',   status: 'active',      activated_at: d(-1),  expires_at: d(3),  encoded_at: fmt(today), card_uid: 'A1:B2:C3:D4', lock_id: 'TTH-001', reservation_id: 'RES-001', created_at: fmt(today), updated_at: fmt(today) },
    { id: uid(), room_id: '202', guest_name: 'Robert Chen',    status: 'active',      activated_at: d(-2),  expires_at: d(5),  encoded_at: fmt(today), card_uid: 'E5:F6:G7:H8', lock_id: 'TTH-002', reservation_id: 'RES-002', created_at: fmt(today), updated_at: fmt(today) },
    { id: uid(), room_id: '304', guest_name: 'Sara Martins',   status: 'expired',     activated_at: d(-10), expires_at: d(-2), encoded_at: fmt(today), card_uid: 'I9:J0:K1:L2', lock_id: 'TTH-003', reservation_id: 'RES-003', created_at: fmt(today), updated_at: fmt(today) },
    { id: uid(), room_id: '103', guest_name: 'Ahmed Benzara',  status: 'deactivated', activated_at: d(-5),  expires_at: d(-1), encoded_at: fmt(today), card_uid: 'M3:N4:O5:P6', lock_id: 'TTH-001', reservation_id: 'RES-004', created_at: fmt(today), updated_at: fmt(today) },
    { id: uid(), room_id: '201', guest_name: 'Julie Lambert',  status: 'lost',        activated_at: d(-3),  expires_at: d(2),  encoded_at: fmt(today), card_uid: null,           lock_id: 'TTH-002', reservation_id: 'RES-005', created_at: fmt(today), updated_at: fmt(today) },
    { id: uid(), room_id: '102', guest_name: 'Carlos Reyes',   status: 'pending',     activated_at: d(1),   expires_at: d(7),  encoded_at: fmt(today), card_uid: 'Q7:R8:S9:T0', lock_id: 'TTH-003', reservation_id: 'RES-006', created_at: fmt(today), updated_at: fmt(today) },
  ];
  _lsSaveCards(cards);
}
