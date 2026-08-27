import { NextResponse } from 'next/server'
import { fetchUrlMetadata } from '@/lib/metadata/fetcher'
import { validateUrl } from '@/lib/validation/schemas'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter.' }, { status: 400 })
  }

  const check = validateUrl(targetUrl)
  if (!check.valid) {
    return NextResponse.json({ error: check.error }, { status: 400 })
  }

  const metadata = await fetchUrlMetadata(check.url)
  return NextResponse.json(metadata)
}
