import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  const adminSecret = process.env.ADMIN_SECRET || 'takestage-admin-secret'
  if (secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('stages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ stages: data || [] })
}
