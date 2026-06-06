import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase project URL and Key are required to create a Supabase client. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for public usage, ' +
      'or SUPABASE_URL and SUPABASE_ANON_KEY for server-only usage.'
    )
  }

  return supabaseCreateClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}
