import { supabase } from '../../../lib/supabase';

async function getValidToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const expiresAt = session.expires_at;
    const nowSec = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt - nowSec < 60) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      return refreshed?.session?.access_token || null;
    }

    return session.access_token || null;
  } catch (_) {
    return null;
  }
}

export async function adminFetch(url, options = {}) {
  const token = await getValidToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: null }));
    const newToken = refreshed?.session?.access_token;
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
      });
    }
  }

  return response;
}
