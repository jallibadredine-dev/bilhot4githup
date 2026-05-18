import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SB_URL      || import.meta.env.VITE_SUPABASE_URL      || ''
const rawKey = import.meta.env.VITE_SB_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isValidUrl = (v) => { try { return v && new URL(v).protocol.startsWith('http'); } catch { return false; } }
const isValidKey = (v) => v && v.startsWith('eyJ')

export const SUPABASE_READY = isValidUrl(rawUrl) && isValidKey(rawKey)

const noopLock = async (_name, _opts, fn) => fn()

function makeClient() {
  return createClient(rawUrl, rawKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'hova_auth',
      storage: window.localStorage,
      lock: noopLock,
    }
  })
}

const mockClient = {
  auth: {
    getSession:            async () => ({ data: { session: null }, error: null }),
    onAuthStateChange:     (_ev, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp:                async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
    signInWithPassword:    async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
    signInWithOAuth:       async () => ({ error: { message: 'Supabase non configuré — utilisez le mode Démo.' } }),
    signOut:               async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: { message: 'Supabase non configuré.' } }),
  },
  from: (_table) => {
    const stub = {
      select: function() { return this; },
      eq:     function() { return this; },
      order:  function() { return this; },
      limit:  function() { return this; },
      single: () => Promise.resolve({ data: null, error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Mode démo.' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Mode démo.' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Mode démo.' } }),
      upsert: () => Promise.resolve({ data: null, error: { message: 'Mode démo.' } }),
      then:   (fn) => Promise.resolve(fn({ data: [], error: null })),
    }
    return stub
  },
}

// Singleton — évite les instances multiples lors du HMR Vite
const SINGLETON_KEY = '__hova_supabase__'

function getOrCreateClient() {
  if (!SUPABASE_READY) return mockClient
  if (typeof window === 'undefined') return makeClient()
  if (!window[SINGLETON_KEY]) {
    window[SINGLETON_KEY] = makeClient()
  }
  return window[SINGLETON_KEY]
}

export const supabase = getOrCreateClient()

if (!SUPABASE_READY) {
  console.warn('[Hova] Supabase non configuré — mode démo local activé.')
} else {
  console.log('[Hova] Supabase connecté ✓', rawUrl)
}
