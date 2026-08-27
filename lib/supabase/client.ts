import { createClient } from '@supabase/supabase-js'

/**
 * Browser-safe Supabase client.
 * Uses the anon key — only has public read permissions as defined by RLS.
 * Safe to use in Client Components.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
