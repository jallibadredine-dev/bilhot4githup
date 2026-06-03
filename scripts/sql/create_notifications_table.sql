-- Create pgcrypto extension if available (needed for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Notifications table used by backend to log admin/user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  level text DEFAULT 'info',
  meta jsonb,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  seen boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications (created_at DESC);
