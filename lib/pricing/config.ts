/**
 * Server-authoritative pricing configuration.
 *
 * Locked mechanic: $1 per minute (100 cents / min).
 * All pricing is calculated server-side only. Client prices are purely for display.
 */

export interface PricingConfig {
  /** Base price per minute in USD cents ($1.00 = 100) */
  price_per_minute_cents: number
  /** Minimum allowable duration in minutes for a fresh (no active stage) purchase */
  minimum_duration_minutes: number
  /** Maximum allowable duration in minutes (24 hours = 1440 min) */
  maximum_duration_minutes: number
  /** Currency code */
  currency: string
}

export const PRICING_CONFIG: PricingConfig = {
  price_per_minute_cents: 100, // $1 per minute
  minimum_duration_minutes: 10, // Minimum 10 minutes for a fresh stage
  maximum_duration_minutes: 1440, // 24 hours
  currency: 'usd',
}

/**
 * Calculates authoritative total price in cents for a given duration in minutes.
 * Server-side source of truth.
 */
export function calculatePriceCents(durationMinutes: number): number {
  const clamped = Math.max(
    PRICING_CONFIG.minimum_duration_minutes,
    Math.min(PRICING_CONFIG.maximum_duration_minutes, Math.floor(durationMinutes)),
  )
  return clamped * PRICING_CONFIG.price_per_minute_cents
}

export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Default preset duration options for a fresh stage (no active stage).
 * Minimum is 10 minutes.
 */
export const DEFAULT_PRESET_TIERS = [
  { minutes: 10,  label: '10 MIN' },
  { minutes: 15,  label: '15 MIN' },
  { minutes: 30,  label: '30 MIN' },
  { minutes: 60,  label: '1 HOUR' },
  { minutes: 120, label: '2 HOURS' },
]

/**
 * Default preset takeover duration options.
 * These are filtered at runtime based on the minimum required duration.
 */
export const TAKEOVER_PRESET_TIERS = [
  { minutes: 10,   label: '10 MIN' },
  { minutes: 15,   label: '15 MIN' },
  { minutes: 30,   label: '30 MIN' },
  { minutes: 60,   label: '1 HOUR' },
  { minutes: 120,  label: '2 HOURS' },
  { minutes: 300,  label: '5 HOURS' },
  { minutes: 600,  label: '10 HOURS' },
  { minutes: 900,  label: '15 HOURS' },
  { minutes: 1440, label: '24 HOURS' },
]
