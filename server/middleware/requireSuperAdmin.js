import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const getSbUrl  = () => process.env.VITE_SB_URL  || process.env.SUPABASE_URL || dotEnv.VITE_SB_URL || dotEnv.SUPABASE_URL || '';
const getSbKey  = () => process.env.VITE_SB_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || dotEnv.VITE_SB_SERVICE_KEY || dotEnv.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || '';
const getSbAnon = () => process.env.VITE_SB_ANON_KEY || dotEnv.VITE_SB_ANON_KEY || '';

export async function requireSuperAdmin(req, res, next) {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();
  if (!SB_URL || !SB_KEY) return next(); // dev/test mode: skip

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const anon = getSbAnon();
    const userRes = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { 'apikey': anon || SB_KEY, 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) return res.status(401).json({ error: 'Invalid or expired session.' });

    const userData = await userRes.json();
    const userId = userData?.id;
    if (!userId) return res.status(401).json({ error: 'Invalid session.' });

    const profileRes = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${userId}&select=role`, {
      headers: { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' },
    });
    const profiles = profileRes.ok ? await profileRes.json() : [];
    const role = Array.isArray(profiles) ? profiles[0]?.role : null;

    if (role !== 'super_admin') return res.status(403).json({ error: 'Super admin access required.' });
    req.adminUser = { id: userId, email: userData.email };
    next();
  } catch (err) {
    console.error('[auth] requireSuperAdmin error:', err.message);
    return res.status(500).json({ error: 'Authentication check failed.' });
  }
}
