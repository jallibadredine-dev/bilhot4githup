import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireSuperAdmin } from '../middleware/requireSuperAdmin.js';

const router = express.Router();

router.use(requireSuperAdmin);

/* ─── Validation helpers ─── */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUUID(v) { return typeof v === 'string' && UUID_RE.test(v); }
function isValidEmail(v) { return typeof v === 'string' && EMAIL_RE.test(v) && v.length <= 254; }
function safeInt(v, def, min, max) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
}

const ALLOWED_PATCH_FIELDS = new Set([
  'full_name', 'role', 'plan', 'company', 'phone', 'avatar_url', 'status', 'notes',
]);

const ALLOWED_ROLES = new Set(['user', 'admin', 'super_admin']);
const ALLOWED_PLANS = new Set(['starter', 'standard', 'integral', 'lifetime']);

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

function getSbUrl()  { return process.env.VITE_SB_URL || process.env.SUPABASE_URL || dotEnv.VITE_SB_URL || dotEnv.SUPABASE_URL || ''; }
function getSbKey()  { return process.env.VITE_SB_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || dotEnv.VITE_SB_SERVICE_KEY || dotEnv.SUPABASE_SERVICE_ROLE_KEY_ACTUAL || ''; }
function getSbAnon() { return process.env.VITE_SB_ANON_KEY || dotEnv.VITE_SB_ANON_KEY || ''; }

function sbFetch(urlPath, options = {}) {
  const SB_URL = getSbUrl();
  const SB_KEY = getSbKey();
  if (!SB_URL || !SB_KEY) throw new Error('Supabase non configuré côté serveur.');
  return fetch(`${SB_URL}${urlPath}`, {
    ...options,
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

function anonFetch(urlPath, token, options = {}) {
  const SB_URL = getSbUrl();
  const anon = getSbAnon();
  return fetch(`${SB_URL}${urlPath}`, {
    ...options,
    headers: {
      'apikey': anon,
      'Authorization': `Bearer ${token || anon}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

async function logAudit({ user_email, action, resource, type = 'user' }) {
  try {
    await sbFetch('/rest/v1/audit_logs', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ user_email, action, resource, type, created_at: new Date().toISOString() }),
    });
  } catch (_) {}
}

/* ════════════════════════════════════════
   USERS / CLIENTS
   ════════════════════════════════════════ */

router.get('/users', async (req, res) => {
  const { search = '', role = '', plan = '' } = req.query;
  const limit  = safeInt(req.query.limit,  100, 1, 500);
  const offset = safeInt(req.query.offset, 0,   0, 100000);
  try {
    let url = `/rest/v1/profiles?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`;
    const r = await sbFetch(url);
    if (!r.ok) throw new Error('Erreur lecture profiles');
    let data = await r.json();
    if (!Array.isArray(data)) data = [];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.company || '').toLowerCase().includes(q));
    }
    if (role) data = data.filter(u => u.role === role);
    if (plan) data = data.filter(u => u.plan === plan);
    res.json({ users: data, total: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'ID utilisateur invalide.' });
  try {
    const [profileR, propsR] = await Promise.all([
      sbFetch(`/rest/v1/profiles?id=eq.${id}&select=*`),
      sbFetch(`/rest/v1/properties?select=id,name,type,status&limit=20`),
    ]);
    const profiles = profileR.ok ? await profileR.json() : [];
    const props = propsR.ok ? await propsR.json() : [];
    if (!profiles.length) return res.status(404).json({ error: 'Profil introuvable.' });
    res.json({ user: profiles[0], properties: Array.isArray(props) ? props : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-user', async (req, res) => {
  const { email, name, plan = 'starter', role = 'user', company = '', phone = '' } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'email et name requis.' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Format email invalide.' });
  if (typeof name !== 'string' || name.trim().length < 1 || name.length > 120) {
    return res.status(400).json({ error: 'Nom invalide (1-120 caractères).' });
  }
  if (role && !ALLOWED_ROLES.has(role)) return res.status(400).json({ error: 'Rôle invalide.' });
  if (plan && !ALLOWED_PLANS.has(plan)) return res.status(400).json({ error: 'Plan invalide.' });
  try {
    const password = 'Hova' + Math.random().toString(36).slice(2, 8).toUpperCase() + '!';
    const createRes = await sbFetch('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: name } }),
    });
    const userData = await createRes.json();
    if (!createRes.ok) throw new Error(userData.message || userData.error_description || 'Erreur création auth.');
    const userId = userData.id;
    await sbFetch('/rest/v1/profiles', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ id: userId, full_name: name, email, role, plan, company, phone, created_at: new Date().toISOString() }),
    });
    await logAudit({ user_email: 'super_admin', action: `Compte créé: ${email}`, resource: userId, type: 'user' });
    res.json({ ok: true, user: { id: userId, email, name, plan, role, password } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'ID utilisateur invalide.' });
  const { email: _e, ...raw } = req.body;
  const fields = {};
  for (const [k, v] of Object.entries(raw)) {
    if (ALLOWED_PATCH_FIELDS.has(k)) fields[k] = v;
  }
  if (fields.role && !ALLOWED_ROLES.has(fields.role)) return res.status(400).json({ error: 'Rôle invalide.' });
  if (fields.plan && !ALLOWED_PLANS.has(fields.plan)) return res.status(400).json({ error: 'Plan invalide.' });
  try {
    fields.updated_at = new Date().toISOString();
    const r = await sbFetch(`/rest/v1/profiles?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) throw new Error('Erreur mise à jour profil');
    const data = await r.json();
    await logAudit({ user_email: 'super_admin', action: `Profil mis à jour`, resource: id, type: 'user' });
    res.json({ user: Array.isArray(data) ? data[0] : data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidUUID(id)) return res.status(400).json({ error: 'ID utilisateur invalide.' });
  try {
    await sbFetch(`/rest/v1/profiles?id=eq.${id}`, { method: 'DELETE' });
    const delAuth = await sbFetch(`/auth/v1/admin/users/${id}`, { method: 'DELETE' });
    if (!delAuth.ok && delAuth.status !== 404) {
      const txt = await delAuth.text();
      console.warn('[admin] auth delete warn:', txt);
    }
    await logAudit({ user_email: 'super_admin', action: `Compte supprimé`, resource: id, type: 'user' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   ANALYTICS & STATS
   ════════════════════════════════════════ */

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
    const safeUsers = Array.isArray(users) ? users : [];
    const safeProps = Array.isArray(props) ? props : [];
    const safeResvs = Array.isArray(resvs) ? resvs : [];
    const totalRevenue = safeResvs.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const byPlan = safeUsers.reduce((acc, u) => { acc[u.plan || 'starter'] = (acc[u.plan || 'starter'] || 0) + 1; return acc; }, {});
    const byRole = safeUsers.reduce((acc, u) => { acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1; return acc; }, {});
    res.json({
      totalUsers: safeUsers.length,
      activeUsers: safeUsers.length,
      totalProperties: safeProps.length,
      activeProperties: safeProps.filter(p => p.status === 'active').length,
      totalRevenue,
      totalReservations: safeResvs.length,
      byPlan,
      byRole,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const [usersR, propsR] = await Promise.all([
      sbFetch('/rest/v1/profiles?select=id,plan,role,created_at&order=created_at.asc'),
      sbFetch('/rest/v1/properties?select=id,status,created_at'),
    ]);
    const users = usersR.ok ? (await usersR.json() || []) : [];
    const props = propsR.ok ? (await propsR.json() || []) : [];

    const safeUsers = Array.isArray(users) ? users : [];

    const monthMap = {};
    for (const u of safeUsers) {
      const d = new Date(u.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }
    const signupTrend = Object.entries(monthMap)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month: month.slice(5), count }));

    const planDist = [];
    const planCounts = safeUsers.reduce((acc, u) => { acc[u.plan || 'starter'] = (acc[u.plan || 'starter'] || 0) + 1; return acc; }, {});
    for (const [name, value] of Object.entries(planCounts)) planDist.push({ name: name.toUpperCase(), value });

    const roleDist = [];
    const roleCounts = safeUsers.reduce((acc, u) => { acc[u.role || 'user'] = (acc[u.role || 'user'] || 0) + 1; return acc; }, {});
    for (const [name, value] of Object.entries(roleCounts)) roleDist.push({ name, value });

    res.json({ signupTrend, planDist, roleDist, totalUsers: safeUsers.length, totalProps: Array.isArray(props) ? props.length : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ════════════════════════════════════════
   PAYMENTS (Stripe)
   ════════════════════════════════════════ */

router.get('/payments', async (req, res) => {
  try {
    const { getUncachableStripeClient } = await import('../stripeClient.js').catch(() => ({ getUncachableStripeClient: null }));
    if (!getUncachableStripeClient) return res.json({ payments: [], error: 'Stripe non disponible.' });
    const stripe = await getUncachableStripeClient();
    const [charges, subs] = await Promise.all([
      stripe.charges.list({ limit: 50 }),
      stripe.subscriptions.list({ limit: 50, status: 'all' }),
    ]);
    const payments = charges.data.map(c => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency.toUpperCase(),
      status: c.status,
      email: c.billing_details?.email || c.receipt_email || '—',
      description: c.description || '—',
      created: new Date(c.created * 1000).toISOString(),
    }));
    const subscriptions = subs.data.map(s => ({
      id: s.id,
      status: s.status,
      email: s.customer || '—',
      plan: s.items?.data?.[0]?.price?.nickname || s.items?.data?.[0]?.price?.id || '—',
      amount: (s.items?.data?.[0]?.price?.unit_amount || 0) / 100,
      currency: (s.items?.data?.[0]?.price?.currency || 'eur').toUpperCase(),
      created: new Date(s.created * 1000).toISOString(),
      current_period_end: new Date(s.current_period_end * 1000).toISOString(),
    }));
    const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0);
    res.json({ payments, subscriptions, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message, payments: [], subscriptions: [] });
  }
});

/* ════════════════════════════════════════
   AUDIT LOGS
   ════════════════════════════════════════ */

router.get('/audit-logs', async (req, res) => {
  const limit = safeInt(req.query.limit, 50, 1, 500);
  const type  = typeof req.query.type === 'string' ? req.query.type.replace(/[^a-zA-Z0-9_-]/g, '') : '';
  try {
    let url = `/rest/v1/audit_logs?select=*&order=created_at.desc&limit=${limit}`;
    if (type) url += `&type=eq.${type}`;
    const r = await sbFetch(url);
    if (!r.ok) {
      return res.json({ logs: [] });
    }
    const data = await r.json();
    res.json({ logs: Array.isArray(data) ? data : [] });
  } catch (err) {
    res.json({ logs: [], error: err.message });
  }
});

/* ════════════════════════════════════════
   GOOGLE OAUTH STATS
   ════════════════════════════════════════ */

router.get('/google-auth-stats', async (req, res) => {
  try {
    const r = await sbFetch('/auth/v1/admin/users?page=1&per_page=1000');
    if (!r.ok) return res.json({ googleUsers: 0, totalSignIns: 0, googleSignups30d: 0, activeSessions24h: 0, recentUsers: [], oauthErrors: [] });
    const body = await r.json();
    const allUsers = Array.isArray(body) ? body : (Array.isArray(body?.users) ? body.users : []);

    const googleUsers = allUsers.filter(u => {
      const p = u.app_metadata?.provider;
      const ps = u.app_metadata?.providers;
      return p === 'google' || (Array.isArray(ps) && ps.includes('google'));
    });

    const now = Date.now();
    const ms30d = 30 * 24 * 60 * 60 * 1000;
    const ms24h = 24 * 60 * 60 * 1000;

    const totalSignIns       = googleUsers.reduce((s, u) => s + (typeof u.sign_in_count === 'number' ? u.sign_in_count : 0), 0);
    const googleSignups30d   = googleUsers.filter(u => u.created_at && (now - new Date(u.created_at).getTime()) < ms30d).length;
    const activeSessions24h  = googleUsers.filter(u => u.last_sign_in_at && (now - new Date(u.last_sign_in_at).getTime()) < ms24h).length;
    const recentUsers = googleUsers
      .sort((a, b) => new Date(b.last_sign_in_at || b.created_at) - new Date(a.last_sign_in_at || a.created_at))
      .slice(0, 8)
      .map(u => ({
        email: u.email,
        name:  u.user_metadata?.full_name || u.user_metadata?.name || '—',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));

    // Best-effort: fetch recent OAuth-related error entries from audit_logs
    let oauthErrors = [];
    try {
      const errR = await sbFetch('/rest/v1/audit_logs?select=id,action,user_email,created_at&action=ilike.*oauth*&order=created_at.desc&limit=5');
      if (errR.ok) {
        const errData = await errR.json();
        if (Array.isArray(errData)) {
          oauthErrors = errData.map(e => ({
            action: e.action,
            user_email: e.user_email,
            created_at: e.created_at,
          }));
        }
      }
    } catch (_) {}

    res.json({ googleUsers: googleUsers.length, totalSignIns, googleSignups30d, activeSessions24h, recentUsers, oauthErrors });
  } catch (err) {
    res.json({ googleUsers: 0, totalSignIns: 0, googleSignups30d: 0, activeSessions24h: 0, recentUsers: [], oauthErrors: [], error: err.message });
  }
});

/* ════════════════════════════════════════
   PLANS (in Supabase plans table, fallback to static)
   ════════════════════════════════════════ */

router.get('/plans', async (req, res) => {
  try {
    const r = await sbFetch('/rest/v1/plans?select=*');
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length) return res.json({ plans: data });
    }
    res.json({ plans: [] });
  } catch (err) {
    res.json({ plans: [] });
  }
});

export default router;
