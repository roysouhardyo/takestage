import DodoPayments from 'dodopayments'

/**
 * Dodo Payments SDK client.
 *
 * ⚠️  Server-only. Never import in Client Components.
 *
 * The environment is controlled by DODO_PAYMENTS_ENVIRONMENT:
 *   - "test_mode"  → sandbox / test payments
 *   - "live_mode"  → real production payments
 */
export function createDodoClient(): DodoPayments {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY

  if (!apiKey) {
    throw new Error('Missing DODO_PAYMENTS_API_KEY environment variable.')
  }

  const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as
    | 'test_mode'
    | 'live_mode'

  return new DodoPayments({
    bearerToken: apiKey,
    environment,
  })
}
