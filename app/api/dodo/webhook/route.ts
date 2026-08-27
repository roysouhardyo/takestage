import { NextResponse } from 'next/server'
import { processDodoWebhook } from '@/lib/dodo/service'

/**
 * Phase 16 & 17 — Secure Webhook Handler for Dodo Payments.
 * Verifies HMAC signature on raw body first before JSON parsing.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text()

    const headers = {
      'webhook-id': req.headers.get('webhook-id'),
      'webhook-timestamp': req.headers.get('webhook-timestamp'),
      'webhook-signature': req.headers.get('webhook-signature'),
    }

    const result = await processDodoWebhook(rawBody, headers)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 })
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    console.error('[Dodo Webhook Route] Internal error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
