import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin.js';

const router = express.Router();

function loadEnvFile() {
  try {
    const __dir = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dir, '..', '..', '.env');
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    const env = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
    return env;
  } catch { return {}; }
}
const dotEnv = loadEnvFile();

function getSbUrl() { return process.env.VITE_SB_URL || process.env.SUPABASE_URL || dotEnv.VITE_SB_URL || dotEnv.SUPABASE_URL || ''; }
function getSbKey() { return process.env.VITE_SB_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || dotEnv.VITE_SB_SERVICE_KEY || dotEnv.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || ''; }

/* ── In-memory uptime tracking (ring buffer per provider) ────── */
const MAX_HISTORY = 100;
const healthHistory = {}; // provider_id → [{status, responseMs, ts}]

function recordCheck(providerId, status, responseMs) {
  if (!healthHistory[providerId]) healthHistory[providerId] = [];
  healthHistory[providerId].push({ status, responseMs, ts: Date.now() });
  if (healthHistory[providerId].length > MAX_HISTORY) {
    healthHistory[providerId] = healthHistory[providerId].slice(-MAX_HISTORY);
  }
}

function getUptimePct(providerId) {
  const hist = healthHistory[providerId] || [];
  if (hist.length < 2) return null;
  const up = hist.filter(h => h.status === 'up').length;
  return Math.round((up / hist.length) * 10000) / 100;
}

function getRecentErrors(providerId, limit = 3) {
  const hist = healthHistory[providerId] || [];
  return hist
    .filter(h => h.status !== 'up' && h.status !== 'not_configured' && h.status !== 'unknown')
    .slice(-limit)
    .map(h => ({ status: h.status, responseMs: h.responseMs, ts: new Date(h.ts).toISOString() }));
}

/* ── Timed fetch with timeout ───────────────────────────────── */
async function timedFetch(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = Date.now();
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const ms = Date.now() - t0;
    return { ok: res.ok, status: res.status, ms };
  } catch (err) {
    const ms = Date.now() - t0;
    const isTimeout = err.name === 'AbortError';
    return { ok: false, status: isTimeout ? 408 : 0, ms, error: isTimeout ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

function classifyStatus(result) {
  if (!result) return 'unknown';
  if (result.ok) return result.ms < 1000 ? 'up' : 'degraded';
  if (result.status === 408) return 'timeout';
  if (result.status === 0) return 'down';
  return 'degraded';
}

/* ── Supabase system_logs writer (fire-and-forget) ──────────── */
function sbWriteLog({ severity = 'warn', module = 'health', message, details }) {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();
  if (!SB_URL || !SB_KEY) return;
  fetch(`${SB_URL}/rest/v1/system_logs`, {
    method: 'POST',
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ severity, module, message, details: details ?? null, created_at: new Date().toISOString() }),
  }).catch(() => {});
}

/* ── GET /api/health — basic liveness ─────────────────────────── */
router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'HosFlow API', ts: new Date().toISOString() });
});

/* ── GET /api/health/providers — full provider health sweep ────── */
router.get('/providers', requireSuperAdmin, async (_req, res) => {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();

  const checks = await Promise.allSettled([
    SB_URL && SB_KEY
      ? timedFetch(`${SB_URL}/rest/v1/`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } })
      : Promise.resolve({ ok: false, status: 0, ms: 0, error: 'not_configured' }),
    timedFetch('http://localhost:' + (process.env.BACKEND_PORT || '3001') + '/api/health', {}, 2000),
    timedFetch('https://accounts.google.com/.well-known/openid-configuration', {}, 4000),
    timedFetch('https://euapi.ttlock.com/v3/user/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'clientId=health_check' }, 5000),
    timedFetch('https://thtthotel.ttlock.com/v3/hotel/listHotelInfo', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'clientId=health_check' }, 5000),
    timedFetch('http://localhost:8080/api/status', {}, 2000),
    process.env.REDIS_URL
      ? timedFetch(process.env.REDIS_URL + '/ping', {}, 2000)
      : Promise.resolve(null),
  ]);

  const [sbR, selfR, googleR, ttlockR, tthotelR, rfidR, redisR] = checks.map(r =>
    r.status === 'fulfilled' ? r.value : { ok: false, status: 0, ms: 0, error: r.reason?.message }
  );

  // TTLock/TTHotel: 400 means the server is up (auth error, not an outage)
  const ttlockStatus  = ttlockR?.status  === 400 ? 'up' : classifyStatus(ttlockR);
  const tthotelStatus = tthotelR?.status === 400 ? 'up' : (tthotelR?.status === 0 ? 'not_configured' : classifyStatus(tthotelR));

  const rawProviders = [
    { id: 'supabase',     raw: sbR,      status: SB_URL ? classifyStatus(sbR)  : 'not_configured', configured: !!SB_URL },
    { id: 'backend',      raw: selfR,    status: classifyStatus(selfR),                             configured: true     },
    { id: 'google_oauth', raw: googleR,  status: classifyStatus(googleR),                           configured: true     },
    { id: 'ttlock',       raw: ttlockR,  status: ttlockStatus,                                      configured: true     },
    { id: 'tthotel',      raw: tthotelR, status: tthotelStatus,                                     configured: tthotelR?.status !== 0 },
    { id: 'rfid',         raw: rfidR,    status: rfidR?.ok ? 'up' : (rfidR?.status === 0 ? 'not_configured' : 'down'), configured: !!rfidR?.ok },
    { id: 'redis',        raw: redisR,   status: redisR == null ? 'not_configured' : classifyStatus(redisR), configured: !!process.env.REDIS_URL },
  ];

  // Record in history and write system log for any newly degraded/down provider
  for (const p of rawProviders) {
    if (p.status !== 'not_configured') {
      recordCheck(p.id, p.status, p.raw?.ms ?? null);
      if (p.status === 'down' || p.status === 'timeout') {
        sbWriteLog({ severity: 'error', module: 'health', message: `Provider ${p.id} is ${p.status}`, details: { responseMs: p.raw?.ms, error: p.raw?.error } });
      } else if (p.status === 'degraded') {
        sbWriteLog({ severity: 'warn', module: 'health', message: `Provider ${p.id} is degraded`, details: { responseMs: p.raw?.ms } });
      }
    }
  }

  const META = {
    supabase:     { name: 'Supabase',        description: 'Base de données & Auth' },
    backend:      { name: 'Backend API',     description: 'Serveur Express interne' },
    google_oauth: { name: 'Google OAuth',    description: 'Authentification Google' },
    ttlock:       { name: 'TTLock API',      description: 'Serrures connectées', note: 'Un 400 signifie que l\'API répond (credentials ignorés).' },
    tthotel:      { name: 'TTHotel API',     description: 'Gestion hôtelière TTLock', note: 'Un 400 signifie que l\'API répond (credentials ignorés).' },
    rfid:         { name: 'Encodeur RFID',   description: 'Service encoder local' },
    redis:        { name: 'Cache (Redis)',   description: 'Couche de cache optionnelle' },
  };

  const providers = rawProviders.map(p => ({
    id: p.id,
    name: META[p.id]?.name,
    description: META[p.id]?.description,
    note: META[p.id]?.note,
    status: p.status,
    responseMs: p.raw?.ms ?? null,
    uptimePct: getUptimePct(p.id),
    recentErrors: getRecentErrors(p.id, 3),
    configured: p.configured,
  }));

  res.json({ providers, checkedAt: new Date().toISOString() });
});

/* ── GET /api/health/logs — system_logs (super-admin only) ─────── */
router.get('/logs', requireSuperAdmin, async (req, res) => {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();
  const { severity = '', module = '', limit = 50 } = req.query;

  if (!SB_URL || !SB_KEY) return res.json({ logs: [], total: 0 });

  try {
    let url = `${SB_URL}/rest/v1/system_logs?select=*&order=created_at.desc&limit=${limit}`;
    if (severity) url += `&severity=eq.${severity}`;
    if (module) url += `&module=eq.${module}`;
    const r = await fetch(url, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'count=exact' },
    });
    if (!r.ok) {
      const txt = await r.text();
      if (txt.includes('does not exist') || txt.includes('relation')) {
        return res.json({ logs: [], total: 0, tableNotReady: true });
      }
      return res.json({ logs: [], total: 0 });
    }
    const data = await r.json();
    const countHeader = r.headers.get('content-range');
    const total = countHeader ? parseInt(countHeader.split('/')[1]) || 0 : (Array.isArray(data) ? data.length : 0);
    res.json({ logs: Array.isArray(data) ? data : [], total });
  } catch (err) {
    res.json({ logs: [], total: 0, error: err.message });
  }
});

/* ── POST /api/health/logs — write a log (super-admin only) ────── */
router.post('/logs', requireSuperAdmin, async (req, res) => {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();
  if (!SB_URL || !SB_KEY) return res.status(503).json({ error: 'Supabase non configuré.' });

  const { severity = 'info', module = 'system', message, details } = req.body;
  if (!message) return res.status(400).json({ error: 'message requis.' });

  try {
    const r = await fetch(`${SB_URL}/rest/v1/system_logs`, {
      method: 'POST',
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ severity, module, message, details: details ?? null, created_at: new Date().toISOString() }),
    });
    const data = r.ok ? await r.json() : [];
    res.json({ ok: r.ok, log: Array.isArray(data) ? data[0] : data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
