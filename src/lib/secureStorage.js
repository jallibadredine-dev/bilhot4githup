/**
 * Auth-gated storage accessor for sensitive credentials.
 *
 * Read methods enforce isAuthenticated() before returning data — preventing
 * stale credential exposure on unauthenticated page loads.
 *
 * clearSensitiveLocalState() purges CREDENTIAL keys only (API tokens, secrets).
 * Business/operational data (reservations, inventory, etc.) is retained across
 * sessions because it is already protected by the read-time auth gate.
 */
import { isAuthenticated } from './authState';

/* ─── Credential-only purge list ─────────────────────────────
 * These grant access to EXTERNAL SYSTEMS (Channex, Beds24, TTLock,
 * TTHotel, Tuya, EmailJS, Twilio).  They MUST be cleared on sign-out
 * to prevent API impersonation from a shared browser profile.
 * ─────────────────────────────────────────────────────────── */
const CREDENTIAL_LS_KEYS = [
  'channex_token',
  'beds24_token',
  'beds24_invite_token',
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
  'hosflow_notif_config',  // EmailJS service IDs / public key
  'sh_notif_config',       // Twilio SID / token
];

/** OTA credential configs — purge on logout (grant API access to OTAs). */
const CREDENTIAL_LS_PREFIXES = ['cm_ota_'];

/** TTLock uses sessionStorage for its short-lived access token. */
const CREDENTIAL_SS_KEYS = ['ttlock_token'];

/* ─── Purge CREDENTIAL state on sign-out ────────────────────
 * Business/operational data (reservations, inventory, logs, etc.)
 * is NOT purged here — it is protected by the read-time auth gate
 * and should persist across user sessions on the same machine.
 * ─────────────────────────────────────────────────────────── */
export const clearSensitiveLocalState = () => {
  // localStorage — known credential keys
  CREDENTIAL_LS_KEYS.forEach(key => localStorage.removeItem(key));
  // localStorage — prefix-matched OTA credential keys
  const lsToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && CREDENTIAL_LS_PREFIXES.some(p => k.startsWith(p))) lsToRemove.push(k);
  }
  lsToRemove.forEach(k => localStorage.removeItem(k));
  // sessionStorage — TTLock access token
  CREDENTIAL_SS_KEYS.forEach(key => sessionStorage.removeItem(key));
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
