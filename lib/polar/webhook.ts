import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * Verify Polar Webhook Signature
 */
export function verifyPolarWebhookSignature(
  payload: string,
  signature: string | null,
  webhookSecret: string
): boolean {
  if (!signature || !webhookSecret) return false

  try {
    const hmac = crypto.createHmac('sha256', webhookSecret)
    const digest = hmac.update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

/**
 * Process Polar Payment Success Event
 */
export async function processPolarPaymentSuccess(paymentData: {
  paymentId: string
  stageId: string
  amount: number
}) {
  const { paymentId, stageId, amount } = paymentData
  const supabase = createServerClient()

  // 1. Call atomic database function to activate stage & handle instant takeover
  // Uses remaining-time validation (new mechanic from migration 003)
  const { data, error } = await supabase.rpc('activate_stage_with_remaining_time', {
    p_stage_id: stageId,
    p_payment_id: paymentId,
    p_amount: amount,
  })

  if (error) {
    console.error('[Polar Webhook] RPC Execution Error:', error)
    throw new Error(`RPC execution failed: ${error.message}`)
  }

  // 2. Log payment event
  await supabase.from('events').insert({
    event_type: 'payment_success',
    stage_id: stageId,
    metadata: {
      polar_payment_id: paymentId,
      amount,
      rpc_result: data,
    },
  })

  return data
}
