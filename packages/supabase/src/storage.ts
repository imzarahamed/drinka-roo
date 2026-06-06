import { createClient } from './client'

export async function uploadProductImage(file: File, productId: string) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `products/${productId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('product-images').getPublicUrl(path)
  return publicUrl
}