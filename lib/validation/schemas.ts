/**
 * URL validation and sanitization utilities.
 */

const MAX_URL_LENGTH = 2048
const MAX_BRAND_NAME_LENGTH = 60
const MAX_MESSAGE_LENGTH = 120

/**
 * Validates and normalizes a website URL.
 * Adds https:// if missing scheme.
 * Returns { valid: true, url } or { valid: false, error }
 */
export function validateUrl(raw: string): { valid: true; url: string } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'URL is required.' }
  }

  let str = raw.trim()

  // Add scheme if missing
  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = 'https://' + str
  }

  if (str.length > MAX_URL_LENGTH) {
    return { valid: false, error: 'URL is too long.' }
  }

  try {
    const parsed = new URL(str)
    // Must be http or https
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: 'URL must use http or https.' }
    }
    // Must have a valid hostname
    if (!parsed.hostname || parsed.hostname.length < 1) {
      return { valid: false, error: 'URL must have a valid hostname.' }
    }
    // Block localhost / private IPs in production
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname.startsWith('192.168.') ||
      parsed.hostname.startsWith('10.') ||
      parsed.hostname.endsWith('.local')
    ) {
      return { valid: false, error: 'Private/local URLs are not allowed.' }
    }
    return { valid: true, url: str }
  } catch {
    return { valid: false, error: 'Please enter a valid URL.' }
  }
}

/**
 * Extracts normalized domain from a URL string (already validated).
 * e.g. "https://www.example.com/path" → "example.com"
 */
export function normalizeDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Validates a brand name string.
 */
export function validateBrandName(name: string | undefined): { valid: true; value: string } | { valid: false; error: string } {
  if (!name || name.trim().length === 0) {
    return { valid: true, value: '' }
  }
  const trimmed = name.trim()
  if (trimmed.length > MAX_BRAND_NAME_LENGTH) {
    return { valid: false, error: `Brand name must be ${MAX_BRAND_NAME_LENGTH} characters or less.` }
  }
  // Basic XSS prevention — strip HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '')
  return { valid: true, value: sanitized }
}

/**
 * Validates a short message string.
 */
export function validateMessage(msg: string | undefined): { valid: true; value: string } | { valid: false; error: string } {
  if (!msg || msg.trim().length === 0) {
    return { valid: true, value: '' }
  }
  const trimmed = msg.trim()
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less.` }
  }
  const sanitized = trimmed.replace(/<[^>]*>/g, '')
  return { valid: true, value: sanitized }
}

/**
 * Derives a fallback initial from a brand name or domain.
 * e.g. "Acme Corp" → "A", "example.com" → "E"
 */
export function deriveFallbackInitial(brandName: string | undefined, domain: string): string {
  if (brandName && brandName.trim().length > 0) {
    return brandName.trim()[0].toUpperCase()
  }
  return domain[0]?.toUpperCase() ?? '?'
}
