import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  if (result.ok) {
    if (result.ms < 1000) return 'up';
    return 'degraded';
  }
  if (result.status === 408) return 'timeout';
  if (result.status === 0) return 'down';
  return 'degraded';
}

/* ── GET /api/health — basic liveness ────────────────────────── */
router.get('/', (_req, res) => {
  res.json({ ok: true, service: 'HosFlow API', ts: new Date().toISOString() });
});

/* ── GET /api/health/providers — full provider health sweep ──── */
router.get('/providers', async (_req, res) => {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();

  const checks = await Promise.allSettled([
    /* Supabase REST */
    SB_URL && SB_KEY
      ? timedFetch(`${SB_URL}/rest/v1/`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        })
      : Promise.resolve({ ok: false, status: 0, ms: 0, error: 'not_configured' }),

    /* Backend self-check */
    timedFetch('http://localhost:' + (process.env.BACKEND_PORT || '3001') + '/api/health', {}, 2000),

    /* Google OAuth discovery endpoint */
    timedFetch('https://accounts.google.com/.well-known/openid-configuration', {}, 4000),

    /* TTLock cloud API */
    timedFetch('https://euapi.ttlock.com/v3/user/login', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'clientId=health_check' }, 5000),

    /* RFID / TTHotel encoder — internal service, best-effort */
    timedFetch('http://localhost:8080/api/status', {}, 2000),

    /* Redis / cache — check if configured, report unknown otherwise */
    process.env.REDIS_URL
      ? timedFetch(process.env.REDIS_URL + '/ping', {}, 2000)
      : Promise.resolve(null),
  ]);

  const [sbR, selfR, googleR, ttlockR, rfidR, redisR] = checks.map(r =>
    r.status === 'fulfilled' ? r.value : { ok: false, status: 0, ms: 0, error: r.reason?.message }
  );

  const providers = [
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Base de données & Auth',
      status: SB_URL ? classifyStatus(sbR) : 'not_configured',
      responseMs: sbR?.ms ?? null,
      configured: !!SB_URL,
    },
    {
      id: 'backend',
      name: 'Backend API',
      description: 'Serveur Express interne',
      status: classifyStatus(selfR),
      responseMs: selfR?.ms ?? null,
      configured: true,
    },
    {
      id: 'google_oauth',
      name: 'Google OAuth',
      description: 'Authentification Google',
      status: classifyStatus(googleR),
      responseMs: googleR?.ms ?? null,
      configured: true,
    },
    {
      id: 'ttlock',
      name: 'TTLock API',
      description: 'Serrures connectées',
      status: ttlockR?.status === 400 || ttlockR?.ok === false
        ? (ttlockR?.status === 400 ? 'up' : classifyStatus(ttlockR))
        : classifyStatus(ttlockR),
      responseMs: ttlockR?.ms ?? null,
      configured: true,
      note: 'Un 400 signifie que l\'API répond (credentials invalides ignorés).',
    },
    {
      id: 'rfid',
      name: 'Encodeur RFID',
      description: 'Service encoder local',
      status: rfidR?.ok ? 'up' : (rfidR?.status === 0 ? 'not_configured' : 'down'),
      responseMs: rfidR?.ms ?? null,
      configured: !!rfidR?.ok,
    },
    {
      id: 'redis',
      name: 'Cache (Redis)',
      description: 'Couche de cache optionnelle',
      status: redisR == null ? 'not_configured' : classifyStatus(redisR),
      responseMs: redisR?.ms ?? null,
      configured: !!process.env.REDIS_URL,
    },
  ];

  res.json({ providers, checkedAt: new Date().toISOString() });
});

/* ── GET /api/health/logs — system_logs from Supabase ─────────── */
router.get('/logs', async (req, res) => {
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

/* ── POST /api/health/logs — write a system log entry ─────────── */
router.post('/logs', async (req, res) => {
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
