-- ============================================================
-- TakeStage — Migration 003: Remaining-Time Takeover Validation
-- ============================================================
--
-- Changes the takeover rule from:
--   new_duration > active.original_duration_minutes
-- To:
--   new_duration > ceil((active.expires_at - now()) / 60 seconds)
--
-- This means the minimum takeover is based on REMAINING TIME,
-- not the original purchased duration.
--
-- Also sets up the click_count column if missing.
-- ============================================================

-- Add click_count column if it doesn't exist
ALTER TABLE stages ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

-- ─── NEW FUNCTION: activate_stage_with_remaining_time ─────────────────────────
-- Used by both the Polar webhook and the simulate-payment test endpoint.
-- Atomically:
--   1. Locks the pending stage row
--   2. Locks the current active stage row (FOR UPDATE — prevents race conditions)
--   3. Computes remaining minutes from server clock
--   4. Validates new_duration > remaining_minutes
--   5. Marks old stage as taken_over, activates new stage

CREATE OR REPLACE FUNCTION activate_stage_with_remaining_time(
  p_stage_id  uuid,
  p_payment_id text,
  p_amount    integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending       RECORD;
  v_active        RECORD;
  v_now           timestamptz := now();
  v_remaining_sec numeric;
  v_remaining_min integer;
  v_minimum_min   integer;
  v_expires_at    timestamptz;
  v_payment_type  text := 'stage_purchase';
BEGIN
  -- 1. Lock the pending stage to prevent concurrent activations
  SELECT * INTO v_pending
  FROM stages
  WHERE id = p_stage_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'stage_not_found');
  END IF;

  -- Idempotent: already activated
  IF v_pending.status = 'active' THEN
    RETURN jsonb_build_object('success', true, 'already_active', true);
  END IF;

  -- 2. Lock current active stage (if any) — prevents race conditions
  SELECT * INTO v_active
  FROM stages
  WHERE status = 'active'
    AND (expires_at IS NULL OR expires_at > v_now)
  ORDER BY started_at DESC
  LIMIT 1
  FOR UPDATE;

  -- 3. Validate takeover against REMAINING TIME
  IF v_active IS NOT NULL THEN
    v_payment_type := 'stage_takeover';

    -- Compute remaining seconds and ceil to whole minutes
    v_remaining_sec := EXTRACT(EPOCH FROM (v_active.expires_at - v_now));
    v_remaining_min := GREATEST(0, CEIL(v_remaining_sec / 60.0)::integer);
    v_minimum_min   := v_remaining_min + 1;

    -- Reject if not enough duration purchased
    IF v_pending.duration_minutes <= v_remaining_min THEN
      UPDATE stages
      SET status = 'cancelled',
          dodo_payment_id = p_payment_id
      WHERE id = p_stage_id;

      INSERT INTO events (event_type, stage_id, metadata)
      VALUES (
        'stage_completed',
        p_stage_id,
        jsonb_build_object(
          'reason', 'insufficient_duration_for_takeover',
          'purchased_minutes', v_pending.duration_minutes,
          'remaining_minutes', v_remaining_min,
          'minimum_required', v_minimum_min,
          'payment_id', p_payment_id
        )
      );

      RETURN jsonb_build_object(
        'success', false,
        'reason', 'insufficient_duration',
        'remaining_minutes', v_remaining_min,
        'minimum_required', v_minimum_min
      );
    END IF;

    -- Mark previous active stage as TAKEN OVER
    UPDATE stages
    SET status = 'taken_over'
    WHERE id = v_active.id;

    -- Log takeover event
    INSERT INTO events (event_type, stage_id, metadata)
    VALUES (
      'stage_takeover',
      p_stage_id,
      jsonb_build_object(
        'old_stage_id', v_active.id,
        'old_domain', v_active.normalized_domain,
        'purchased_minutes', v_pending.duration_minutes,
        'remaining_minutes', v_remaining_min,
        'domain', v_pending.normalized_domain
      )
    );
  ELSE
    -- Fresh stage started
    INSERT INTO events (event_type, stage_id, metadata)
    VALUES (
      'stage_started',
      p_stage_id,
      jsonb_build_object(
        'duration_minutes', v_pending.duration_minutes,
        'domain', v_pending.normalized_domain
      )
    );
  END IF;

  -- 4. Activate new stage from server timestamp
  v_expires_at := v_now + (v_pending.duration_minutes * interval '1 minute');

  UPDATE stages
  SET status       = 'active',
      started_at   = v_now,
      expires_at   = v_expires_at,
      dodo_payment_id = p_payment_id
  WHERE id = p_stage_id;

  -- 5. Record payment
  INSERT INTO payments (
    dodo_payment_id,
    dodo_checkout_id,
    stage_id,
    amount,
    currency,
    status,
    payment_type
  )
  VALUES (
    p_payment_id,
    v_pending.dodo_checkout_id,
    p_stage_id,
    p_amount,
    v_pending.currency,
    'succeeded',
    v_payment_type
  )
  ON CONFLICT (dodo_payment_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'stage_id', p_stage_id,
    'payment_type', v_payment_type,
    'expires_at', v_expires_at,
    'remaining_minutes_replaced', v_remaining_min
  );
END;
$$;

-- ─── ALSO update the expire_stages function to run more reliably ───────────────
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
