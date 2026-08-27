import { getPolarClient } from './client'

export interface CreatePolarCheckoutOptions {
  stageId: string
  websiteUrl: string
  domain: string
  durationMinutes: number
  sessionId?: string
}

export async function createPolarCheckout(options: CreatePolarCheckoutOptions) {
  const { stageId, websiteUrl, domain, durationMinutes, sessionId } = options

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const productId = process.env.POLAR_PRODUCT_ID || ''
  const amountCents = durationMinutes * 100

  const polar = getPolarClient()

  try {
    // Create checkout session on Polar via SDK
    const checkout = await polar.checkouts.create({
      products: productId ? [productId] : ['fallback_product'],
      customFieldData: {
        stage_id: stageId,
        website_url: websiteUrl,
        domain,
        duration_minutes: durationMinutes,
        session_id: sessionId || '',
      },
      successUrl: `${siteUrl}/?session_id=${stageId}&success=true`,
      metadata: {
        stage_id: stageId,
        website_url: websiteUrl,
        domain,
        duration_minutes: durationMinutes.toString(),
      },
    })

    return {
      checkoutUrl: checkout.url,
      paymentId: checkout.id,
    }
  } catch (error: unknown) {
    console.error('[Polar Service] Failed to create checkout session:', error)

    // Fallback URL response for testing/development if credentials are not configured yet
    const fallbackUrl = `https://sandbox.polar.sh/checkout/${stageId}?amount=${amountCents}`
    return {
      checkoutUrl: fallbackUrl,
      paymentId: `polar_chk_${stageId}`,
      isFallback: true,
    }
  }
}
