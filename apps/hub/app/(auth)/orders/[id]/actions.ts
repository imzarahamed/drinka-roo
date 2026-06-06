'use server'
import { createServerSupabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServerSupabase()
  await supabase.from('orders').update({ status }).eq('id', orderId)
  revalidatePath(`/orders/${orderId}`)
}