import { useEffect, useRef } from 'react';
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { useAppStore } from './appStore';

/* ─── Supabase Real-time subscription manager ──────────────────
   Call useRealtimeSync() once near the root of the authenticated
   app tree. It subscribes to all main PMS tables and pushes
   INSERT / UPDATE / DELETE events into the global Zustand store.
   Channels are removed on unmount to avoid leaks.
─────────────────────────────────────────────────────────────── */

const TABLE_CONFIGS = [
  {
    table: 'reservations',
    upsert: (row) => useAppStore.getState().upsertReservation(row),
    remove: (row) => useAppStore.getState().removeReservation(row.id),
  },
  {
    table: 'guests',
    upsert: (row) => useAppStore.getState().upsertGuest(row),
    remove: (row) => useAppStore.getState().removeGuest(row.id),
  },
  {
    table: 'rooms',
    upsert: (row) => useAppStore.getState().upsertRoom(row),
    remove: (row) => useAppStore.getState().removeRoom(row.id),
  },
  {
    table: 'access_cards',
    upsert: (row) => useAppStore.getState().upsertAccessCard(row),
    remove: (row) => useAppStore.getState().removeAccessCard(row.id),
  },
  {
    table: 'profiles',
    upsert: (row) => useAppStore.getState().upsertProfile(row),
    remove: (row) => useAppStore.getState().removeProfile(row.id),
  },
];

export function useRealtimeSync() {
  const channelsRef = useRef([]);

  useEffect(() => {
    if (!SUPABASE_READY) return;

    const channels = TABLE_CONFIGS.map(({ table, upsert, remove }) => {
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
            console.warn(`[Hova] Realtime channel error: ${table}`);
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
  try {
    await supabase.from('system_logs').insert({
      severity,
      module,
      message,
      details,
      created_at: new Date().toISOString(),
    });
    useAppStore.getState().prependSystemLog({ severity, module, message, details, created_at: new Date().toISOString() });
  } catch (_) {}
}
