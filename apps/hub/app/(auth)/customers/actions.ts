'use server'
import { createServerSupabase } from '@/lib/supabase'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createServerSupabase()

  await supabase
    .from('customer_profiles')
    .update({
      full_name: formData.get('full_name') as string,
      company_name: (formData.get('company_name') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
      is_active: formData.get('is_active') === 'true',
    })
    .eq('id', id)

  revalidatePath('/customers')
  redirect('/customers')
}

export async function deleteCustomer(id: string) {
  const supabase = await createServerSupabase()
  const adminSupabase = createAdminSupabase()

  // Delete all order items for this customer's orders first
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_id', id)

  if (orders && orders.length > 0) {
    const orderIds = orders.map((o) => o.id)
    await adminSupabase.from('order_items').delete().in('order_id', orderIds)
    await adminSupabase.from('orders').delete().in('id', orderIds)
  }

  // Delete customer profile
  await adminSupabase.from('customer_profiles').delete().eq('id', id)

  // Delete auth user — removes them from auth.users entirely
  const { error } = await adminSupabase.auth.admin.deleteUser(id)
  if (error) throw new Error(`Failed to delete auth user: ${error.message}`)

  revalidatePath('/customers')
}