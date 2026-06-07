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
    console.error('[auth/signup] Missing config: sbUrl=', !!sbUrl, 'sbKey=', !!sbKey);
    return res.status(503).json({ error: 'Auth service not configured. Check server logs.' });
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

    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      console.error('[auth/signup] JSON parse error:', parseErr.message, 'Response text:', text.substring(0, 200));
      return res.status(500).json({ error: 'Invalid response from auth service' });
    }

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

    // Ensure a profile row exists with a 14-day trial window so the frontend
    // can show remaining days immediately even if onboarding upsert fails.
    try {
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const profilePayload = {
        id: data.id,
        full_name: (name || '').trim(),
        email: email.trim().toLowerCase(),
        role: 'user',
        plan: 'trial',
        trial_ends_at: trialEndsAt,
        created_at: new Date().toISOString(),
      };

      // Upsert via PostgREST — use service role key
      const profilesUrl = `${sbUrl.replace(/\/$/, '')}/rest/v1/profiles`;
      await fetch(profilesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': `Bearer ${sbKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(profilePayload),
      });
    } catch (profileErr) {
      console.warn('[auth/signup] could not upsert profile:', profileErr?.message || profileErr);
    }

    // Create an admin notification (non-blocking) so admins see new signups
    try {
      const notifUrl = `${sbUrl.replace(/\/$/, '')}/rest/v1/notifications`;
      const notif = {
        title: 'Nouvel utilisateur inscrit',
        body: `Email: ${email.trim().toLowerCase()}${name ? ` — Nom: ${name.trim()}` : ''}`,
        level: 'info',
        meta: { user_id: data.id },
        created_at: new Date().toISOString(),
        seen: false,
      };
      await fetch(notifUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': `Bearer ${sbKey}`,
        },
        body: JSON.stringify(notif),
      });
    } catch (notifErr) {
      console.warn('[auth/signup] could not create admin notification:', notifErr?.message || notifErr);
    }

    return res.status(201).json({ userId: data.id });
  } catch (err) {
    console.error('[auth/signup]', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/check
 * Health check — verify Supabase configuration
 */
router.get('/check', (req, res) => {
  const sbUrl = getUrl();
  const sbKey = getServiceKey();
  
  const status = {
    supabase_configured: !!(sbUrl && sbKey),
    supabase_url: sbUrl ? 'present' : 'missing',
    supabase_key: sbKey ? 'present' : 'missing',
  };
  
  return res.json(status);
});

export default router;
