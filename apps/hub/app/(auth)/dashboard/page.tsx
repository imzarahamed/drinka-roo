import { createServerSupabase } from '@/lib/supabase'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()

  const [
    { count: ordersTotal },
    { count: ordersPending },
    { count: productsTotal },
    { count: customersTotal },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('customer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders')
      .select('id, order_number, status, total_amount, created_at, customer_profiles(full_name, company_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    dispatched: 'bg-orange-100 text-orange-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-600',
    // user-requested variant
    cancled:    'bg-red-100 text-red-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total orders',    value: ordersTotal ?? 0 },
          { label: 'Pending orders',  value: ordersPending ?? 0 },
          { label: 'Active products', value: productsTotal ?? 0 },
          { label: 'Customers',       value: customersTotal ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-medium">Recent orders</h2>
          <a href="/orders" className="text-sm text-blue-600 hover:underline">View all</a>
        </div>
        <div className="divide-y">
          {recentOrders?.length === 0 && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">No orders yet.</p>
          )}
          {recentOrders?.map((o: any) => (
            <a key={o.id} href={`/orders/${o.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium">{o.order_number}</p>
                <p className="text-sm text-gray-500 truncate">
                  {o.customer_profiles?.company_name || o.customer_profiles?.full_name || '—'}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {o.status}
              </span>
              <p className="font-semibold text-sm">${Number(o.total_amount).toFixed(2)}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}