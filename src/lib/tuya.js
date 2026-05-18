/**
 * Tuya IoT Platform Cloud API
 * Docs: https://developer.tuya.com/en/docs/cloud
 *
 * Setup (one-time):
 *   1. Create a free account at iot.tuya.com
 *   2. Create a Cloud Project → get Client ID + Client Secret
 *   3. Link your Smart Life app devices to the project
 *   4. Paste Client ID + Secret in the SmartLockHub connection form
 *
 * Authentication: HMAC-SHA256 signed requests (no MD5, no external deps)
 * All signing is done in-browser via the Web Crypto API.
 */

export const TUYA_REGIONS = {
  eu: { label: 'Europe',   base: 'https://openapi.tuyaeu.com' },
  us: { label: 'Amérique', base: 'https://openapi.tuyaus.com' },
  cn: { label: 'Chine',    base: 'https://openapi.tuyacn.com' },
  in: { label: 'Inde',     base: 'https://openapi.tuyain.com' },
};

// Platform-level defaults — injected at build time from Replit Secrets
export const ENV_TUYA_ID   = import.meta.env.VITE_TUYA_CLIENT_ID     || '';
export const ENV_TUYA_SEC  = import.meta.env.VITE_TUYA_CLIENT_SECRET  || '';
export const ENV_TUYA_CODE = import.meta.env.VITE_TUYA_PROJECT_CODE   || '';

// Per-client override keys (stored in localStorage by the client themselves)
export const LS_TUYA_ID   = 'hova_tuya_client_id';
export const LS_TUYA_SEC  = 'hova_tuya_client_sec';
export const LS_TUYA_REG  = 'hova_tuya_region';
export const LS_TUYA_CODE = 'hova_tuya_project_code';

const _ls = (k) => (typeof localStorage !== 'undefined' ? localStorage.getItem(k) : '') || '';

// Resolve: client override first, then platform default
export const resolveTuyaId   = () => _ls(LS_TUYA_ID)  || ENV_TUYA_ID;
export const resolveTuyaSec  = () => _ls(LS_TUYA_SEC) || ENV_TUYA_SEC;
export const resolveTuyaReg  = () => _ls(LS_TUYA_REG) || 'eu';
export const resolveTuyaCode = () => _ls(LS_TUYA_CODE) || ENV_TUYA_CODE;

// True if using platform defaults (no client override)
export const tuyaUsingDefaults = () => !_ls(LS_TUYA_ID) && !!ENV_TUYA_ID;

/* ── Crypto helpers ────────────────────────────────────── */
async function hmacSha256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

async function sha256Hex(str = '') {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function buildHeaders(clientId, secret, accessToken, method, path, body = '') {
  const t     = Date.now().toString();
  const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const bodyHash  = await sha256Hex(body);
  const strToSign = [method.toUpperCase(), bodyHash, '', path].join('\n');
  const signStr   = clientId + accessToken + t + nonce + strToSign;
  const sign      = await hmacSha256(secret, signStr);
  return {
    'client_id':   clientId,
    'access_token': accessToken,
    't':           t,
    'sign_method': 'HMAC-SHA256',
    'nonce':       nonce,
    'sign':        sign,
    'Content-Type': 'application/json',
  };
}

async function apiFetch(clientId, secret, accessToken, method, path, region, body = '') {
  const base    = TUYA_REGIONS[region]?.base || TUYA_REGIONS.eu.base;
  const headers = await buildHeaders(clientId, secret, accessToken, method, path, body);
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    ...(body ? { body } : {}),
  });
  let data;
  try { data = await res.json(); } catch { throw new Error('Réponse Tuya invalide'); }
  if (data.success === false || data.success === 0) throw new Error(data.msg || `Erreur Tuya ${data.code}`);
  return data;
}

export const tuyaAPI = {

  /* ── AUTH — platform access token ─────────────────────── */
  getToken: async (clientId, secret, region = 'eu') => {
    const path = '/v1.0/token?grant_type=1';
    const base = TUYA_REGIONS[region]?.base || TUYA_REGIONS.eu.base;
    // Token request uses empty accessToken for signing
    const headers = await buildHeaders(clientId, secret, '', 'GET', path);
    const res = await fetch(`${base}${path}`, { method: 'GET', headers });
    let data;
    try { data = await res.json(); } catch { throw new Error('Réponse Tuya invalide'); }
    if (!data.success && data.success !== true) throw new Error(data.msg || `Auth Tuya échouée (${data.code})`);
    return data; // data.result.access_token, data.result.expire_time
  },

  /* ── USER LOGIN (Smart Life email + password) ───────────── */
  loginUser: async (clientId, secret, email, password, region = 'eu') => {
    // 1. Get platform token
    const auth = await tuyaAPI.getToken(clientId, secret, region);
    const platToken = auth.result?.access_token;
    if (!platToken) throw new Error('Token plateforme non reçu');
    // 2. MD5 the password (like Smart Life app does)
    const md5 = await import('md5').then(m => m.default || m).catch(() => null);
    const hashedPwd = md5 ? md5(password) : password;
    // 3. User login — endpoint varies by region
    return apiFetch(clientId, secret, platToken, 'POST',
      '/v1.0/iam/login',
      region,
      JSON.stringify({ username: email, password: hashedPwd, from: 'user' })
    );
    // result.uid + result.token (user-scoped token)
  },

  /* ── USER DEVICES by UID ────────────────────────────────── */
  getUserDevices: async (clientId, secret, platToken, uid, region = 'eu') => {
    return apiFetch(clientId, secret, platToken, 'GET',
      `/v1.0/users/${uid}/devices?page_no=1&page_size=100`,
      region
    );
  },

  /* ── LIST ALL LOCK DEVICES (by category) ───────────────── */
  getDevices: async (clientId, secret, accessToken, region = 'eu') => {
    return apiFetch(clientId, secret, accessToken, 'GET',
      '/v1.3/iot-03/devices?page_no=1&page_size=100&category=ms',
      region
    );
  },

  /* Fallback: list ALL device categories */
  getAllDevices: async (clientId, secret, accessToken, region = 'eu') => {
    return apiFetch(clientId, secret, accessToken, 'GET',
      '/v1.3/iot-03/devices?page_no=1&page_size=100',
      region
    );
  },

  /* ── DEVICE STATUS ─────────────────────────────────────── */
  getDeviceStatus: async (clientId, secret, accessToken, deviceId, region = 'eu') => {
    return apiFetch(clientId, secret, accessToken, 'GET',
      `/v1.0/iot-03/devices/${deviceId}/status`,
      region
    );
  },

  /* ── SEND COMMAND ──────────────────────────────────────── */
  sendCommand: async (clientId, secret, accessToken, deviceId, commands, region = 'eu') => {
    const body = JSON.stringify({ commands });
    return apiFetch(clientId, secret, accessToken, 'POST',
      `/v1.0/iot-03/devices/${deviceId}/commands`,
      region, body
    );
  },

  unlock: async (clientId, secret, accessToken, deviceId, region = 'eu') =>
    tuyaAPI.sendCommand(clientId, secret, accessToken, deviceId,
      [{ code: 'unlock_motor', value: true }], region),

  /* ── LOGS ─────────────────────────────────────────────── */
  getDeviceLogs: async (clientId, secret, accessToken, deviceId, region = 'eu') => {
    return apiFetch(clientId, secret, accessToken, 'GET',
      `/v1.0/iot-03/devices/${deviceId}/logs?size=20&query_type=7`,
      region
    );
  },
};
