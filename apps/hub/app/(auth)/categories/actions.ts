'use server'
import { createServerSupabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCategory(formData: FormData) {
  const supabase = await createServerSupabase()
  const name = formData.get('name') as string
  const slug =
    (formData.get('slug') as string) ||
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const sort_order = formData.get('sort_order')

  await supabase.from('categories').insert({
    name,
    slug,
    sort_order: sort_order ? Number(sort_order) : null,
  })

  revalidatePath('/categories')
  redirect('/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createServerSupabase()
  const name = formData.get('name') as string
  const sort_order = formData.get('sort_order')

  await supabase
    .from('categories')
    .update({
      name,
      slug:
        (formData.get('slug') as string) ||
        name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      sort_order: sort_order ? Number(sort_order) : null,
    })
    .eq('id', id)

  revalidatePath('/categories')
  redirect('/categories')
}

export async function deleteCategory(id: string) {
  const supabase = await createServerSupabase()
  await supabase.from('categories').delete().eq('id', id)
  revalidatePath('/categories')
}