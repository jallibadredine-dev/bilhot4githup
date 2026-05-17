/**
 * HosFlow Automation Engine
 * Channex.io Booking → TTLock PIN Auto-Creation
 *
 * How it works:
 * 1. Polls Channex every N minutes for new confirmed bookings
 * 2. For each new booking, finds the mapped TTLock lockId (by property)
 * 3. Calls TTLock API to create a time-limited PIN (check-in → check-out)
 * 4. Persists the record in localStorage (booking_id → PIN mapping)
 * 5. Emits events so the UI can update in real-time
 */

import { channexAPI } from './channex';
import { ttlockAPI } from './ttlock';
import { sendPinNotifications } from './notifications';

const STORAGE_KEY = 'hosflow_automation_log';
const MAPPING_KEY = 'hosflow_property_lock_map';

// ── EventEmitter for UI updates ──────────────────────────────────────────────
class AutomationEmitter extends EventTarget {
  emit(event, detail) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }
}
export const automationEvents = new AutomationEmitter();

// ── Storage helpers ───────────────────────────────────────────────────────────
export const getAutomationLog = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const saveLog = (log) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, 200)));
};

const addLogEntry = (entry) => {
  const log = getAutomationLog();
  const newEntry = { ...entry, id: Date.now(), createdAt: new Date().toISOString() };
  log.unshift(newEntry);
  saveLog(log);
  automationEvents.emit('log', newEntry);
  return newEntry;
};

export const getPropertyLockMap = () => {
  try { return JSON.parse(localStorage.getItem(MAPPING_KEY) || '[]'); } catch { return []; }
};

export const savePropertyLockMap = (mappings) => {
  localStorage.setItem(MAPPING_KEY, JSON.stringify(mappings));
};

const getProcessedBookings = () => {
  try { return JSON.parse(localStorage.getItem('hosflow_processed_bookings') || '{}'); } catch { return {}; }
};

const markBookingProcessed = (bookingId, pin, lockId) => {
  const processed = getProcessedBookings();
  processed[bookingId] = { pin, lockId, processedAt: new Date().toISOString() };
  localStorage.setItem('hosflow_processed_bookings', JSON.stringify(processed));
};

// ── PIN Generator ─────────────────────────────────────────────────────────────
const generatePinForGuest = (guestName, arrivalDate) => {
  // 6-digit PIN: first 2 letters of name (ascii) + 4 digits from date
  const letterPart = (guestName || 'XX').toUpperCase().replace(/[^A-Z]/g, 'X').slice(0, 2);
  const num1 = letterPart.charCodeAt(0) % 10;
  const num2 = letterPart.charCodeAt(1) % 10;
  const datePart = (arrivalDate || '').replace(/-/g, '').slice(4, 8) || '0101';
  return `${num1}${num2}${datePart}`;
};

// ── Core Engine ───────────────────────────────────────────────────────────────
let engineInterval = null;
let engineRunning = false;

export const AutomationEngine = {
  get isRunning() { return engineRunning; },

  async runOnce(channexToken, ttlockToken) {
    if (!channexToken || !ttlockToken) return;

    const processed = getProcessedBookings();
    const mappings = getPropertyLockMap();

    let newBookings = 0;
    let pinsCreated = 0;
    let errors = 0;

    automationEvents.emit('cycle-start', { timestamp: new Date().toISOString() });

    try {
      // Fetch recent bookings from Channex
      const today = new Date();
      const dateFrom = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
      const dateTo = new Date(today.getTime() + 60 * 86400000).toISOString().split('T')[0];

      const bookingRes = await channexAPI.getBookings(channexToken, {
        'filter[arrival_date_from]': dateFrom,
        'filter[arrival_date_to]': dateTo,
        'filter[status]': 'confirmed',
      }).catch(() => null);

      const bookings = bookingRes?.data || [];
      newBookings = bookings.filter(b => !processed[b.id]).length;

      automationEvents.emit('bookings-fetched', { count: bookings.length, newCount: newBookings });

      for (const booking of bookings) {
        if (processed[booking.id]) continue;

        const attr = booking.attributes || {};
        const customer = attr.customer || {};
        const guestName = customer.name || 'Guest';
        const propertyId = attr.property_id;
        const arrivalDate = attr.arrival_date;
        const departureDate = attr.departure_date;

        if (!arrivalDate || !departureDate) {
          markBookingProcessed(booking.id, null, null);
          continue;
        }

        // Find matching lock by property ID or name
        const mapping = mappings.find(m =>
          m.channexPropertyId === propertyId ||
          m.channexPropertyId === attr.property_name
        );

        if (!mapping || !mapping.ttlockLockId) {
          addLogEntry({
            type: 'skip',
            status: 'warning',
            bookingId: booking.id,
            guestName,
            message: `Réservation ${booking.id} — aucun verrou mappé pour la propriété "${propertyId || 'inconnue'}"`,
            propertyId,
          });
          markBookingProcessed(booking.id, null, null);
          continue;
        }

        // Generate PIN
        const pin = generatePinForGuest(guestName, arrivalDate);
        const startMs = new Date(arrivalDate + 'T14:00:00').getTime();
        const endMs = new Date(departureDate + 'T12:00:00').getTime();

        try {
          await ttlockAPI.createPasscode(ttlockToken, mapping.ttlockLockId, {
            passcode: pin,
            passcodeName: `Hova · ${guestName} · Rés.${booking.id.slice(0, 6)}`,
            startDate: startMs,
            endDate: endMs,
            type: 1,
          });

          markBookingProcessed(booking.id, pin, mapping.ttlockLockId);
          pinsCreated++;

          addLogEntry({
            type: 'pin-created',
            status: 'success',
            bookingId: booking.id,
            guestName,
            pin,
            lockId: mapping.ttlockLockId,
            lockName: mapping.lockName || `Lock ${mapping.ttlockLockId}`,
            arrivalDate,
            departureDate,
            message: `PIN ${pin} créé pour ${guestName} · Arrivée ${arrivalDate} → Départ ${departureDate}`,
          });

          // Fire notifications (email + WhatsApp) — best effort, don't fail the loop
          try {
            const notifResults = await sendPinNotifications({
              guestName,
              guestEmail:  customer.email || '',
              guestPhone:  customer.phone || '',
              propertyName: mapping.propertyName || propertyId,
              pin,
              lockName: mapping.lockName || `Lock ${mapping.ttlockLockId}`,
              arrivalDate,
              departureDate,
              bookingId: booking.id,
            });

            if (notifResults.email?.success) {
              addLogEntry({
                type: 'notification',
                status: 'success',
                bookingId: booking.id,
                guestName,
                message: `Email envoyé à ${customer.email} pour ${guestName}`,
              });
            }
          } catch (notifErr) {
            // Notification failures are non-critical
          }
        } catch (err) {
          errors++;
          addLogEntry({
            type: 'error',
            status: 'error',
            bookingId: booking.id,
            guestName,
            pin,
            lockId: mapping.ttlockLockId,
            message: `Échec création PIN pour ${guestName}: ${err.message}`,
          });
        }
      }
    } catch (err) {
      errors++;
      addLogEntry({
        type: 'error',
        status: 'error',
        message: `Erreur cycle automation: ${err.message}`,
      });
    }

    const summary = {
      timestamp: new Date().toISOString(),
      newBookings,
      pinsCreated,
      errors,
    };

    automationEvents.emit('cycle-end', summary);
    return summary;
  },

  start(channexToken, ttlockToken, intervalMinutes = 5) {
    if (engineRunning) this.stop();
    engineRunning = true;

    addLogEntry({
      type: 'engine-start',
      status: 'info',
      message: `Moteur démarré · Cycle toutes les ${intervalMinutes} min`,
    });

    automationEvents.emit('status', { running: true });

    // Run immediately, then on interval
    this.runOnce(channexToken, ttlockToken);
    engineInterval = setInterval(() => {
      this.runOnce(channexToken, ttlockToken);
    }, intervalMinutes * 60 * 1000);
  },

  stop() {
    if (engineInterval) { clearInterval(engineInterval); engineInterval = null; }
    engineRunning = false;

    addLogEntry({
      type: 'engine-stop',
      status: 'info',
      message: 'Moteur arrêté',
    });

    automationEvents.emit('status', { running: false });
  },

  clearLog() {
    localStorage.removeItem(STORAGE_KEY);
    automationEvents.emit('log-cleared', {});
  },

  clearProcessed() {
    localStorage.removeItem('hosflow_processed_bookings');
  },
};
