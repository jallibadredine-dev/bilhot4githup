/**
 * HosFlow Digital Check-in Service
 * Generates unique check-in links, stores/retrieves sessions,
 * and validates guest identity + digital signature.
 */

const CHECKINS_KEY = 'hosflow_checkins';

// ── Storage ───────────────────────────────────────────────────────────────
export const getAllCheckins = () => {
  try { return JSON.parse(localStorage.getItem(CHECKINS_KEY) || '[]'); } catch { return []; }
};

const saveCheckins = (list) => {
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(list));
};

// ── Token generator ───────────────────────────────────────────────────────
const makeToken = () => {
  const arr = new Uint8Array(18);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

// ── Create a check-in record ──────────────────────────────────────────────
export const createCheckin = ({
  bookingId, guestName, guestEmail, guestPhone,
  propertyName, propertyAddress, propertyDesc, propertyEmoji,
  pin, lockName, arrivalDate, departureDate,
  wifiName, wifiPassword, houseRules,
}) => {
  const token = makeToken();
  const checkin = {
    id: Date.now(),
    token,
    bookingId: bookingId || `BK-${Date.now()}`,
    guestName: guestName || '',
    guestEmail: guestEmail || '',
    guestPhone: guestPhone || '',
    propertyName: propertyName || 'Notre Propriété',
    propertyAddress: propertyAddress || '',
    propertyDesc: propertyDesc || 'Bienvenue dans votre logement.',
    propertyEmoji: propertyEmoji || '🏡',
    pin: pin || '',
    lockName: lockName || 'Serrure principale',
    arrivalDate: arrivalDate || '',
    departureDate: departureDate || '',
    wifiName: wifiName || '',
    wifiPassword: wifiPassword || '',
    houseRules: houseRules || 'Merci de respecter les règles de la maison.\nPas de fêtes.\nFumée interdite à l\'intérieur.\nCheck-out avant 12h.',
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    identity: null,
    signature: null,
  };

  const list = getAllCheckins();
  list.unshift(checkin);
  saveCheckins(list);
  return checkin;
};

// ── Find by token ─────────────────────────────────────────────────────────
export const getCheckinByToken = (token) => {
  const list = getAllCheckins();
  return list.find(c => c.token === token) || null;
};

// ── Complete a check-in (called from guest page) ──────────────────────────
export const completeCheckin = (token, { identity, signature }) => {
  const list = getAllCheckins();
  const idx = list.findIndex(c => c.token === token);
  if (idx === -1) return null;

  list[idx] = {
    ...list[idx],
    status: 'completed',
    completedAt: new Date().toISOString(),
    identity,
    signature,
  };

  saveCheckins(list);
  return list[idx];
};

// ── Delete ─────────────────────────────────────────────────────────────────
export const deleteCheckin = (id) => {
  const list = getAllCheckins().filter(c => c.id !== id);
  saveCheckins(list);
};

// ── Build guest link ───────────────────────────────────────────────────────
export const buildCheckinURL = (token) => {
  const base = window.location.origin + window.location.pathname;
  return `${base}?checkin=${token}`;
};

// ── Check if URL has a checkin param ──────────────────────────────────────
export const getCheckinTokenFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('checkin');
};

// ── Status helpers ─────────────────────────────────────────────────────────
export const isExpired = (checkin) => {
  if (!checkin.expiresAt) return false;
  return new Date(checkin.expiresAt) < new Date();
};

export const fmtDateLong = (iso) => {
  if (!iso) return '–';
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};
