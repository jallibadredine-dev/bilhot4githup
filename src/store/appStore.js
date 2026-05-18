import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/* ─── App-wide Zustand store ───────────────────────────────────
   Single source of truth consumed by all PMS modules.
   Real-time Supabase events update slices via actions.
─────────────────────────────────────────────────────────────── */

export const useAppStore = create(
  subscribeWithSelector((set, get) => ({

    /* ── Session / User ─────────────────────────────────────── */
    session: null,
    currentUser: null,
    setSession: (session) => set({ session, currentUser: session?.user ?? null }),
    clearSession: () => set({ session: null, currentUser: null }),

    /* ── Reservations ───────────────────────────────────────── */
    reservations: [],
    reservationsLoading: false,
    reservationsError: null,
    setReservations: (reservations) => set({ reservations, reservationsLoading: false }),
    upsertReservation: (row) => set((state) => {
      const idx = state.reservations.findIndex(r => r.id === row.id);
      if (idx >= 0) {
        const next = [...state.reservations];
        next[idx] = { ...next[idx], ...row };
        return { reservations: next };
      }
      return { reservations: [row, ...state.reservations] };
    }),
    removeReservation: (id) => set((state) => ({
      reservations: state.reservations.filter(r => r.id !== id),
    })),

    /* ── Guests ─────────────────────────────────────────────── */
    guests: [],
    guestsLoading: false,
    setGuests: (guests) => set({ guests, guestsLoading: false }),
    upsertGuest: (row) => set((state) => {
      const idx = state.guests.findIndex(g => g.id === row.id);
      if (idx >= 0) {
        const next = [...state.guests];
        next[idx] = { ...next[idx], ...row };
        return { guests: next };
      }
      return { guests: [row, ...state.guests] };
    }),
    removeGuest: (id) => set((state) => ({ guests: state.guests.filter(g => g.id !== id) })),

    /* ── Rooms ──────────────────────────────────────────────── */
    rooms: [],
    roomsLoading: false,
    setRooms: (rooms) => set({ rooms, roomsLoading: false }),
    upsertRoom: (row) => set((state) => {
      const idx = state.rooms.findIndex(r => r.id === row.id);
      if (idx >= 0) {
        const next = [...state.rooms];
        next[idx] = { ...next[idx], ...row };
        return { rooms: next };
      }
      return { rooms: [row, ...state.rooms] };
    }),
    removeRoom: (id) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== id) })),

    /* ── Access Cards ───────────────────────────────────────── */
    accessCards: [],
    setAccessCards: (accessCards) => set({ accessCards }),
    upsertAccessCard: (row) => set((state) => {
      const idx = state.accessCards.findIndex(c => c.id === row.id);
      if (idx >= 0) {
        const next = [...state.accessCards];
        next[idx] = { ...next[idx], ...row };
        return { accessCards: next };
      }
      return { accessCards: [row, ...state.accessCards] };
    }),
    removeAccessCard: (id) => set((state) => ({
      accessCards: state.accessCards.filter(c => c.id !== id),
    })),

    /* ── Profiles / Users ───────────────────────────────────── */
    profiles: [],
    setProfiles: (profiles) => set({ profiles }),
    upsertProfile: (row) => set((state) => {
      const idx = state.profiles.findIndex(p => p.id === row.id);
      if (idx >= 0) {
        const next = [...state.profiles];
        next[idx] = { ...next[idx], ...row };
        return { profiles: next };
      }
      return { profiles: [row, ...state.profiles] };
    }),
    removeProfile: (id) => set((state) => ({
      profiles: state.profiles.filter(p => p.id !== id),
    })),

    /* ── Payments ───────────────────────────────────────────── */
    payments: [],
    setPayments: (payments) => set({ payments }),

    /* ── Settings ───────────────────────────────────────────── */
    settings: {},
    setSettings: (settings) => set({ settings }),
    mergeSetting: (key, value) => set((state) => ({ settings: { ...state.settings, [key]: value } })),

    /* ── System Health ──────────────────────────────────────── */
    systemHealth: null,
    systemHealthLoading: false,
    systemHealthLastChecked: null,
    setSystemHealth: (data) => set({
      systemHealth: data,
      systemHealthLoading: false,
      systemHealthLastChecked: new Date().toISOString(),
    }),
    setSystemHealthLoading: (v) => set({ systemHealthLoading: v }),

    /* ── System Logs ────────────────────────────────────────── */
    systemLogs: [],
    systemLogsLoading: false,
    systemLogsTotal: 0,
    setSystemLogs: (logs, total) => set({ systemLogs: logs, systemLogsLoading: false, systemLogsTotal: total ?? logs.length }),
    prependSystemLog: (entry) => set((state) => ({
      systemLogs: [entry, ...state.systemLogs].slice(0, 200),
    })),
  }))
);
