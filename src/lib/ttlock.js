/**
 * TTLock / TTHotel Cloud API — Client Layer
 * Docs: https://open.ttlock.com/doc/api
 * Base: https://euapi.ttlock.com (EU server)
 *
 * Authentication: All requests use access_token obtained via OAuth2
 * Credentials: VITE_TTLOCK_CLIENT_ID and VITE_TTLOCK_CLIENT_SECRET env vars
 */

const BASE = import.meta.env.VITE_TTLOCK_API_URL || 'https://euapi.ttlock.com';
// Env-var fallback (set at build time for self-hosted deployments)
const CLIENT_ID     = import.meta.env.VITE_TTLOCK_CLIENT_ID     || '';
const CLIENT_SECRET = import.meta.env.VITE_TTLOCK_CLIENT_SECRET || '';

// App-level credential keys managed by Super Admin → Integrations panel
const LS_CID  = 'hova_ttlock_client_id';
const LS_CSEC = 'hova_ttlock_client_sec';

// Platform defaults — overridable from Super Admin → Integrations → TTLock → Configurer
const DEFAULT_CLIENT_ID  = 'cdcd9c7d1f544d62a66eae63c760587f';
const DEFAULT_CLIENT_SEC = '4b63ca9c66ae1b072a6df38279c55959';

// Seed localStorage so the Super Admin config panel is pre-filled on first open
if (typeof localStorage !== 'undefined') {
  if (!localStorage.getItem(LS_CID))  localStorage.setItem(LS_CID,  DEFAULT_CLIENT_ID);
  if (!localStorage.getItem(LS_CSEC)) localStorage.setItem(LS_CSEC, DEFAULT_CLIENT_SEC);
}

/** Return the active client_id: explicit arg → env var → Super Admin localStorage → built-in default */
const resolveId  = (id)  => id  || CLIENT_ID     || (typeof localStorage !== 'undefined' ? localStorage.getItem(LS_CID)  : '') || DEFAULT_CLIENT_ID;
/** Return the active client_secret: explicit arg → env var → Super Admin localStorage → built-in default */
const resolveSec = (sec) => sec || CLIENT_SECRET || (typeof localStorage !== 'undefined' ? localStorage.getItem(LS_CSEC) : '') || DEFAULT_CLIENT_SEC;

const getDate = () => Date.now();

const buildParams = (params) => {
  const p = new URLSearchParams({ ...params, clientId: resolveId(), date: getDate() });
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
  // clientId / clientSecret: from TTLock Open Platform (https://open.ttlock.com)
  // Fall back to env vars if not provided (for self-hosted / pre-configured setups).
  getToken: async (username, password, clientId, clientSecret) => {
    const cid  = resolveId(clientId);
    const csec = resolveSec(clientSecret);
    if (!cid || !csec) throw new Error('Client ID et Client Secret TTLock non configurés. Contactez votre administrateur.');
    const md5 = await import('md5').then(m => m.default || m).catch(() => null);
    const hashedPwd = md5 ? md5(password) : password;
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cid,
        client_secret: csec,
        grant_type: 'password',
        username,
        password: hashedPwd,
      }),
    });
    return handleResponse(res);
  },

  refreshToken: async (refreshToken, clientId, clientSecret) => {
    const cid  = resolveId(clientId);
    const csec = resolveSec(clientSecret);
    const res = await fetch(`${BASE}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: cid,
        client_secret: csec,
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
