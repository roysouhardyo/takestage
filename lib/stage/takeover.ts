/**
 * TakeStage — Shared Takeover Utility Functions
 *
 * The takeover rule: a new purchaser must buy more time than the
 * CURRENT REMAINING TIME on the active stage (not the original duration).
 *
 * Rounding: always ceil. Partial minutes count as a full minute.
 *   12:30 remaining → 13 min remaining → buy 14+
 *   00:30 remaining →  1 min remaining → buy 2+
 *   00:00 remaining →  0 min remaining → stage is open (buy 10+ min fresh)
 */

import type { Stage } from '@/types'

/** Minimum duration for a fresh (no active stage) purchase in minutes. */
export const MINIMUM_FRESH_STAGE_MINUTES = 10

/**
 * Compute remaining minutes from an expiry timestamp.
 * Uses ceiling so that any partial minute counts as a full minute.
 * Returns 0 if expired or no expiry is set.
 */
export function computeRemainingMinutes(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  const remainingMs = new Date(expiresAt).getTime() - Date.now()
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / 60_000)
}

/**
 * Compute remaining seconds (raw, not ceiled) for display purposes.
 * Returns 0 if expired.
 */
export function computeRemainingSeconds(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0
  const remainingMs = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.floor(remainingMs / 1000))
}

/**
 * Compute the minimum number of minutes a new purchaser must buy to take over
 * the current stage (or start a fresh one).
 *
 * Rules:
 * - If no active stage (or expired):    returns MINIMUM_FRESH_STAGE_MINUTES (10)
 * - If active stage with time left:     returns ceil(remaining) + 1
 * - If active stage with 0 remaining:  returns MINIMUM_FRESH_STAGE_MINUTES (10)
 */
export function computeMinimumTakeoverMinutes(currentStage: Stage | null | undefined): number {
  if (!currentStage || !currentStage.expires_at) return MINIMUM_FRESH_STAGE_MINUTES
  const remaining = computeRemainingMinutes(currentStage.expires_at)
  if (remaining <= 0) return MINIMUM_FRESH_STAGE_MINUTES
  return remaining + 1
}

/**
 * Server-side computation for API routes.
 * Identical logic but explicitly takes now as a parameter for testability.
 */
export function computeRemainingMinutesAt(expiresAt: string | null | undefined, now: Date): number {
  if (!expiresAt) return 0
  const remainingMs = new Date(expiresAt).getTime() - now.getTime()
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / 60_000)
}

export function computeMinimumTakeoverMinutesAt(
  currentStage: { expires_at: string | null } | null | undefined,
  now: Date,
): number {
  if (!currentStage || !currentStage.expires_at) return MINIMUM_FRESH_STAGE_MINUTES
  const remaining = computeRemainingMinutesAt(currentStage.expires_at, now)
  if (remaining <= 0) return MINIMUM_FRESH_STAGE_MINUTES
  return remaining + 1
}
