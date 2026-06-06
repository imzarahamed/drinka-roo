import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

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
  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    { cookies }
  )
}

export async function uploadProductImage(file: File, productId: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase project URL and Key are required to create a Supabase client. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for public usage, ' +
      'or SUPABASE_URL and SUPABASE_ANON_KEY for server-only usage.'
    )
  }
  const supabase = supabaseCreateClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  ) as any
  const ext = file.name.split('.').pop()
  const path = `products/${productId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: publicData } = supabase.storage
    .from('product-images').getPublicUrl(path)
  return publicData.publicUrl
}
