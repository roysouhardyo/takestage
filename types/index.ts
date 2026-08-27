// ============================================================
// ENUMS / UNIONS
// ============================================================

export type StageStatus = 'pending' | 'active' | 'completed' | 'taken_over' | 'cancelled'

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export type PaymentType = 'stage_purchase' | 'stage_takeover'

export type EventType =
  | 'page_view'
  | 'stage_view'
  | 'checkout_started'
  | 'payment_success'
  | 'stage_started'
  | 'stage_takeover'
  | 'stage_completed'
  | 'archive_click'
  | 'website_click'

// ============================================================
// DATABASE MODELS
// ============================================================

export interface Stage {
  id: string
  website_url: string
  normalized_domain: string
  brand_name: string | null
  logo_url: string | null
  fallback_initial: string
  message: string | null
  duration_minutes: number
  amount: number // cents
  currency: string
  started_at: string | null
  expires_at: string | null
  /**
   * IMMUTABLE — set at creation time, never modified.
   * The duration the user originally purchased.
   * A takeover must purchase strictly more than this value.
   */
  original_duration_minutes: number
  status: StageStatus
  dodo_payment_id: string | null
  dodo_checkout_id: string | null
  created_at: string
}

export interface Payment {
  id: string
  dodo_payment_id: string
  dodo_checkout_id: string | null
  stage_id: string
  amount: number // cents
  currency: string
  status: PaymentStatus
  payment_type: PaymentType
  created_at: string
}

export interface StageEvent {
  id: string
  event_type: EventType
  stage_id: string | null
  session_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ============================================================
// API PAYLOADS
// ============================================================

export interface CheckoutRequestPayload {
  website_url: string
  brand_name?: string
  message?: string
  duration_minutes: number
  session_id: string
}

export interface CheckoutResponsePayload {
  checkout_url: string
  stage_id: string
}

export interface MetadataResponsePayload {
  title: string | null
  description: string | null
  image: string | null
  favicon: string | null
  domain: string
}

// ============================================================
// PRICING
// ============================================================

export interface PricingTier {
  minutes: number
  price_cents: number
  label: string
  tag?: string
}

// ============================================================
// REALTIME EVENTS
// ============================================================

export interface RealtimeStagePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Partial<Stage>
  old: Partial<Stage>
}

// ============================================================
// ADMIN
// ============================================================

export interface AdminStats {
  total_stages: number
  total_active_minutes: number
  total_revenue_cents: number
  unique_domains: number
}
