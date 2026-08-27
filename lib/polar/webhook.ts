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
  const { data, error } = await supabase.rpc('activate_stage_atomically', {
    p_stage_id: stageId,
    p_dodo_payment_id: paymentId, // Uses stored column identifier
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
