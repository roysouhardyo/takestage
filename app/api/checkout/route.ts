import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createPolarCheckout } from '@/lib/polar/service'
import { calculatePriceCents, PRICING_CONFIG } from '@/lib/pricing/config'
import { validateUrl, validateMessage, normalizeDomain, deriveFallbackInitial } from '@/lib/validation/schemas'
import { resolveUrlMetadata } from '@/lib/metadata/fetcher'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { website_url, message, duration_minutes, session_id } = body

    // 1. Validate Input
    const urlCheck = validateUrl(website_url)
    if (!urlCheck.valid) {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 })
    }

    // Optional message (Max 80 characters)
    const msgCheck = validateMessage(message)
    if (!msgCheck.valid) {
      return NextResponse.json({ error: msgCheck.error }, { status: 400 })
    }
    if (msgCheck.value && msgCheck.value.length > 80) {
      return NextResponse.json({ error: 'Message must be 80 characters or less.' }, { status: 400 })
    }

    // Validate duration range
    const minutes = Math.floor(Number(duration_minutes))
    if (
      isNaN(minutes) ||
      minutes < PRICING_CONFIG.minimum_duration_minutes ||
      minutes > PRICING_CONFIG.maximum_duration_minutes
    ) {
      return NextResponse.json(
        { error: `Duration must be between ${PRICING_CONFIG.minimum_duration_minutes} min and ${PRICING_CONFIG.maximum_duration_minutes} min.` },
        { status: 400 },
      )
    }

    // Server-calculated price ($1 / minute = 100 cents/min)
    const amountCents = calculatePriceCents(minutes)

    const supabase = createServerClient()

    // 2. Fetch current active stage to enforce TAKEOVER RULE
    const { data: currentActive } = await supabase
      .from('stages')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Takeover condition: new_duration > active_stage.original_duration_minutes
    if (currentActive && minutes <= currentActive.original_duration_minutes) {
      return NextResponse.json(
        {
          error: `Takeover requires purchasing strictly more than the current stage's original duration (${currentActive.original_duration_minutes} min).`,
        },
        { status: 400 },
      )
    }

    const domain = normalizeDomain(urlCheck.url)

    // 3. Smart Logo & Metadata Resolver
    const resolvedMeta = await resolveUrlMetadata(urlCheck.url)
    const fallbackInitial = deriveFallbackInitial(resolvedMeta.title || undefined, domain)

    // 4. Create pending stage record in DB
    const { data: newStage, error: dbError } = await supabase
      .from('stages')
      .insert({
        website_url: urlCheck.url,
        normalized_domain: domain,
        brand_name: resolvedMeta.title || domain,
        logo_url: resolvedMeta.image || null,
        fallback_initial: fallbackInitial,
        message: msgCheck.value || null,
        duration_minutes: minutes,
        original_duration_minutes: minutes, // IMMUTABLE
        amount: amountCents,
        currency: 'usd',
        status: 'pending',
      })
      .select()
      .single()

    if (dbError || !newStage) {
      console.error('[Checkout API] DB Insert Error:', dbError)
      return NextResponse.json({ error: 'Failed to initialize stage record.' }, { status: 500 })
    }

    // 5. Create Polar.sh Checkout Session
    const checkoutResult = await createPolarCheckout({
      stageId: newStage.id,
      websiteUrl: urlCheck.url,
      domain,
      durationMinutes: minutes,
      sessionId: session_id,
    })

    if (!checkoutResult.checkoutUrl) {
      return NextResponse.json({ error: 'Failed to generate checkout payment link.' }, { status: 500 })
    }

    // Update pending stage with checkout ID
    await supabase
      .from('stages')
      .update({ dodo_checkout_id: checkoutResult.paymentId })
      .eq('id', newStage.id)

    // Log event
    await supabase.from('events').insert({
      event_type: 'checkout_started',
      stage_id: newStage.id,
      session_id,
      metadata: { duration_minutes: minutes, amount: amountCents, provider: 'polar.sh' },
    })

    return NextResponse.json({
      checkout_url: checkoutResult.checkoutUrl,
      stage_id: newStage.id,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal server error.'
    console.error('[Checkout API] Server error:', err)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
