import { NextResponse } from 'next/server'

// This endpoint has been permanently removed.
// Real payments are handled exclusively by Polar.sh checkout + webhook.
export async function POST() {
  return NextResponse.json(
    { error: 'Test payment simulation has been removed. Use real Polar.sh checkout.' },
    { status: 410 },
  )
}
