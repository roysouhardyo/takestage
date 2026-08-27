-- ============================================================
-- TakeStage — Migration 002: Atomic Stage Activation & Race Protection
-- ============================================================

CREATE OR REPLACE FUNCTION activate_stage_atomically(
  p_stage_id uuid,
  p_dodo_payment_id text,
  p_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pending_stage RECORD;
  v_active_stage  RECORD;
  v_now           timestamptz := now();
  v_expires_at    timestamptz;
  v_payment_type  text := 'stage_purchase';
BEGIN
  -- 1. Fetch pending stage record
  SELECT * INTO v_pending_stage
  FROM stages
  WHERE id = p_stage_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'stage_not_found');
  END IF;

  -- If stage was already activated, return idempotent success
  IF v_pending_stage.status = 'active' THEN
    RETURN jsonb_build_object('success', true, 'already_active', true);
  END IF;

  -- Calculate new expiration timestamp (full purchased duration)
  v_expires_at := v_now + (v_pending_stage.duration_minutes * interval '1 minute');

  -- 2. Lock current active stage for update (race condition protection)
  SELECT * INTO v_active_stage
  FROM stages
  WHERE status = 'active'
    AND (expires_at IS NULL OR expires_at > v_now)
  ORDER BY started_at DESC
  LIMIT 1
  FOR UPDATE;

  -- 3. Check Takeover Rule
  IF v_active_stage IS NOT NULL THEN
    v_payment_type := 'stage_takeover';

    -- TAKEOVER RULE: new original duration MUST be strictly > active original duration
    IF v_pending_stage.original_duration_minutes <= v_active_stage.original_duration_minutes THEN
      -- RACE CONDITION HIT: Another user activated a stage with equal or longer duration first!
      -- Mark stage as cancelled (queued for refund), record race event, do NOT activate!
      UPDATE stages
      SET status = 'cancelled',
          dodo_payment_id = p_dodo_payment_id
      WHERE id = p_stage_id;

      INSERT INTO events (event_type, stage_id, metadata)
      VALUES (
        'stage_completed', -- race condition notification
        p_stage_id,
        jsonb_build_object(
          'reason', 'takeover_race_condition',
          'attempted_minutes', v_pending_stage.original_duration_minutes,
          'active_minutes', v_active_stage.original_duration_minutes,
          'dodo_payment_id', p_dodo_payment_id
        )
      );

      RETURN jsonb_build_object(
        'success', false,
        'reason', 'race_condition_rejected',
        'active_original_minutes', v_active_stage.original_duration_minutes
      );
    END IF;

    -- Mark previous active stage as TAKEN OVER
    UPDATE stages
    SET status = 'taken_over'
    WHERE id = v_active_stage.id;

    -- Log takeover event
    INSERT INTO events (event_type, stage_id, metadata)
    VALUES (
      'stage_takeover',
      p_stage_id,
      jsonb_build_object(
        'old_stage_id', v_active_stage.id,
        'duration_minutes', v_pending_stage.duration_minutes,
        'domain', v_pending_stage.normalized_domain
      )
    );
  ELSE
    -- Log stage started event
    INSERT INTO events (event_type, stage_id, metadata)
    VALUES (
      'stage_started',
      p_stage_id,
      jsonb_build_object(
        'duration_minutes', v_pending_stage.duration_minutes,
        'domain', v_pending_stage.normalized_domain
      )
    );
  END IF;

  -- 4. Activate new stage
  UPDATE stages
  SET status = 'active',
      started_at = v_now,
      expires_at = v_expires_at,
      dodo_payment_id = p_dodo_payment_id
  WHERE id = p_stage_id;

  -- 5. Record payment entry
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
    p_dodo_payment_id,
    v_pending_stage.dodo_checkout_id,
    p_stage_id,
    p_amount,
    v_pending_stage.currency,
    'succeeded',
    v_payment_type
  )
  ON CONFLICT (dodo_payment_id) DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'stage_id', p_stage_id,
    'payment_type', v_payment_type,
    'expires_at', v_expires_at
  );
END;
$$;
