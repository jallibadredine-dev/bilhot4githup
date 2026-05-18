-- Migration: Add onboarding qualification columns to profiles table
-- Task #21 — Multi-step onboarding wizard + 14-day trial

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS establishment_type   TEXT,
  ADD COLUMN IF NOT EXISTS establishment_custom TEXT,
  ADD COLUMN IF NOT EXISTS unit_count_range     TEXT,
  ADD COLUMN IF NOT EXISTS business_name        TEXT,
  ADD COLUMN IF NOT EXISTS phone                TEXT,
  ADD COLUMN IF NOT EXISTS address              TEXT,
  ADD COLUMN IF NOT EXISTS city                 TEXT,
  ADD COLUMN IF NOT EXISTS postal_code          TEXT,
  ADD COLUMN IF NOT EXISTS country              TEXT,
  ADD COLUMN IF NOT EXISTS website              TEXT,
  ADD COLUMN IF NOT EXISTS primary_need         TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at        TIMESTAMPTZ;

-- Update any existing 'starter' plan users to 'trial' if they have no plan set
-- (Only run once — safe due to IF NOT EXISTS above)
UPDATE profiles
  SET plan = 'trial',
      trial_ends_at = NOW() + INTERVAL '14 days'
  WHERE plan = 'starter'
    AND trial_ends_at IS NULL;

-- Index for trial expiry queries
CREATE INDEX IF NOT EXISTS profiles_trial_ends_at_idx ON profiles (trial_ends_at)
  WHERE plan = 'trial';
