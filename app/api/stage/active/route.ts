import { NextResponse } from 'next/server'
import { getActiveStage, getArchive } from '@/lib/stage/queries'
import { computeMinimumTakeoverMinutes } from '@/lib/stage/takeover'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const stage = await getActiveStage()
    const { stages: pastStages } = await getArchive(0, 10)
    const minimumTakeoverMinutes = computeMinimumTakeoverMinutes(stage)
    return NextResponse.json({ stage, pastStages, minimumTakeoverMinutes })
  } catch {
    return NextResponse.json({ stage: null, pastStages: [], minimumTakeoverMinutes: 10 })
  }
}
