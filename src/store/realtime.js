import { useEffect, useRef } from 'react';
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { useAppStore } from './appStore';

/* ─── Supabase Real-time subscription manager ──────────────────
   Call useRealtimeSync() once at the App root.
   Subscribes to all core PMS tables and pushes INSERT/UPDATE/DELETE
   events into the global Zustand store (single source of truth).
   Optional tables (settings, permissions) fail silently.
   Channels are removed on unmount to avoid leaks.
─────────────────────────────────────────────────────────────── */

const TABLE_CONFIGS = [
  /* ── Core PMS tables ─────────────────────────────────────── */
  {
    table: 'reservations', required: true,
    upsert: (row) => useAppStore.getState().upsertReservation(row),
    remove: (row) => useAppStore.getState().removeReservation(row.id),
  },
  {
    table: 'guests', required: true,
    upsert: (row) => useAppStore.getState().upsertGuest(row),
    remove: (row) => useAppStore.getState().removeGuest(row.id),
  },
  {
    table: 'rooms', required: true,
    upsert: (row) => useAppStore.getState().upsertRoom(row),
    remove: (row) => useAppStore.getState().removeRoom(row.id),
  },
  {
    table: 'access_cards', required: true,
    upsert: (row) => useAppStore.getState().upsertAccessCard(row),
    remove: (row) => useAppStore.getState().removeAccessCard(row.id),
  },
  {
    table: 'profiles', required: true,
    upsert: (row) => useAppStore.getState().upsertProfile(row),
    remove: (row) => useAppStore.getState().removeProfile(row.id),
  },
  {
    table: 'payments', required: true,
    upsert: (row) => useAppStore.getState().upsertPayment(row),
    remove: (row) => useAppStore.getState().removePayment(row.id),
  },
  /* ── Optional domains (silent on missing tables) ─────────── */
  {
    table: 'settings', required: false,
    upsert: (row) => row.key && useAppStore.getState().mergeSetting(row.key, row.value),
    remove: () => {},
  },
  {
    // permissions table has no dedicated store slice; ignore events silently
    table: 'permissions', required: false,
    upsert: () => {},
    remove: () => {},
  },
  {
    table: 'system_logs', required: false,
    upsert: (row) => useAppStore.getState().prependSystemLog(row),
    remove: () => {},
  },
];

export function useRealtimeSync() {
  const channelsRef = useRef([]);

  useEffect(() => {
    if (!SUPABASE_READY) return;

    const channels = TABLE_CONFIGS.map(({ table, upsert, remove, required }) => {
      const channel = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            const { eventType, new: newRow, old: oldRow } = payload;
            if (eventType === 'INSERT' || eventType === 'UPDATE') {
              upsert(newRow);
            } else if (eventType === 'DELETE') {
              remove(oldRow);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            if (required) {
              console.warn(`[Hova] Realtime channel error: ${table}`);
              writeSystemLog({ severity: 'warn', module: 'realtime', message: `Realtime channel error: ${table}` });
            }
          }
        });
      return channel;
    });

    channelsRef.current = channels;

    return () => {
      channelsRef.current.forEach((ch) => {
        try { supabase.removeChannel(ch); } catch (_) {}
      });
      channelsRef.current = [];
    };
  }, []);
}

/* ─── Utility: write a system log entry via Supabase ────────── */
export async function writeSystemLog({ severity = 'info', module = 'system', message, details = null }) {
  if (!SUPABASE_READY) return;
  const entry = { severity, module, message, details, created_at: new Date().toISOString() };
  try {
    await supabase.from('system_logs').insert(entry);
    useAppStore.getState().prependSystemLog(entry);
  } catch (_) {}
}

/* ─── Initial data loader for authenticated users ────────────── */
export async function loadInitialStoreData() {
  if (!SUPABASE_READY) return;
  const store = useAppStore.getState();

  const loads = [
    supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => data && store.setReservations(data))
      .catch(() => {}),
    supabase.from('guests').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => data && store.setGuests(data))
      .catch(() => {}),
    supabase.from('rooms').select('*').order('name', { ascending: true }).limit(200)
      .then(({ data }) => data && store.setRooms(data))
      .catch(() => {}),
    supabase.from('access_cards').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => data && store.setAccessCards(data))
      .catch(() => {}),
    supabase.from('profiles').select('id,full_name,email,role,plan,avatar_url,created_at').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => data && store.setProfiles(data))
      .catch(() => {}),
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => data && store.setPayments(data))
      .catch(() => {}),
  ];

  await Promise.allSettled(loads);
}
