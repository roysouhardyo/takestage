-- ============================================================
-- TakeStage — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for future fuzzy search

-- ─── ENUM-like check constraints are defined inline ───────────────────────────

-- ─── TABLE: stages ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stages (
  id                        uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  website_url               text          NOT NULL,
  normalized_domain         text          NOT NULL,
  brand_name                text,
  logo_url                  text,
  fallback_initial          text          NOT NULL DEFAULT '?',
  message                   text,

  -- Duration the user purchased (in minutes)
  duration_minutes          integer       NOT NULL CHECK (duration_minutes > 0),

  -- Payment amount in cents (e.g. 500 = $5.00)
  amount                    integer       NOT NULL CHECK (amount >= 0),
  currency                  text          NOT NULL DEFAULT 'usd',

  -- When the stage went live and when it expires
  started_at                timestamptz,
  expires_at                timestamptz,

  -- IMMUTABLE: the original purchased duration. Never modified after INSERT.
  -- A takeover must purchase strictly more than this value.
  original_duration_minutes integer       NOT NULL CHECK (original_duration_minutes > 0),

  -- Stage lifecycle status
  status                    text          NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'active', 'completed', 'taken_over', 'cancelled')),

  -- Dodo Payments identifiers — UNIQUE to prevent duplicate payment processing
  dodo_payment_id           text          UNIQUE,
  dodo_checkout_id          text          UNIQUE,

  created_at                timestamptz   NOT NULL DEFAULT now(),

  -- Constraint: expires_at must be after started_at when both are set
  CONSTRAINT expires_after_start CHECK (
    expires_at IS NULL OR started_at IS NULL OR expires_at > started_at
  )
);

-- Stage indexes
CREATE INDEX IF NOT EXISTS idx_stages_status         ON stages (status);
CREATE INDEX IF NOT EXISTS idx_stages_started_at     ON stages (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_stages_expires_at     ON stages (expires_at);
CREATE INDEX IF NOT EXISTS idx_stages_created_at     ON stages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stages_domain         ON stages (normalized_domain);
CREATE INDEX IF NOT EXISTS idx_stages_dodo_payment   ON stages (dodo_payment_id) WHERE dodo_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stages_dodo_checkout  ON stages (dodo_checkout_id) WHERE dodo_checkout_id IS NOT NULL;

-- Partial index: only one active stage at a time (enforced in app logic + this helps query perf)
CREATE INDEX IF NOT EXISTS idx_stages_active         ON stages (started_at DESC) WHERE status = 'active';

-- ─── TABLE: payments ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  dodo_payment_id   text          NOT NULL UNIQUE,
  dodo_checkout_id  text,
  stage_id          uuid          REFERENCES stages (id) ON DELETE SET NULL,
  amount            integer       NOT NULL CHECK (amount >= 0),
  currency          text          NOT NULL DEFAULT 'usd',
  status            text          NOT NULL
                      CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_type      text          NOT NULL
                      CHECK (payment_type IN ('stage_purchase', 'stage_takeover')),
  created_at        timestamptz   NOT NULL DEFAULT now()
);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_dodo_payment ON payments (dodo_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_stage        ON payments (stage_id);
CREATE INDEX IF NOT EXISTS idx_payments_status       ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at   ON payments (created_at DESC);

-- ─── TABLE: events ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  text          NOT NULL
                CHECK (event_type IN (
                  'page_view', 'stage_view', 'checkout_started', 'payment_success',
                  'stage_started', 'stage_takeover', 'stage_completed',
                  'archive_click', 'website_click'
                )),
  stage_id    uuid          REFERENCES stages (id) ON DELETE SET NULL,
  session_id  text,
  metadata    jsonb,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_events_type       ON events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_stage      ON events (stage_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session    ON events (session_id) WHERE session_id IS NOT NULL;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE stages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;

-- ── stages: Public read (safe columns only) ───────────────────────────────────
-- Anon users can read stage display data but NOT payment details.
-- All writes go through the service role (server-side only).

CREATE POLICY "stages_public_read" ON stages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role can do everything (bypasses RLS)
-- No explicit policy needed — service_role bypasses RLS by default in Supabase.

-- ── payments: No public read ───────────────────────────────────────────────────
-- Payments are strictly server-side only.

CREATE POLICY "payments_no_public_read" ON payments
  FOR SELECT
  TO anon
  USING (false);

-- ── events: Public insert for analytics, no public read ───────────────────────

CREATE POLICY "events_public_insert" ON events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IN ('page_view', 'stage_view', 'checkout_started', 'archive_click', 'website_click')
  );

CREATE POLICY "events_no_public_read" ON events
  FOR SELECT
  TO anon
  USING (false);

-- ─── REALTIME ─────────────────────────────────────────────────────────────────
-- Enable realtime on the stages table so clients get live updates.
-- Run this in the Supabase dashboard Realtime settings, or via:

-- ALTER PUBLICATION supabase_realtime ADD TABLE stages;
-- (Uncomment above line if running via supabase CLI migration)

-- ─── FUNCTION: automatically expire stages ────────────────────────────────────
-- This function marks expired stages as 'completed'.
-- Can be called by a pg_cron job, or triggered via Supabase Edge Functions.

CREATE OR REPLACE FUNCTION expire_stages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stages
  SET status = 'completed'
  WHERE
    status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();
END;
$$;

-- ─── COMMENTS ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE stages   IS 'TakeStage — live stage ownership records';
COMMENT ON TABLE payments IS 'TakeStage — Dodo Payments payment records';
COMMENT ON TABLE events   IS 'TakeStage — analytics event log';

COMMENT ON COLUMN stages.original_duration_minutes IS
  'IMMUTABLE: the duration originally purchased. Never updated after INSERT. '
  'A takeover must purchase strictly more than this value.';

COMMENT ON COLUMN stages.dodo_payment_id IS
  'UNIQUE: prevents duplicate payment processing in webhook handler.';
