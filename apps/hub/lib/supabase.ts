import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, any> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            )
          } catch {}
        },
      },
    }
  )
}

export async function uploadProductImage(file: File, productId: string) {
  const supabase = supabaseCreateClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) as any
  const ext = file.name.split('.').pop()
  const path = `products/${productId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: publicData } = supabase.storage
    .from('product-images').getPublicUrl(path)
  return publicData.publicUrl
}