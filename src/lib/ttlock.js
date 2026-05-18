/**
 * TTLock / TTHotel Cloud API — Client Layer
 * Docs: https://open.ttlock.com/doc/api
 * Base: https://euapi.ttlock.com (EU server)
 *
 * Authentication: All requests use access_token obtained via OAuth2
 * Credentials: VITE_TTLOCK_CLIENT_ID and VITE_TTLOCK_CLIENT_SECRET env vars
 */

const BASE = import.meta.env.VITE_TTLOCK_API_URL || 'https://euapi.ttlock.com';
const CLIENT_ID = import.meta.env.VITE_TTLOCK_CLIENT_ID || '';
const CLIENT_SECRET = import.meta.env.VITE_TTLOCK_CLIENT_SECRET || '';

const getDate = () => Date.now();

const buildParams = (params) => {
  const p = new URLSearchParams({ ...params, clientId: CLIENT_ID, date: getDate() });
  return p.toString();
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(data.errmsg || `TTLock Error ${data.errcode}`);
  }
  return data;
};

export const ttlockAPI = {
  // ── AUTH ─────────────────────────────────────────────────────────────────────
  getToken: async (username, password) => {
    const md5 = await import('md5').then(m => m.default || m).catch(() => null);
    const hashedPwd = md5 ? md5(password) : password;
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'password',
        username,
        password: hashedPwd,
      }),
    });
    return handleResponse(res);
  },

  refreshToken: async (refreshToken) => {
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    return handleResponse(res);
  },

  // ── LOCKS ────────────────────────────────────────────────────────────────────
  getLocks: async (accessToken, pageNo = 1, pageSize = 50) => {
    const res = await fetch(
      `${BASE}/v3/lock/list?${buildParams({ accessToken, pageNo, pageSize })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  getLockDetail: async (accessToken, lockId) => {
    const res = await fetch(
      `${BASE}/v3/lock/detail?${buildParams({ accessToken, lockId })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  // ── LOCK / UNLOCK ─────────────────────────────────────────────────────────────
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

  getLockState: async (accessToken, lockId) => {
    const res = await fetch(
      `${BASE}/v3/lock/queryOpenState?${buildParams({ accessToken, lockId })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  // ── PASSCODES ────────────────────────────────────────────────────────────────
  createPasscode: async (accessToken, lockId, { passcode, passcodeName, startDate, endDate, type = 1 }) => {
    // type: 1=custom, 3=recurring, 4=one-time
    const res = await fetch(`${BASE}/v3/keyboardPwd/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId, keyboardPwd: passcode, keyboardPwdName: passcodeName, startDate, endDate, addType: type }),
    });
    return handleResponse(res);
  },

  getPasscodes: async (accessToken, lockId, pageNo = 1, pageSize = 50) => {
    const res = await fetch(
      `${BASE}/v3/keyboardPwd/list?${buildParams({ accessToken, lockId, pageNo, pageSize })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  deletePasscode: async (accessToken, lockId, keyboardPwdId) => {
    const res = await fetch(`${BASE}/v3/keyboardPwd/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId, keyboardPwdId }),
    });
    return handleResponse(res);
  },

  // ── CARD ACCESS ──────────────────────────────────────────────────────────────
  getCards: async (accessToken, lockId, pageNo = 1) => {
    const res = await fetch(
      `${BASE}/v3/identityCard/list?${buildParams({ accessToken, lockId, pageNo, pageSize: 50 })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  // ── ACCESS LOGS ──────────────────────────────────────────────────────────────
  getLockLogs: async (accessToken, lockId, pageNo = 1) => {
    const res = await fetch(
      `${BASE}/v3/lockRecord/list?${buildParams({ accessToken, lockId, pageNo, pageSize: 20 })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  // ── BATTERY ──────────────────────────────────────────────────────────────────
  getBatteryLevel: async (accessToken, lockId) => {
    const res = await fetch(
      `${BASE}/v3/lock/queryElectricQuantity?${buildParams({ accessToken, lockId })}`,
      { method: 'GET' }
    );
    return handleResponse(res);
  },

  // ── REMOTE CONFIG ────────────────────────────────────────────────────────────
  setAutoLock: async (accessToken, lockId, seconds) => {
    const res = await fetch(`${BASE}/v3/lock/setAutoLock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId, seconds }),
    });
    return handleResponse(res);
  },

  setPassageMode: async (accessToken, lockId, enabled) => {
    const res = await fetch(`${BASE}/v3/lock/setPassageMode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: buildParams({ accessToken, lockId, passageMode: enabled ? 1 : 0 }),
    });
    return handleResponse(res);
  },
};
