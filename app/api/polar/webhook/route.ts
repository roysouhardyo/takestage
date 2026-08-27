import { NextResponse } from 'next/server'
import { verifyPolarWebhookSignature, processPolarPaymentSuccess } from '@/lib/polar/webhook'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('webhook-signature') || req.headers.get('polar-webhook-signature')
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || ''

    // Verify webhook signature if secret is set
    if (webhookSecret && signature) {
      const isValid = verifyPolarWebhookSignature(rawBody, signature, webhookSecret)
      if (!isValid) {
        console.warn('[Polar Webhook] Invalid signature rejected.')
        return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload.type || payload.event

    // Polar events e.g. "order.created" or "checkout.created" or "checkout.updated"
    if (eventType === 'order.created' || eventType === 'checkout.created' || eventType === 'checkout.updated') {
      const data = payload.data || payload

      // Extract stage_id from metadata or custom attributes
      const metadata = data.metadata || {}
      const stageId = metadata.stage_id || data.custom_field_stage_id
      const paymentId = data.id || data.order_id || `polar_${Date.now()}`
      const amount = data.amount || data.net_amount || 0

      if (stageId) {
        const result = await processPolarPaymentSuccess({
          paymentId,
          stageId,
          amount,
        })

        return NextResponse.json({ success: true, result })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown webhook error'
    console.error('[Polar Webhook API Error]:', err)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
