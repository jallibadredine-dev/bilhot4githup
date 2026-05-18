import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

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
let _dotEnv = null;
function dotEnv() { return (_dotEnv ??= loadEnvFile()); }

function getUrl() {
  return process.env.VITE_SB_URL || process.env.SUPABASE_URL ||
         process.env.VITE_SUPABASE_URL ||
         dotEnv().VITE_SB_URL || dotEnv().SUPABASE_URL || '';
}
function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY_ACTUAL ||
         process.env.SUPABASE_SERVICE_ROLE_KEY ||
         dotEnv().SUPABASE_SERVICE_ROLE_KEY_ACTUAL ||
         dotEnv().SUPABASE_SERVICE_ROLE_KEY || '';
}

/**
 * POST /api/auth/signup
 * Creates a Supabase user via the Admin REST API with email_confirm: true,
 * bypassing email confirmation so the user can sign in immediately.
 * Uses direct fetch to avoid Supabase Realtime WebSocket issues in Node.js 20.
 * Body: { email, password, name }
 */
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const sbUrl = getUrl();
  const sbKey = getServiceKey();

  if (!sbUrl || !sbKey) {
    return res.status(503).json({ error: 'Auth service not configured' });
  }

  try {
    const response = await fetch(`${sbUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        user_metadata: { full_name: (name || '').trim() },
        email_confirm: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.msg || data?.message || data?.error_description || '';
      if (
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already been registered') ||
        response.status === 422
      ) {
        return res.status(409).json({ error: 'already_registered' });
      }
      console.error('[auth/signup] Supabase error:', response.status, msg);
      return res.status(400).json({ error: msg || 'Account creation failed' });
    }

    return res.status(201).json({ userId: data.id });
  } catch (err) {
    console.error('[auth/signup]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
