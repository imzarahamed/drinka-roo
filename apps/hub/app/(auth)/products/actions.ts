'use server'
import { createServerSupabase, uploadProductImage } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = createServerSupabase()
  const imageFile = formData.get('image') as File | null

  let imageUrl: string | null = null
  const productId = crypto.randomUUID()
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile, productId)
  }

  const slug = (formData.get('name') as string)
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await supabase.from('products').insert({
    id: productId,
    name: formData.get('name') as string,
    slug,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    stock_quantity: Number(formData.get('stock_quantity')),
    category_id: formData.get('category_id') as string || null,
    images: imageUrl ? [imageUrl] : [],
    sku: formData.get('sku') as string || null,
    is_active: formData.get('is_active') === 'true',
  })

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createServerSupabase()
  await supabase.from('products').update({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    stock_quantity: Number(formData.get('stock_quantity')),
    is_active: formData.get('is_active') === 'true',
  }).eq('id', id)
  revalidatePath('/products')
  redirect('/products')
}

export async function deleteProduct(id: string) {
  const supabase = createServerSupabase()
  await supabase.from('products').update({ is_active: false }).eq('id', id)
  revalidatePath('/products')
}