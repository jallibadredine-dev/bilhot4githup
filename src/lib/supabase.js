import { createClient } from '@supabase/supabase-js'

// Les Replit Secrets VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ont des valeurs inversées.
// On utilise VITE_SB_URL / VITE_SB_ANON_KEY définis dans .env avec les bonnes valeurs.
const rawUrl  = import.meta.env.VITE_SB_URL        || import.meta.env.VITE_SUPABASE_URL   || ''
const rawKey  = import.meta.env.VITE_SB_ANON_KEY   || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isValidUrl = (v) => { try { return v && new URL(v).protocol.startsWith('http'); } catch { return false; } }
const isValidKey = (v) => v && v.startsWith('eyJ')

export const SUPABASE_READY = isValidUrl(rawUrl) && isValidKey(rawKey)

export const supabase = SUPABASE_READY
  ? createClient(rawUrl, rawKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : {
      auth: {
        getSession:            async () => ({ data: { session: null }, error: null }),
        onAuthStateChange:     (_ev, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp:                async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
        signInWithPassword:    async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
        signInWithOAuth:       async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
        signOut:               async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: { message: 'Supabase non configuré.' } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: { message: 'Supabase non configuré.' } }),
        update: () => ({ data: null, error: { message: 'Supabase non configuré.' } }),
        delete: () => ({ data: null, error: { message: 'Supabase non configuré.' } }),
        upsert: () => ({ data: null, error: { message: 'Supabase non configuré.' } }),
      }),
    }

if (!SUPABASE_READY) {
  console.warn('[Hova] Supabase non configuré — mode local activé.')
} else {
  console.log('[Hova] Supabase connecté ✓', rawUrl)
}
