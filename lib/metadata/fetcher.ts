import { MetadataResponsePayload } from '@/types'
import { normalizeDomain } from '@/lib/validation/schemas'

interface LogoCandidate {
  url: string
  source: string
  score: number
}

/**
 * Phase 9 — Smart URL / Logo & Brand Metadata Resolver.
 *
 * Evaluates icons by:
 *   1. apple-touch-icon (high score, crisp square branding mark)
 *   2. rel="icon" / rel="shortcut icon" (supports svg, png, ico)
 *   3. schema.org structured logo
 *   4. og:image / twitter:image fallback
 *   5. Unavatar & IconHorse CDN services
 *   6. Google High-Res Favicon CDN fallback
 */
export async function resolveUrlMetadata(url: string): Promise<MetadataResponsePayload> {
  const domain = normalizeDomain(url)
  const unavatarUrl = `https://unavatar.io/${encodeURIComponent(domain)}`
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`

  const result = await fetchHtmlWithFallback(url, domain)

  if (!result) {
    return buildFallbackResult(domain, unavatarUrl)
  }

  const { html, finalUrl } = result
  const candidates: LogoCandidate[] = []

  // 1. Scan all <link> tags flexibly (handles href before rel or rel before href)
  const linkTagRegex = /<link[^>]+>/gi
  let match: RegExpExecArray | null
  while ((match = linkTagRegex.exec(html)) !== null) {
    const tag = match[0]
    const relMatch = tag.match(/rel=["']([^"']+)["']/i)
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i)

    if (relMatch && hrefMatch) {
      const rel = relMatch[1].toLowerCase()
      const href = hrefMatch[1]
      const resolvedHref = resolveUrl(href, finalUrl)

      if (rel.includes('apple-touch-icon')) {
        candidates.push({
          url: resolvedHref,
          source: 'apple-touch-icon',
          score: 95,
        })
      } else if (rel.includes('icon')) {
        const sizesMatch = tag.match(/sizes=["'](\d+x\d+)["']/i)
        const typeMatch = tag.match(/type=["']([^"']+)["']/i)
        let score = 80
        if (sizesMatch) score = 90
        if (typeMatch && typeMatch[1].includes('svg')) score = 92 // SVG icons are vector-crisp
        candidates.push({
          url: resolvedHref,
          source: 'favicon',
          score,
        })
      }
    }
  }

  // 2. Structured Schema.org Logo
  const schemaLogoMatch = html.match(/"logo"\s*:\s*["']([^"']+)["']/i)
  if (schemaLogoMatch) {
    candidates.push({
      url: resolveUrl(schemaLogoMatch[1], finalUrl),
      source: 'schema-logo',
      score: 88,
    })
  }

  // 3. Open Graph Image (og:image / twitter:image)
  const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
  if (ogImage) {
    candidates.push({
      url: resolveUrl(ogImage, finalUrl),
      source: 'og-image',
      score: 60,
    })
  }

  // 4. Fallback CDN Resolvers (Unavatar & Google Favicon)
  candidates.push({
    url: unavatarUrl,
    source: 'unavatar',
    score: 55,
  })
  candidates.push({
    url: googleFaviconUrl,
    source: 'google-favicon',
    score: 45,
  })

  // Sort candidates by score
  candidates.sort((a, b) => b.score - a.score)
  const bestLogo = candidates[0].url

  // Extract title & description
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
}

export const fetchUrlMetadata = resolveUrlMetadata

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchHtmlWithFallback(
  inputUrl: string,
  domain: string,
): Promise<{ html: string; finalUrl: string } | null> {
  const urlsToTry: string[] = []

  if (inputUrl.startsWith('http://') || inputUrl.startsWith('https://')) {
    urlsToTry.push(inputUrl)
  } else {
    urlsToTry.push(`https://${domain}`)
  }

  if (!domain.startsWith('www.')) {
    urlsToTry.push(`https://www.${domain}`)
  } else {
    urlsToTry.push(`https://${domain.replace(/^www\./, '')}`)
  }

  urlsToTry.push(`http://${domain}`)

  for (const targetUrl of urlsToTry) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4500)

      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      })

      clearTimeout(timeout)

      if (res.ok) {
        const html = await res.text()
        if (html && html.trim().length > 50) {
          return { html, finalUrl: targetUrl }
        }
      }
    } catch {
      // Continue to next fallback URL
    }
  }

  return null
}

function buildFallbackResult(domain: string, unavatarUrl: string): MetadataResponsePayload {
  return {
    title: domain,
    description: null,
    image: unavatarUrl,
    favicon: unavatarUrl,
    domain,
  }
}

function cleanTitle(raw: string, domain: string): string {
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
