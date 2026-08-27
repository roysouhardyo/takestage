import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client using the service role key.
 *
 * ⚠️  NEVER import this in any Client Component or expose it to the browser.
 * Only use in:
 *   - Server Components
 *   - Route Handlers (app/api/*)
 *   - Server Actions
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
