import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifies a Dodo Payments webhook using the Standard Webhooks format.
 *
 * Standard Webhooks spec headers:
 *   - webhook-id        : unique message ID
 *   - webhook-timestamp : Unix timestamp (seconds)
 *   - webhook-signature : space-separated list of "v1,<base64-hmac-sha256>" signatures
 *
 * Verification algorithm:
 *   signed_content = "{webhook-id}.{webhook-timestamp}.{raw-body}"
 *   expected = HMAC-SHA256(signed_content, secret)
 *   compare base64(expected) against each signature value
 *
 * Reference: https://www.standardwebhooks.com/
 */

const WEBHOOK_TOLERANCE_SECONDS = 300 // 5 minutes replay attack window

export interface WebhookVerificationResult {
  valid: boolean
  error?: string
  payload?: Record<string, unknown>
}

export function verifyDodoWebhook(
  rawBody: string,
  headers: {
    'webhook-id'?: string | null
    'webhook-timestamp'?: string | null
    'webhook-signature'?: string | null
  },
): WebhookVerificationResult {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY

  if (!secret) {
    return { valid: false, error: 'Webhook secret not configured.' }
  }

  const webhookId = headers['webhook-id']
  const webhookTimestamp = headers['webhook-timestamp']
  const webhookSignature = headers['webhook-signature']

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return { valid: false, error: 'Missing required webhook headers.' }
  }

  // ── Timestamp tolerance check ───────────────────────────────────────────────
  const timestampSeconds = parseInt(webhookTimestamp, 10)
  if (isNaN(timestampSeconds)) {
    return { valid: false, error: 'Invalid webhook timestamp.' }
  }
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSeconds - timestampSeconds) > WEBHOOK_TOLERANCE_SECONDS) {
    return { valid: false, error: 'Webhook timestamp is too old or too far in the future.' }
  }

  // ── Compute expected signature ──────────────────────────────────────────────
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`

  // The secret may be base64-encoded (Standard Webhooks style: "whsec_<base64>")
  let keyBuffer: Buffer
  if (secret.startsWith('whsec_')) {
    keyBuffer = Buffer.from(secret.slice(6), 'base64')
  } else {
    keyBuffer = Buffer.from(secret, 'utf8')
  }

  const expectedHmac = createHmac('sha256', keyBuffer)
    .update(signedContent, 'utf8')
    .digest('base64')

  // ── Compare against provided signatures ────────────────────────────────────
  // The header may contain multiple space-separated signatures (key rotation)
  const signatures = webhookSignature.split(' ')
  const expectedBuffer = Buffer.from(`v1,${expectedHmac}`, 'utf8')

  let matched = false
  for (const sig of signatures) {
    const sigBuffer = Buffer.from(sig.trim(), 'utf8')
    if (
      sigBuffer.length === expectedBuffer.length &&
      timingSafeEqual(expectedBuffer, sigBuffer)
    ) {
      matched = true
      break
    }
  }

  if (!matched) {
    return { valid: false, error: 'Webhook signature mismatch.' }
  }

  // ── Parse payload ───────────────────────────────────────────────────────────
  try {
    const payload = JSON.parse(rawBody) as Record<string, unknown>
    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'Failed to parse webhook payload as JSON.' }
  }
}
