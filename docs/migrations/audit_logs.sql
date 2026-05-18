-- ═══════════════════════════════════════
-- Migration: audit_logs table
-- Exécutez ce SQL dans votre Supabase dashboard
-- SQL Editor → New Query → Run
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email  text,
  action      text NOT NULL,
  resource    text,
  type        text DEFAULT 'system',
  created_at  timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (used by backend only)
CREATE POLICY "service_role_full_access"
  ON public.audit_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

-- Index by type for filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_type
  ON public.audit_logs (type);
