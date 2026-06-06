import { createServerSupabase } from '../../lib/supabase'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: recentOrders }] = await Promise.all([
    supabase.from('customer_profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select(`
      id, order_number, status, total_amount, created_at,
      order_items(quantity, product_name, unit_price)
    `).eq('customer_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1>Welcome, {profile?.full_name}</h1>
      <h2 className="mt-8 text-lg font-medium">Recent orders</h2>
      {recentOrders?.map((order: any) => (
        <div key={order.id} className="border rounded-lg p-4 mt-3">
          <div className="flex justify-between">
            <span className="font-mono text-sm">{order.order_number}</span>
            <span className="text-sm capitalize">{order.status}</span>
          </div>
          <p className="text-lg font-semibold mt-1">${order.total_amount}</p>
        </div>
      ))}
    </div>
  )
}