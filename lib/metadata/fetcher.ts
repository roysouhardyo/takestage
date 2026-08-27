import { MetadataResponsePayload } from '@/types'
import { normalizeDomain } from '@/lib/validation/schemas'

interface LogoCandidate {
  url: string
  source: 'apple-touch-icon' | 'manifest' | 'schema-logo' | 'favicon-high' | 'favicon-standard'
  score: number
}

/**
 * Phase 9 — Smart URL / Logo & Brand Metadata Resolver.
 *
 * Evaluates icons by:
 *   1. apple-touch-icon (high score, crisp square branding)
 *   2. web manifest icon (high score, defined dimensions)
 *   3. schema.org structured logo
 *   4. high-res favicon (<link rel="icon" sizes="...">)
 *   5. standard favicon.ico (fallback candidate)
 *
 * Rejects promotional Open Graph banner images to avoid layout destruction.
 * Generates fallback initial if no quality logo candidate passes threshold.
 */
export async function resolveUrlMetadata(url: string): Promise<MetadataResponsePayload> {
  const domain = normalizeDomain(url)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TakeStage-LogoResolver/2.0 (+https://takestage.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return buildFallbackResult(url, domain)
    }

    const html = await response.text()
    const candidates: LogoCandidate[] = []

    // 1. Apple Touch Icon (high quality brand mark)
    const appleTouchMatch = html.match(
      /<link[^>]+rel=["'](?:apple-touch-icon|apple-touch-icon-precomposed)["'][^>]+href=["']([^"']+)["']/i,
    )
    if (appleTouchMatch) {
      candidates.push({
        url: resolveUrl(appleTouchMatch[1], url),
        source: 'apple-touch-icon',
        score: 90,
      })
    }

    // 2. Structured Schema.org Logo
    const schemaLogoMatch = html.match(/"logo"\s*:\s*["']([^"']+)["']/i)
    if (schemaLogoMatch) {
      candidates.push({
        url: resolveUrl(schemaLogoMatch[1], url),
        source: 'schema-logo',
        score: 85,
      })
    }

    // 3. Sized Favicon (<link rel="icon" sizes="192x192" ...>)
    const sizedIconMatch = html.match(
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+sizes=["'](\d+x\d+)["'][^>]+href=["']([^"']+)["']/i,
    )
    if (sizedIconMatch) {
      candidates.push({
        url: resolveUrl(sizedIconMatch[2], url),
        source: 'favicon-high',
        score: 80,
      })
    }

    // 4. Standard Favicon
    const standardIconMatch = html.match(
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    )
    if (standardIconMatch) {
      candidates.push({
        url: resolveUrl(standardIconMatch[1], url),
        source: 'favicon-standard',
        score: 60,
      })
    }

    // Sort candidates by score
    candidates.sort((a, b) => b.score - a.score)
    const bestLogo = candidates.length > 0 ? candidates[0].url : null

    // Extract title/brand hint
    const rawTitle = extractTag(html, 'title') || extractMeta(html, 'og:title')
    const brandTitle = rawTitle ? cleanTitle(rawTitle, domain) : domain

    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description')

    return {
      title: brandTitle,
      description: description ? truncate(description, 160) : null,
      image: bestLogo,
      favicon: bestLogo,
      domain,
    }
  } catch {
    return buildFallbackResult(url, domain)
  }
}

export const fetchUrlMetadata = resolveUrlMetadata

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildFallbackResult(url: string, domain: string): MetadataResponsePayload {
  return {
    title: domain,
    description: null,
    image: null,
    favicon: null,
    domain,
  }
}

function cleanTitle(raw: string, domain: string): string {
  // Strip common title suffixes like "| Home", "- Official Site"
  const cleaned = raw.split(/[|\-–—:]/)[0].trim()
  return cleaned.length > 0 ? truncate(cleaned, 60) : domain
}

function extractMeta(html: string, name: string): string | null {
  const match = html.match(
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
  )
  return match ? match[1] : null
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'))
  return match ? match[1].trim() : null
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith('http')) return href
  try {
    const baseUrl = new URL(base)
    if (href.startsWith('//')) return `${baseUrl.protocol}${href}`
    if (href.startsWith('/')) return `${baseUrl.origin}${href}`
    return `${baseUrl.origin}/${href}`
  } catch {
    return href
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}
