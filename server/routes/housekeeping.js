import express from 'express';

const router = express.Router();

/* In-memory room state (falls back when no DB) */
const roomStates = new Map();

/* ── POST /api/housekeeping/status-update ──────────────────────
   Called by IoT devices (Shelly, Sonoff, Zigbee modules, etc.)
   Body: { room_number, status, trigger, device_id?, timestamp? }
─────────────────────────────────────────────────────────────── */
const VALID_STATUSES = ['clean', 'dirty', 'in_progress', 'dnd', 'inspection', 'maintenance'];

router.post('/status-update', async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  const { room_number, status, trigger = 'webhook', device_id, timestamp } = req.body;

  if (!room_number || !status) {
    return res.status(400).json({ error: 'room_number and status are required' });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const event = {
    room_number: String(room_number),
    status,
    trigger,
    device_id: device_id || null,
    timestamp: timestamp || new Date().toISOString(),
    received_at: new Date().toISOString(),
    ip: req.ip || req.connection?.remoteAddress || '—',
  };

  /* Store latest state in memory */
  roomStates.set(String(room_number), event);

  /* Try to update Supabase if configured */
  try {
    const supabaseUrl  = process.env.VITE_SUPABASE_URL  || process.env.SUPABASE_URL;
    const supabaseKey  = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase
        .from('rooms')
        .update({
          housekeeping_status: status,
          last_iot_trigger:    trigger,
          last_iot_device:     device_id || null,
          updated_at:          event.timestamp,
        })
        .eq('name', String(room_number));

      if (error) {
        console.warn(`[Housekeeping] Supabase update warning for room ${room_number}:`, error.message);
      } else {
        console.log(`[Housekeeping] ✓ Room ${room_number} → ${status} (${trigger})`);
      }
    }
  } catch (err) {
    console.error('[Housekeeping] Supabase update error:', err.message);
  }

  return res.status(200).json({
    success: true,
    room_number,
    status,
    trigger,
    message: `Room ${room_number} status updated to "${status}"`,
  });
});

/* ── GET /api/housekeeping/rooms ────────────────────────────────
   Returns current in-memory room states (for debugging / mobile app)
─────────────────────────────────────────────────────────────── */
router.get('/rooms', (_req, res) => {
  const rooms = Array.from(roomStates.entries()).map(([room_number, state]) => ({
    room_number,
    ...state,
  }));
  res.json({ rooms, count: rooms.length, timestamp: new Date().toISOString() });
});

/* ── GET /api/housekeeping/ping ─────────────────────────────── */
router.get('/ping', (_req, res) => {
  res.json({ status: 'ok', service: 'housekeeping-webhook', timestamp: new Date().toISOString() });
});

export default router;
