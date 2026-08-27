import { NextResponse } from 'next/server'
import { getActiveStage, getArchive } from '@/lib/stage/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const stage = await getActiveStage()
    const { stages: pastStages } = await getArchive(0, 10)
    return NextResponse.json({ stage, pastStages })
  } catch {
    return NextResponse.json({ stage: null, pastStages: [] })
  }
}
