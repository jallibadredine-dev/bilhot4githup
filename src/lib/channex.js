/**
 * Channex.io API v1 — Client Layer
 * Docs: https://docs.channex.io/
 */

const BASE = import.meta.env.VITE_CHANNEX_API_URL || 'https://app.channex.io/api/v1';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'user-api-key': token,
});

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.message || `HTTP ${res.status}`);
  }
  return res.json();
};

export const channexAPI = {
  // ── PROPERTIES ──────────────────────────────────────────────────────────────
  getProperties: async (token) => {
    const res = await fetch(`${BASE}/properties?pagination=false`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  getProperty: async (token, propertyId) => {
    const res = await fetch(`${BASE}/properties/${propertyId}`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  // ── ROOM TYPES ───────────────────────────────────────────────────────────────
  getRoomTypes: async (token, propertyId) => {
    const url = propertyId
      ? `${BASE}/room_types?filter[property_id]=${propertyId}&pagination=false`
      : `${BASE}/room_types?pagination=false`;
    const res = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  // ── BOOKINGS ─────────────────────────────────────────────────────────────────
  getBookings: async (token, params = {}) => {
    const query = new URLSearchParams({ pagination: false, ...params }).toString();
    const res = await fetch(`${BASE}/bookings?${query}`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  getBooking: async (token, bookingId) => {
    const res = await fetch(`${BASE}/bookings/${bookingId}`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  // ── CHANNELS ─────────────────────────────────────────────────────────────────
  getChannels: async (token) => {
    const res = await fetch(`${BASE}/channels?pagination=false`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  // ── AVAILABILITY ─────────────────────────────────────────────────────────────
  getAvailability: async (token, propertyId, dateFrom, dateTo) => {
    const res = await fetch(
      `${BASE}/availability?filter[property_id]=${propertyId}&filter[date_from]=${dateFrom}&filter[date_to]=${dateTo}`,
      { headers: getHeaders(token) }
    );
    return handleResponse(res);
  },

  updateAvailability: async (token, payload) => {
    const res = await fetch(`${BASE}/availability`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── RATES ────────────────────────────────────────────────────────────────────
  getRatePlans: async (token, propertyId) => {
    const url = propertyId
      ? `${BASE}/rate_plans?filter[property_id]=${propertyId}&pagination=false`
      : `${BASE}/rate_plans?pagination=false`;
    const res = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  updateRates: async (token, payload) => {
    const res = await fetch(`${BASE}/rates`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // ── MESSAGES ─────────────────────────────────────────────────────────────────
  getMessages: async (token, params = {}) => {
    const query = new URLSearchParams({ pagination: false, ...params }).toString();
    const res = await fetch(`${BASE}/messages?${query}`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  sendMessage: async (token, bookingId, text) => {
    const res = await fetch(`${BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ data: { attributes: { booking_id: bookingId, text } } }),
    });
    return handleResponse(res);
  },

  // ── REVIEWS ──────────────────────────────────────────────────────────────────
  getReviews: async (token, params = {}) => {
    const query = new URLSearchParams({ pagination: false, ...params }).toString();
    const res = await fetch(`${BASE}/reviews?${query}`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  replyToReview: async (token, reviewId, text) => {
    const res = await fetch(`${BASE}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ data: { attributes: { text } } }),
    });
    return handleResponse(res);
  },

  // ── WEBHOOKS ─────────────────────────────────────────────────────────────────
  getWebhooks: async (token) => {
    const res = await fetch(`${BASE}/webhooks?pagination=false`, { headers: getHeaders(token) });
    return handleResponse(res);
  },

  createWebhook: async (token, url, events) => {
    const res = await fetch(`${BASE}/webhooks`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ data: { attributes: { callback_url: url, event_mask: events } } }),
    });
    return handleResponse(res);
  },
};
