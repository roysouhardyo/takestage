import { createServerClient } from '@/lib/supabase/server'
import { Stage } from '@/types'

/**
 * Returns the currently active stage, or null if none.
 * An active stage has status='active' and expires_at in the future.
 */
export async function getActiveStage(): Promise<Stage | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('[getActiveStage] Supabase fallback (database offline or non-existent):', error.message)
      return null
    }

    return data as Stage | null
  } catch (err) {
    console.warn('[getActiveStage] Catch fallback:', err)
    return null
  }
}

/**
 * Returns the archive of completed/taken_over stages, newest first.
 * Paginated — default 20 per page.
 */
export async function getArchive(
  page = 0,
  pageSize = 20,
): Promise<{ stages: Stage[]; total: number }> {
  try {
    const supabase = createServerClient()

    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('stages')
      .select('*', { count: 'exact' })
      .in('status', ['completed', 'taken_over'])
      .order('started_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.warn('[getArchive] Supabase fallback (database offline or non-existent):', error.message)
      return { stages: [], total: 0 }
    }

    return { stages: (data as Stage[]) ?? [], total: count ?? 0 }
  } catch (err) {
    console.warn('[getArchive] Catch fallback:', err)
    return { stages: [], total: 0 }
  }
}

/**
 * Returns aggregated platform stats.
 */
export async function getPlatformStats(): Promise<{
  total_stages: number
  total_minutes: number
  total_revenue_cents: number
  unique_domains: number
}> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('stages')
      .select('duration_minutes, amount, normalized_domain')
      .in('status', ['active', 'completed', 'taken_over'])

    if (error || !data) {
      return { total_stages: 0, total_minutes: 0, total_revenue_cents: 0, unique_domains: 0 }
    }

    const total_stages = data.length
    const total_minutes = data.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0)
    const total_revenue_cents = data.reduce((sum, s) => sum + (s.amount ?? 0), 0)
    const unique_domains = new Set(data.map((s) => s.normalized_domain)).size

    return { total_stages, total_minutes, total_revenue_cents, unique_domains }
  } catch {
    return { total_stages: 0, total_minutes: 0, total_revenue_cents: 0, unique_domains: 0 }
  }
}

/**
 * Looks up a single stage by ID.
 */
export async function getStageById(id: string): Promise<Stage | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.warn('[getStageById] Supabase error:', error.message)
      return null
    }

    return data as Stage | null
  } catch {
    return null
  }
}

/**
 * Returns the N most recent events for the activity feed.
 */
export async function getRecentEvents(limit = 20) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('event_type', ['stage_started', 'stage_takeover', 'stage_completed'])
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('[getRecentEvents] Supabase error:', error.message)
      return []
    }

    return data ?? []
  } catch {
    return []
  }
}
