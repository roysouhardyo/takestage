import { NextResponse } from 'next/server'
import { recordStageClick } from '@/lib/stage/store'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { stageId } = body

    if (!stageId) {
      return NextResponse.json({ error: 'Missing stageId' }, { status: 400 })
    }

    // 1. Increment in persistent memory/disk store
    const newCount = recordStageClick(stageId)

    // 2. Increment in Supabase database if connected (optional sync)
    try {
      const supabase = createServerClient()
      await supabase.rpc('increment_stage_click', { p_stage_id: stageId })
    } catch {
      // Memory store is active
    }

    return NextResponse.json({ success: true, stageId, clickCount: newCount })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Server error.'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
