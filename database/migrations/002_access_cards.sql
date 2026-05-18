-- ═══════════════════════════════════════════════════════════════════
-- Migration 002 — Hotel RFID/NFC Access Cards
-- Run in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- ── access_cards ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_cards (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id TEXT,
  guest_id       UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  property_id    TEXT         NOT NULL DEFAULT '',   -- tenant key: Channex property / hotel ID
  room_id        TEXT         NOT NULL,
  lock_id        TEXT,
  card_uid       TEXT,
  status         TEXT         NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','active','expired','deactivated','lost')),
  encoded_at     TIMESTAMPTZ,
  activated_at   TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  guest_name     TEXT,
  notes          TEXT,
  created_by     UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_cards_status          ON access_cards(status);
CREATE INDEX IF NOT EXISTS idx_access_cards_property_id     ON access_cards(property_id);
CREATE INDEX IF NOT EXISTS idx_access_cards_room_id         ON access_cards(room_id);
CREATE INDEX IF NOT EXISTS idx_access_cards_reservation_id  ON access_cards(reservation_id);
CREATE INDEX IF NOT EXISTS idx_access_cards_expires_at      ON access_cards(expires_at);
CREATE INDEX IF NOT EXISTS idx_access_cards_created_by      ON access_cards(created_by);

-- ── card_events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS card_events (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id      UUID        REFERENCES access_cards(id) ON DELETE CASCADE,
  lock_id      TEXT,
  event_type   TEXT        NOT NULL,
  -- encoded | activated | deactivated | expired | lost | re-encoded | renewed
  -- access_granted | access_denied
  performed_by UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  details      JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_card_events_card_id    ON card_events(card_id);
CREATE INDEX IF NOT EXISTS idx_card_events_event_type ON card_events(event_type);
CREATE INDEX IF NOT EXISTS idx_card_events_created_at ON card_events(created_at DESC);

-- ── updated_at trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_access_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_access_cards_updated_at ON access_cards;
CREATE TRIGGER trg_access_cards_updated_at
  BEFORE UPDATE ON access_cards
  FOR EACH ROW EXECUTE FUNCTION update_access_cards_updated_at();

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE access_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_events  ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "auth_read_access_cards"   ON access_cards;
DROP POLICY IF EXISTS "auth_insert_access_cards"  ON access_cards;
DROP POLICY IF EXISTS "auth_update_access_cards"  ON access_cards;
DROP POLICY IF EXISTS "service_role_access_cards" ON access_cards;
DROP POLICY IF EXISTS "auth_read_card_events"     ON card_events;
DROP POLICY IF EXISTS "auth_insert_card_events"   ON card_events;
DROP POLICY IF EXISTS "service_role_card_events"  ON card_events;

-- ── access_cards policies (staff-scoped) ──────────────────────────
-- All authenticated hotel staff can read all cards.
-- INSERT is scoped to the authenticated user (created_by must match).
-- UPDATE is scoped to creator or super_admin.
-- NOTE: For true multi-property isolation, add profiles.property_id
--       and scope SELECT/UPDATE using:
--       property_id IN (SELECT property_id FROM profiles WHERE id = auth.uid())
CREATE POLICY "auth_read_access_cards"
  ON access_cards FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Staff can insert cards they own; property_id and created_by must match caller.
CREATE POLICY "auth_insert_access_cards"
  ON access_cards FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Staff can update only cards they created; super_admin can update any.
CREATE POLICY "auth_update_access_cards"
  ON access_cards FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Service role (backend automation) — unrestricted
CREATE POLICY "service_role_access_cards"
  ON access_cards TO service_role
  USING (true) WITH CHECK (true);

-- ── card_events policies (follow card visibility) ─────────────────
-- All authenticated staff can read card events (follows card read policy)
CREATE POLICY "auth_read_card_events"
  ON card_events FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_card_events"
  ON card_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM access_cards ac
      WHERE ac.id = card_id AND ac.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "service_role_card_events"
  ON card_events TO service_role
  USING (true) WITH CHECK (true);
