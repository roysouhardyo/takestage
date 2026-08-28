import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Server-side in-memory active session tracker (35-second expiration)
const activeSessions = new Map<string, number>()
const SESSION_TTL_MS = 35000

function cleanupExpired() {
  const now = Date.now()
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > SESSION_TTL_MS) {
      activeSessions.delete(id)
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const sessionId = body.sessionId || 'anonymous'

    cleanupExpired()
    activeSessions.set(sessionId, Date.now())

    return NextResponse.json({
      count: Math.max(1, activeSessions.size),
      status: 'active',
    })
  } catch {
    cleanupExpired()
    return NextResponse.json({
      count: Math.max(1, activeSessions.size),
    })
  }
}

export async function GET() {
  cleanupExpired()
  return NextResponse.json({
    count: Math.max(1, activeSessions.size),
  })
}
