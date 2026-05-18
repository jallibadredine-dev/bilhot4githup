/**
 * Auth-gated localStorage accessor for sensitive credentials.
 *
 * Read methods enforce isAuthenticated() before returning data — preventing
 * stale credential exposure on unauthenticated page loads.
 * clearSensitiveLocalState() removes all sensitive keys on sign-out / no session.
 */
import { isAuthenticated } from './authState';

/* ─── Key registry (used by clearSensitiveLocalState) ─────── */
const SENSITIVE_STORAGE_KEYS = [
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
];

const SENSITIVE_KEY_PREFIXES = [
  'cm_ota_',
  'cm_prods_',
];

/* ─── Purge all sensitive state (called on sign-out / no session) ─── */
export const clearSensitiveLocalState = () => {
  SENSITIVE_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && SENSITIVE_KEY_PREFIXES.some(prefix => k.startsWith(prefix))) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
};

/* ─── Auth-gated accessors ───────────────────────────────────── */
export const secureStorage = {
  /**
   * Returns the stored string value only when a session is active.
   * Returns `defaultValue` (null) when unauthenticated, even if the key exists.
   */
  getSensitive(key, defaultValue = null) {
    if (!isAuthenticated()) return defaultValue;
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  },

  /** Returns a boolean flag ('1') — false without an active session. */
  getFlag(key) {
    if (!isAuthenticated()) return false;
    return localStorage.getItem(key) === '1';
  },

  /** Parses a JSON value — returns `defaultValue` without session or on error. */
  parseJSON(key, defaultValue = null) {
    if (!isAuthenticated()) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setSensitive(key, value)  { localStorage.setItem(key, value); },
  removeSensitive(key)      { localStorage.removeItem(key); },
};
