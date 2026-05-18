/**
 * Module-level authentication state gate.
 *
 * Provides a synchronous isAuthenticated() guard that other libs can call
 * before reading sensitive data from localStorage, preventing stale token
 * access on unauthenticated page loads (complementary to clearSensitiveLocalState).
 *
 * setAuthState() is called by App.jsx when the Supabase session is confirmed
 * or cleared.
 */
let _authenticated = false;

export function setAuthState(authenticated) {
  _authenticated = Boolean(authenticated);
}

export function isAuthenticated() {
  return _authenticated;
}
