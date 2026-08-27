import { createDodoClient } from '@/lib/dodo/client'
import { verifyDodoWebhook } from '@/lib/dodo/webhook'
import { createServerClient } from '@/lib/supabase/server'
import { calculatePriceCents } from '@/lib/pricing/config'

export interface CreateCheckoutInput {
  stageId: string
  websiteUrl: string
  domain: string
  durationMinutes: number
  sessionId?: string
}

/**
 * Phase 14 & 15 — Server-side Dodo Payment Service.
 * Exposes createCheckout, getPayment, handleWebhook.
 */

export async function createDodoCheckout(input: CreateCheckoutInput) {
  const dodo = createDodoClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const amountCents = calculatePriceCents(input.durationMinutes)

  const session = await dodo.payments.create({
    billing: {
      city: 'City',
      country: 'US',
      state: 'State',
      street: 'Street',
      zipcode: '10001',
    },
    customer: {
      email: `stage_${input.stageId.slice(0, 8)}@takestage.app`,
      name: input.domain,
    },
    product_cart: [
      {
        product_id: process.env.DODO_PAYMENTS_PRODUCT_ID || 'p_takestage_time',
        quantity: input.durationMinutes,
      },
    ],
    return_url: `${siteUrl}/?success=true&stage_id=${input.stageId}`,
    metadata: {
      stage_id: input.stageId,
      duration_minutes: String(input.durationMinutes),
      session_id: input.sessionId || '',
      amount_cents: String(amountCents),
    },
  })

  return {
    checkoutUrl: session.payment_link,
    paymentId: session.payment_id,
  }
}

/**
 * Phase 16 & 17 & 18 — Webhook Processor with Signature Verification & Atomic DB Activation
 */
export async function processDodoWebhook(
  rawBody: string,
  headers: {
    'webhook-id'?: string | null
    'webhook-timestamp'?: string | null
    'webhook-signature'?: string | null
  },
) {
  // 1. Signature Verification
  const verification = verifyDodoWebhook(rawBody, headers)
  if (!verification.valid || !verification.payload) {
    return { success: false, error: verification.error || 'Invalid webhook signature', status: 401 }
  }

  const payload = verification.payload
  const eventType = payload.type as string
  const data = (payload.data || {}) as Record<string, unknown>

  if (eventType === 'payment.succeeded') {
    const paymentId = (data.payment_id || data.id) as string
    const metadata = (data.metadata || {}) as Record<string, string>
    const stageId = metadata.stage_id

    if (!stageId) {
      return { success: true, note: 'Ignored payment without stage_id' }
    }

    const supabase = createServerClient()

    // 2. Idempotency Check (Phase 17)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('dodo_payment_id', paymentId)
      .maybeSingle()

    if (existingPayment) {
      return { success: true, note: 'Already processed payment' }
    }

    const amount = (data.total_amount as number) || parseInt(metadata.amount_cents || '0', 10)

    // 3. Atomic Activation via Database Stored Procedure (Phase 18 & 19)
    const { data: result, error: rpcError } = await supabase.rpc('activate_stage_atomically', {
      p_stage_id: stageId,
      p_dodo_payment_id: paymentId,
      p_amount: amount,
    })

    if (rpcError) {
      console.error('[Dodo Service] Atomic activation RPC error:', rpcError)
      // Fallback manual activation if RPC not available
      return await fallbackManualActivation(supabase, stageId, paymentId, amount)
    }

    return { success: true, result }
  }

  return { success: true, note: 'Unhandled event type' }
}

async function fallbackManualActivation(
  supabase: ReturnType<typeof createServerClient>,
  stageId: string,
  paymentId: string,
  amount: number,
) {
  const { data: pendingStage } = await supabase
    .from('stages')
    .select('*')
    .eq('id', stageId)
    .single()

  if (!pendingStage) {
    return { success: false, error: 'Stage not found', status: 404 }
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + pendingStage.duration_minutes * 60 * 1000)

  // Find active stage
  const { data: activeStage } = await supabase
    .from('stages')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()

  if (activeStage) {
    if (pendingStage.original_duration_minutes <= activeStage.original_duration_minutes) {
      await supabase.from('stages').update({ status: 'cancelled' }).eq('id', stageId)
      return { success: true, note: 'Race condition cancelled' }
    }
    await supabase.from('stages').update({ status: 'taken_over' }).eq('id', activeStage.id)
  }

  await supabase
    .from('stages')
    .update({
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      dodo_payment_id: paymentId,
    })
    .eq('id', stageId)

  await supabase.from('payments').insert({
    dodo_payment_id: paymentId,
    dodo_checkout_id: pendingStage.dodo_checkout_id,
    stage_id: stageId,
    amount: amount || pendingStage.amount,
    currency: 'usd',
    status: 'succeeded',
    payment_type: activeStage ? 'stage_takeover' : 'stage_purchase',
  })

  return { success: true }
}
