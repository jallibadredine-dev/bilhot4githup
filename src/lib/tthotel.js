/**
 * TTHotel Cloud API — Hotel Lock Management
 * TTHotel is part of the TTLock ecosystem (same OAuth2 server)
 * Docs: https://open.ttlock.com/doc/api
 *
 * Frontend now proxies all TTHotel requests through the backend to avoid CORS errors.
 */

const BASE = '/api/tthotel';
const ENV_CLIENT_ID     = import.meta.env.VITE_TTHOTEL_CLIENT_ID || '';
const ENV_CLIENT_SECRET = import.meta.env.VITE_TTHOTEL_CLIENT_SECRET || '';
const LS_CLIENT_ID      = 'hova_ttlock_client_id';
const LS_CLIENT_SEC     = 'hova_ttlock_client_sec';

const resolveClientId = (id) =>
  id || ENV_CLIENT_ID || (typeof localStorage !== 'undefined' ? localStorage.getItem(LS_CLIENT_ID) : '');

const resolveClientSecret = (secret) =>
  secret || ENV_CLIENT_SECRET || (typeof localStorage !== 'undefined' ? localStorage.getItem(LS_CLIENT_SEC) : '');

const requireAppCredentials = (clientId, clientSecret) => {
  const cid = resolveClientId(clientId);
  const csec = resolveClientSecret(clientSecret);
  if (!cid || !csec) {
    throw new Error('Credentials d\'application TTHotel non configurés. Configurez-les dans Super Admin → Integrations.');
  }
  return { cid, csec };
};

const handleResponse = async (res) => {
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    try { data = JSON.parse(text); } catch { }
  }

  if (!res.ok) {
    const errorMessage = data?.error || data?.errmsg || data?.message || text || `Erreur HTTP ${res.status}`;
    throw new Error(errorMessage);
  }

  if (data !== null) return data;
  if (text) return { raw: text };
  return {};
};

const postJson = async (path, payload) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const tthotelAPI = {
  getToken: async (username, password) => {
    const { cid, csec } = requireAppCredentials();
    const md5 = await import('md5').then(m => m.default || m).catch(() => null);
    const hashedPwd = md5 ? md5(password) : password;
    return postJson('/token', { username, password: hashedPwd, clientId: cid, clientSecret: csec });
  },

  refreshToken: async (refreshToken) => {
    const { cid, csec } = requireAppCredentials();
    return postJson('/refresh', { refreshToken, clientId: cid, clientSecret: csec });
  },

  getLocks: async (accessToken, pageNo = 1, pageSize = 100) => {
    return postJson('/locks', { accessToken, pageNo, pageSize });
  },

  unlock: async (accessToken, lockId) => {
    return postJson('/lock', { accessToken, lockId, action: 'unlock' });
  },

  lock: async (accessToken, lockId) => {
    return postJson('/lock', { accessToken, lockId, action: 'lock' });
  },

  createPasscode: async (accessToken, lockId, { passcode, passcodeName, startDate, endDate, type = 1 }) => {
    return postJson('/keyboardPwd/add', { accessToken, lockId, keyboardPwd: passcode, keyboardPwdName: passcodeName, startDate, endDate, addType: type });
  },

  getLockLogs: async (accessToken, lockId, pageNo = 1) => {
    return postJson('/lockLogs', { accessToken, lockId, pageNo });
  },
};
