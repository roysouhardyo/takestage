-- ============================================================
-- TakeStage — Database Cleanup
-- Run this in Supabase Dashboard → SQL Editor
-- Wipes all test/dummy stage data and resets to a clean slate.
-- ============================================================

-- 1. Delete all events
DELETE FROM events;

-- 2. Delete all payments
DELETE FROM payments;

-- 3. Delete all stages (clears everything — active, pending, completed, taken_over, cancelled)
DELETE FROM stages;

-- 4. Reset sequences (optional — makes IDs start fresh)
-- UUID columns don't use sequences, so nothing to reset.

-- 5. Confirm clean state
SELECT
  (SELECT COUNT(*) FROM stages)  AS stages_remaining,
  (SELECT COUNT(*) FROM payments) AS payments_remaining,
  (SELECT COUNT(*) FROM events)   AS events_remaining;
