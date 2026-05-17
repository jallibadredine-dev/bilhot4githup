/**
 * TTHotel Cloud API — Hotel Lock Management
 * TTHotel is part of the TTLock ecosystem (same OAuth2 server)
 * Docs: https://open.ttlock.com/doc/api
 *
 * The user logs in with their TTHotel account email + password.
 * Client credentials below are the registered TTHotel developer app.
 * Override via: VITE_TTHOTEL_CLIENT_ID / VITE_TTHOTEL_CLIENT_SECRET
 */

const BASE = import.meta.env.VITE_TTHOTEL_API_URL || 'https://euapi.ttlock.com';
const CLIENT_ID     = import.meta.env.VITE_TTHOTEL_CLIENT_ID     || '8754dc08eaad4c76877674e762b1b43d';
const CLIENT_SECRET = import.meta.env.VITE_TTHOTEL_CLIENT_SECRET  || '30d4e5a1e244ac0b7cbcba10a7c091b9';

const buildParams = (params) =>
  new URLSearchParams({ ...params, clientId: CLIENT_ID, date: Date.now() }).toString();

const handleResponse = async (res) => {
  let data;
  try { data = await res.json(); } catch { throw new Error('Réponse serveur invalide'); }
  if (data.errcode && data.errcode !== 0) throw new Error(data.errmsg || `Erreur TTHotel ${data.errcode}`);
  return data;
};

export const tthotelAPI = {

  /* ── AUTH ─────────────────────────────────────────────── */
  getToken: async (username, password) => {
    const md5 = await import('md5').then(m => m.default || m).catch(() => null);
    const hashedPwd = md5 ? md5(password) : password;
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type:    'password',
        username,
        password:      hashedPwd,
      }),
    });
    return handleResponse(res);
  },

  refreshToken: async (refreshToken) => {
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    return handleResponse(res);
  },

  /* ── DEVICES ──────────────────────────────────────────── */
  getLocks: async (accessToken, pageNo = 1, pageSize = 100) => {
    const res = await fetch(
      `${BASE}/v3/lock/list?${buildParams({ accessToken, pageNo, pageSize })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  /* ── LOCK / UNLOCK ────────────────────────────────────── */
  unlock: async (accessToken, lockId) => {
    const res = await fetch(`${BASE}/v3/lock/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId }),
    });
    return handleResponse(res);
  },

  lock: async (accessToken, lockId) => {
    const res = await fetch(`${BASE}/v3/lock/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId }),
    });
    return handleResponse(res);
  },

  /* ── PASSCODES ────────────────────────────────────────── */
  createPasscode: async (accessToken, lockId, { passcode, passcodeName, startDate, endDate, type = 1 }) => {
    const res = await fetch(`${BASE}/v3/keyboardPwd/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId, keyboardPwd: passcode, keyboardPwdName: passcodeName, startDate, endDate, addType: type }),
    });
    return handleResponse(res);
  },

  /* ── LOGS ─────────────────────────────────────────────── */
  getLockLogs: async (accessToken, lockId, pageNo = 1) => {
    const res = await fetch(
      `${BASE}/v3/lockRecord/list?${buildParams({ accessToken, lockId, pageNo, pageSize: 20 })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },
};
