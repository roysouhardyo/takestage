import { PricingTier } from '@/types'

/**
 * Canonical duration tiers for TakeStage.
 *
 * Pricing: $1/min base, slight discount for longer durations.
 * Takeover rule: new purchase must be strictly greater than the current
 * stage's original_duration_minutes.
 */
export const PRICING_TIERS: PricingTier[] = [
  { minutes: 1,  price_cents: 100,  label: '1 min',  tag: undefined },
  { minutes: 2,  price_cents: 200,  label: '2 min',  tag: undefined },
  { minutes: 5,  price_cents: 500,  label: '5 min',  tag: undefined },
  { minutes: 10, price_cents: 900,  label: '10 min', tag: 'Popular' },
  { minutes: 15, price_cents: 1200, label: '15 min', tag: undefined },
  { minutes: 30, price_cents: 2000, label: '30 min', tag: 'Best Value' },
  { minutes: 60, price_cents: 3500, label: '60 min', tag: undefined },
]

/**
 * Returns all tiers that are strictly greater than the given minutes.
 * Used to filter the duration picker during a takeover.
 */
export function getAvailableTakeovers(currentOriginalMinutes: number): PricingTier[] {
  return PRICING_TIERS.filter((t) => t.minutes > currentOriginalMinutes)
}

/**
 * Returns all tiers (used when the stage is empty).
 */
export function getAllTiers(): PricingTier[] {
  return PRICING_TIERS
}

/**
 * Look up a specific tier by minutes. Returns null if not a valid tier.
 */
export function getTierByMinutes(minutes: number): PricingTier | null {
  return PRICING_TIERS.find((t) => t.minutes === minutes) ?? null
}

/**
 * Format cents as a display price string.
 * e.g. 500 → "$5.00"
 */
export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Format minutes as a human-readable duration string.
 * e.g. 90 → "1h 30m", 5 → "5 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
