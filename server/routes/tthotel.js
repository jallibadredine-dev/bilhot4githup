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
 * Better URL encoding for Tomcat compatibility
 */
const encodeParams = (params) => {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(String(value || ''));
    parts.push(`${encodedKey}=${encodedValue}`);
  }
  return parts.join('&');
};

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
    
    // Build request body with proper encoding
    const params = {
      client_id: cid,
      client_secret: csec,
      grant_type: 'password',
      username,
      password: hashedPassword,
    };
    
    const body = encodeParams(params);
    
    console.log('[TTHotel /token REQUEST]', {
      url: `${BASE_URL}/oauth2/token`,
      username: username.substring(0, 50),
      passwordOriginalLength: password?.length || 0,
      passwordHashedLength: hashedPassword?.length || 0,
      isAlreadyMd5: /^[a-f0-9]{32}$/i.test(password),
      bodyLength: body.length,
      bodyPreview: body.substring(0, 200),
    });

    const response = await fetch(`${BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'HosFlow/1.0',
        'Accept': 'application/json',
      },
      body,
    });

    console.log('[TTHotel /token RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });
    
    const result = await handleResponse(response);
    console.log('[TTHotel /token RESULT]', { 
      hasError: !!result.error, 
      resultStatus: result.status,
      errorMsg: result.error || 'OK',
    });
    
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('[TTHotel /token EXCEPTION]', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
    });
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

    // TTLock expects access_token (with underscore), not accessToken
    const body = encodeParams({ access_token: accessToken, pageNo: String(pageNo), pageSize: String(pageSize) });
    
    console.log('[TTHotel /locks REQUEST]', {
      url: `${BASE_URL}/v3/lock/list`,
      accessTokenLength: accessToken?.length || 0,
      pageNo, pageSize,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 150),
    });

    const response = await fetch(`${BASE_URL}/v3/lock/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'HosFlow/1.0',
        'Accept': 'application/json',
      },
      body,
    });
    
    console.log('[TTHotel /locks RESPONSE]', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
    });
    
    const result = await handleResponse(response);
    
    console.log('[TTHotel /locks RESULT]', { 
      hasError: !!result.error, 
      resultStatus: result.status,
      errorMsg: result.error || 'OK',
      itemsCount: result?.list?.length || 0,
    });
    
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('[TTHotel /locks EXCEPTION]', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
    });
    return res.status(500).json({ error: error.message, detail: error.stack?.split('\n').slice(0,3).join(' | ') });
  }
});

router.post('/lock', async (req, res) => {
  try {
    const { accessToken, lockId, action } = req.body;
    if (!accessToken || !lockId || !action) return res.status(400).json({ error: 'accessToken, lockId et action requis' });
    if (!['lock', 'unlock'].includes(action)) return res.status(400).json({ error: 'action invalide' });

    // TTLock expects access_token (with underscore)
    const body = encodeParams({ access_token: accessToken, lockId });
    const response = await fetch(`${BASE_URL}/v3/lock/${action}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('[TTHotel /lock error]', error?.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/keyboardPwd/add', async (req, res) => {
  try {
    const { accessToken, lockId, keyboardPwd, keyboardPwdName, startDate, endDate, addType = 1 } = req.body;
    if (!accessToken || !lockId || !keyboardPwd || !keyboardPwdName) {
      return res.status(400).json({ error: 'accessToken, lockId, keyboardPwd et keyboardPwdName requis' });
    }
    
    // TTLock expects access_token (with underscore)
    const params = { access_token: accessToken, lockId, keyboardPwd, keyboardPwdName, addType };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const body = encodeParams(params);
    
    const response = await fetch(`${BASE_URL}/v3/keyboardPwd/add`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('[TTHotel /keyboardPwd/add error]', error?.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/lockLogs', async (req, res) => {
  try {
    const { accessToken, lockId, pageNo = 1, pageSize = 20 } = req.body;
    if (!accessToken || !lockId) return res.status(400).json({ error: 'accessToken et lockId requis' });

    // TTLock expects access_token (with underscore)
    const body = encodeParams({ access_token: accessToken, lockId, pageNo: String(pageNo), pageSize: String(pageSize) });
    const response = await fetch(`${BASE_URL}/v3/lockRecord/list`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
      body,
    });
    const result = await handleResponse(response);
    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    console.error('[TTHotel /lockLogs error]', error?.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
