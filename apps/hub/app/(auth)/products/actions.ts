'use server'
import { createServerSupabase, uploadProductImage } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createServerSupabase()
  const imageFile = formData.get('image') as File | null

  let imageUrl: string | null = null
  const productId = crypto.randomUUID()

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `products/${productId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile, { upsert: true })
    if (error) throw error
    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)
    imageUrl = publicData.publicUrl
  }

  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await supabase.from('products').insert({
    id: productId,
    name,
    slug,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    stock_quantity: Number(formData.get('stock_quantity')),
    category_id: (formData.get('category_id') as string) || null,
    images: imageUrl ? [imageUrl] : [],
    sku: (formData.get('sku') as string) || null,
    is_active: formData.get('is_active') === 'true',
  })

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createServerSupabase()
  const imageFile = formData.get('image') as File | null

  // Fetch existing product to preserve current images if no new one uploaded
  const { data: existing } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  let images = existing?.images ?? []

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `products/${id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile, { upsert: true })
    if (error) throw error
    const { data: publicData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)
    images = [publicData.publicUrl]
  }

  const name = formData.get('name') as string

  await supabase
    .from('products')
    .update({
      name,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      stock_quantity: Number(formData.get('stock_quantity')),
      category_id: (formData.get('category_id') as string) || null,
      sku: (formData.get('sku') as string) || null,
      is_active: formData.get('is_active') === 'true',
      images,
    })
    .eq('id', id)

  revalidatePath('/products')
  redirect('/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabase()
  await supabase.from('products').update({ is_active: false }).eq('id', id)
  revalidatePath('/products')
}