import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/* ─── App-wide Zustand store ───────────────────────────────────
   Single source of truth consumed by all PMS modules.
   Real-time Supabase events update slices via actions.
─────────────────────────────────────────────────────────────── */

export const useAppStore = create(
  subscribeWithSelector((set) => ({

    /* ── Session / User ─────────────────────────────────────── */
    session: null,
    currentUser: null,
    setSession: (session) => set({ session, currentUser: session?.user ?? null }),
    clearSession: () => set({ session: null, currentUser: null }),

    /* ── Reservations ───────────────────────────────────────── */
    reservations: [],
    reservationsLoading: false,
    setReservations: (reservations) => set({ reservations, reservationsLoading: false }),
    upsertReservation: (row) => set((s) => {
      const idx = s.reservations.findIndex(r => r.id === row.id);
      if (idx >= 0) { const a = [...s.reservations]; a[idx] = { ...a[idx], ...row }; return { reservations: a }; }
      return { reservations: [row, ...s.reservations] };
    }),
    removeReservation: (id) => set((s) => ({ reservations: s.reservations.filter(r => r.id !== id) })),

    /* ── Guests ─────────────────────────────────────────────── */
    guests: [],
    guestsLoading: false,
    setGuests: (guests) => set({ guests, guestsLoading: false }),
    upsertGuest: (row) => set((s) => {
      const idx = s.guests.findIndex(g => g.id === row.id);
      if (idx >= 0) { const a = [...s.guests]; a[idx] = { ...a[idx], ...row }; return { guests: a }; }
      return { guests: [row, ...s.guests] };
    }),
    removeGuest: (id) => set((s) => ({ guests: s.guests.filter(g => g.id !== id) })),

    /* ── Rooms ──────────────────────────────────────────────── */
    rooms: [],
    roomsLoading: false,
    setRooms: (rooms) => set({ rooms, roomsLoading: false }),
    upsertRoom: (row) => set((s) => {
      const idx = s.rooms.findIndex(r => r.id === row.id);
      if (idx >= 0) { const a = [...s.rooms]; a[idx] = { ...a[idx], ...row }; return { rooms: a }; }
      return { rooms: [row, ...s.rooms] };
    }),
    removeRoom: (id) => set((s) => ({ rooms: s.rooms.filter(r => r.id !== id) })),

    /* ── Access Cards ───────────────────────────────────────── */
    accessCards: [],
    setAccessCards: (accessCards) => set({ accessCards }),
    upsertAccessCard: (row) => set((s) => {
      const idx = s.accessCards.findIndex(c => c.id === row.id);
      if (idx >= 0) { const a = [...s.accessCards]; a[idx] = { ...a[idx], ...row }; return { accessCards: a }; }
      return { accessCards: [row, ...s.accessCards] };
    }),
    removeAccessCard: (id) => set((s) => ({ accessCards: s.accessCards.filter(c => c.id !== id) })),

    /* ── Profiles / Users ───────────────────────────────────── */
    profiles: [],
    setProfiles: (profiles) => set({ profiles }),
    upsertProfile: (row) => set((s) => {
      const idx = s.profiles.findIndex(p => p.id === row.id);
      if (idx >= 0) { const a = [...s.profiles]; a[idx] = { ...a[idx], ...row }; return { profiles: a }; }
      return { profiles: [row, ...s.profiles] };
    }),
    removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter(p => p.id !== id) })),

    /* ── Payments ───────────────────────────────────────────── */
    payments: [],
    paymentsLoading: false,
    setPayments: (payments) => set({ payments, paymentsLoading: false }),
    upsertPayment: (row) => set((s) => {
      const idx = s.payments.findIndex(p => p.id === row.id);
      if (idx >= 0) { const a = [...s.payments]; a[idx] = { ...a[idx], ...row }; return { payments: a }; }
      return { payments: [row, ...s.payments] };
    }),
    removePayment: (id) => set((s) => ({ payments: s.payments.filter(p => p.id !== id) })),

    /* ── Permissions ────────────────────────────────────────── */
    permissions: [],
    setPermissions: (permissions) => set({ permissions }),
    upsertPermission: (row) => set((s) => {
      const idx = s.permissions.findIndex(p => p.id === row.id);
      if (idx >= 0) { const a = [...s.permissions]; a[idx] = { ...a[idx], ...row }; return { permissions: a }; }
      return { permissions: [row, ...s.permissions] };
    }),
    removePermission: (id) => set((s) => ({ permissions: s.permissions.filter(p => p.id !== id) })),

    /* ── Settings ───────────────────────────────────────────── */
    settings: {},
    setSettings: (settings) => set({ settings }),
    mergeSetting: (key, value) => set((s) => ({ settings: { ...s.settings, [key]: value } })),

    /* ── System Health ──────────────────────────────────────── */
    systemHealth: null,
    systemHealthLoading: false,
    systemHealthLastChecked: null,
    setSystemHealth: (data) => set({ systemHealth: data, systemHealthLoading: false, systemHealthLastChecked: new Date().toISOString() }),
    setSystemHealthLoading: (v) => set({ systemHealthLoading: v }),

    /* ── System Logs ────────────────────────────────────────── */
    systemLogs: [],
    systemLogsLoading: false,
    systemLogsTotal: 0,
    setSystemLogs: (logs, total) => set({ systemLogs: logs, systemLogsLoading: false, systemLogsTotal: total ?? logs.length }),
    prependSystemLog: (entry) => set((s) => ({ systemLogs: [entry, ...s.systemLogs].slice(0, 200) })),
  }))
);
