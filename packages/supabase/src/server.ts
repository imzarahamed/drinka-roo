import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as supabaseCreateClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

function ensureSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase project URL and Key are required to create a Supabase client. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for public usage, ' +
      'or SUPABASE_URL and SUPABASE_ANON_KEY for server-only usage.'
    )
  }
}

export function createServerSupabase() {
  ensureSupabaseEnv()
  return createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    { cookies }
  )
}

// Admin client — ONLY use in server-side code / Edge Functions
export function createAdminSupabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ADMIN_KEY
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase URL and service role key are required to create an admin Supabase client. ' +
      'Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ADMIN_KEY and SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.'
    )
  }
  return supabaseCreateClient<Database>(
    SUPABASE_URL,
    SERVICE_ROLE_KEY
  )
}