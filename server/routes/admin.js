import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Read .env file at module load time (works regardless of import order)
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

function getSbUrl() {
  return process.env.VITE_SB_URL || process.env.SUPABASE_URL || dotEnv.VITE_SB_URL || dotEnv.SUPABASE_URL || '';
}
function getSbKey() {
  return process.env.VITE_SB_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || dotEnv.VITE_SB_SERVICE_KEY || dotEnv.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || '';
}

function sbFetch(urlPath, options = {}) {
  const SB_URL = getSbUrl();
  const SB_SERVICE_KEY = getSbKey();
  if (!SB_URL || !SB_SERVICE_KEY) throw new Error('Supabase non configuré côté serveur.');
  return fetch(`${SB_URL}${urlPath}`, {
    ...options,
    headers: {
      'apikey': SB_SERVICE_KEY,
      'Authorization': `Bearer ${SB_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

router.post('/create-user', async (req, res) => {
  const { email, name, plan, role } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'email et name requis.' });

  try {
    const password = 'Hova' + Math.random().toString(36).slice(2, 8).toUpperCase() + '!';

    const createRes = await sbFetch('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      }),
    });

    const userData = await createRes.json();
    if (!createRes.ok) throw new Error(userData.message || userData.error_description || 'Erreur création auth.');

    const userId = userData.id;

    await sbFetch('/rest/v1/profiles', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        id: userId,
        full_name: name,
        email,
        role: role || 'user',
        plan: plan || 'starter',
        status: 'active',
      }),
    });

    res.json({ ok: true, user: { id: userId, email, name, plan, role, password } });
  } catch (err) {
    console.error('[Admin] create-user error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const r = await sbFetch('/rest/v1/profiles?select=*&order=created_at.desc');
    if (!r.ok) throw new Error('Erreur lecture profiles');
    const data = await r.json();
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  try {
    const r = await sbFetch(`/rest/v1/profiles?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) throw new Error('Erreur mise à jour profil');
    const data = await r.json();
    res.json({ user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const delAuth = await sbFetch(`/auth/v1/admin/users/${id}`, { method: 'DELETE' });
    if (!delAuth.ok && delAuth.status !== 404) {
      const txt = await delAuth.text();
      throw new Error(txt);
    }
    await sbFetch(`/rest/v1/profiles?id=eq.${id}`, { method: 'DELETE' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [usersR, propsR, resvR] = await Promise.all([
      sbFetch('/rest/v1/profiles?select=id,plan,role'),
      sbFetch('/rest/v1/properties?select=id,status'),
      sbFetch('/rest/v1/reservations?select=id,status,amount'),
    ]);
    const users  = usersR.ok  ? await usersR.json()  : [];
    const props  = propsR.ok  ? await propsR.json()  : [];
    const resvs  = resvR.ok   ? await resvR.json()   : [];
    const activeProps  = Array.isArray(props) ? props.filter(p => p.status === 'active').length : 0;
    const totalRevenue = Array.isArray(resvs) ? resvs.reduce((s, r) => s + (Number(r.amount) || 0), 0) : 0;
    const totalUsers   = Array.isArray(users) ? users.length : 0;
    res.json({ totalUsers, activeUsers: totalUsers, totalProperties: Array.isArray(props) ? props.length : 0, activeProperties: activeProps, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
