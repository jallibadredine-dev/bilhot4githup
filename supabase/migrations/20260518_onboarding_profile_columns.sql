-- Migration: Add onboarding qualification columns to profiles table
-- Task #21 — Multi-step onboarding wizard + 14-day trial
-- Run this in Supabase Dashboard > SQL Editor (or via Supabase CLI)

-- Ensure plan column exists (may already be present in some environments)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'trial';

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

-- Index for trial expiry queries
CREATE INDEX IF NOT EXISTS profiles_trial_ends_at_idx ON profiles (trial_ends_at)
  WHERE plan = 'trial';
