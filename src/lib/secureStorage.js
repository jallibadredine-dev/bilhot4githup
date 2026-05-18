/**
 * Auth-gated storage accessor for sensitive credentials.
 *
 * Read methods enforce isAuthenticated() before returning data — preventing
 * stale credential exposure on unauthenticated page loads.
 * clearSensitiveLocalState() purges both localStorage AND sessionStorage on
 * sign-out / no session, closing the residual-token-after-logout gap.
 */
import { isAuthenticated } from './authState';

/* ─── Key registry (used by clearSensitiveLocalState) ─────── */
const SENSITIVE_LS_KEYS = [
  'channex_token',
  'hosflow_checkins',
  'hosflow_police_declarations',
  'beds24_token',
  'beds24_invite_token',
  'hosflow_processed_bookings',
  'hosflow_automation_log',
  'hosflow_property_lock_map',
  'sh_cleaning_status',
  'sh_staff',
  'slh_assignments',
  'slh_tthotel',
  'slh_tthotel_user',
  'slh_tthotel_token',
  'slh_tthotel_refresh',
  'slh_tthotel_devices',
  'slh_tthotel_demo',
  'slh_tuya',
  'slh_tuya_id',
  'slh_tuya_secret',
  'slh_tuya_token',
  'slh_tuya_devices',
  'slh_tuya_demo',
  'slh_tuya_region',
  'ttlock_user',
  'hosflow_notif_config',
  'hosflow_notif_log',
  'hova_inventory_rooms',
  'hova_inventory_buildings',
  'sh_notif_config',
  'sh_notif_log',
  'hova_reservations',
  'hova_access_cards',
  'hova_card_events',
];

/** TTLock uses sessionStorage for its short-lived access token. */
const SENSITIVE_SS_KEYS = ['ttlock_token'];

const SENSITIVE_LS_PREFIXES = ['cm_ota_', 'cm_prods_'];

/* ─── Purge ALL sensitive state (called on sign-out / no session) ─── */
export const clearSensitiveLocalState = () => {
  // localStorage — known keys
  SENSITIVE_LS_KEYS.forEach(key => localStorage.removeItem(key));
  // localStorage — prefix-matched keys (cm_ota_*, cm_prods_*)
  const lsToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && SENSITIVE_LS_PREFIXES.some(p => k.startsWith(p))) lsToRemove.push(k);
  }
  lsToRemove.forEach(k => localStorage.removeItem(k));
  // sessionStorage — TTLock access token and any future session-scoped secrets
  SENSITIVE_SS_KEYS.forEach(key => sessionStorage.removeItem(key));
};

/* ─── Auth-gated accessors ───────────────────────────────────── */
export const secureStorage = {
  /**
   * localStorage: returns stored string only when a session is active.
   * Returns `defaultValue` when unauthenticated, even if the key exists.
   */
  getSensitive(key, defaultValue = null) {
    if (!isAuthenticated()) return defaultValue;
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  },

  /**
   * sessionStorage: same auth-gate pattern for session-scoped secrets
   * (e.g. TTLock access token).
   */
  getSessionSensitive(key, defaultValue = null) {
    if (!isAuthenticated()) return defaultValue;
    const val = sessionStorage.getItem(key);
    return val !== null ? val : defaultValue;
  },

  /** Returns a boolean flag ('1') — false without an active session. */
  getFlag(key) {
    if (!isAuthenticated()) return false;
    return localStorage.getItem(key) === '1';
  },

  /** Parses a JSON value from localStorage — returns `defaultValue` without session or on error. */
  parseJSON(key, defaultValue = null) {
    if (!isAuthenticated()) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setSensitive(key, value)         { localStorage.setItem(key, value); },
  removeSensitive(key)             { localStorage.removeItem(key); },
  setSessionSensitive(key, value)  { sessionStorage.setItem(key, value); },
  removeSessionSensitive(key)      { sessionStorage.removeItem(key); },
};
