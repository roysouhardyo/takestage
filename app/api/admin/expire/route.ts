import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { secret, stage_id } = await req.json()

    const adminSecret = process.env.ADMIN_SECRET || 'takestage-admin-secret'
    if (secret !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stage_id) {
      return NextResponse.json({ error: 'Missing stage_id' }, { status: 400 })
    }

    const supabase = createServerClient()
    await supabase
      .from('stages')
      .update({ status: 'completed' })
      .eq('id', stage_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
