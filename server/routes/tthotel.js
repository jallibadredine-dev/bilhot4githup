import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const BASE_URL = process.env.TTHOTEL_API_URL || process.env.VITE_TTHOTEL_API_URL || 'https://api.ttlock.com';
const DEFAULT_CID = process.env.TTHOTEL_CLIENT_ID || process.env.VITE_TTHOTEL_CLIENT_ID || '';
const DEFAULT_CSEC = process.env.TTHOTEL_CLIENT_SECRET || process.env.VITE_TTHOTEL_CLIENT_SECRET || '';

const getAppCredentials = (clientId, clientSecret) => {
  const cid = (clientId || DEFAULT_CID || '').trim();
  const csec = (clientSecret || DEFAULT_CSEC || '').trim();
  if (!cid || !csec) {
    throw new Error('Credentials d\'application TTHotel non configurés sur le backend. Vérifiez Super Admin ou les variables d\'environnement.');
  }
  return { cid, csec };
};

const parseResponseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const handleResponse = async (res) => {
  const data = await parseResponseBody(res);
  if (!res.ok) {
    const errorMessage = typeof data === 'object' && data !== null
      ? data.errmsg || data.error || data.message
      : typeof data === 'string'
        ? data
        : `Erreur TTHotel ${res.status}`;
    return { error: errorMessage, status: res.status, data };
  }
  return data;
};

const urlencoded = (params) => new URLSearchParams(params).toString();

/**
 * Ensure password is MD5 hashed.
 * If already hashed (32 hex chars), return as-is.
 * Otherwise, compute MD5.
 */
const ensureMd5Password = (password) => {
  if (!password) return '';
  // Check if already MD5 (32 hex chars)
  if (/^[a-f0-9]{32}$/i.test(password)) {
    return password;
  }
  // Hash it
  return crypto.createHash('md5').update(password).digest('hex');
};

router.post('/token', async (req, res) => {
  try {
    const { username, password, clientId, clientSecret } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username et password requis' });

    const { cid, csec } = getAppCredentials(clientId, clientSecret);
    const hashedPassword = ensureMd5Password(password);
    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ client_id: cid, client_secret: csec, grant_type: 'password', username, password: hashedPassword }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('TTHotel /token error', error?.message, error);
    return res.status(500).json({ error: error.message, detail: error.stack?.split('\n').slice(0,3).join(' | ') });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken, clientId, clientSecret } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken requis' });

    const { cid, csec } = getAppCredentials(clientId, clientSecret);
    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ client_id: cid, client_secret: csec, grant_type: 'refresh_token', refresh_token: refreshToken }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/locks', async (req, res) => {
  try {
    const { accessToken, pageNo = 1, pageSize = 100 } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken requis' });

    const response = await fetch(`${BASE_URL}/v3/lock/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ accessToken, pageNo, pageSize }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/lock', async (req, res) => {
  try {
    const { accessToken, lockId, action } = req.body;
    if (!accessToken || !lockId || !action) return res.status(400).json({ error: 'accessToken, lockId et action requis' });
    if (!['lock', 'unlock'].includes(action)) return res.status(400).json({ error: 'action invalide' });

    const response = await fetch(`${BASE_URL}/v3/lock/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ accessToken, lockId }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/keyboardPwd/add', async (req, res) => {
  try {
    const { accessToken, lockId, keyboardPwd, keyboardPwdName, startDate, endDate, addType = 1 } = req.body;
    if (!accessToken || !lockId || !keyboardPwd || !keyboardPwdName) {
      return res.status(400).json({ error: 'accessToken, lockId, keyboardPwd et keyboardPwdName requis' });
    }
    const response = await fetch(`${BASE_URL}/v3/keyboardPwd/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ accessToken, lockId, keyboardPwd, keyboardPwdName, startDate, endDate, addType }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/lockLogs', async (req, res) => {
  try {
    const { accessToken, lockId, pageNo = 1, pageSize = 20 } = req.body;
    if (!accessToken || !lockId) return res.status(400).json({ error: 'accessToken et lockId requis' });

    const response = await fetch(`${BASE_URL}/v3/lockRecord/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: urlencoded({ accessToken, lockId, pageNo, pageSize }),
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
