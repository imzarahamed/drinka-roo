import { createServerSupabase } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-blue-100 text-blue-700',
  processing:  'bg-purple-100 text-purple-700',
  dispatched:  'bg-orange-100 text-orange-700',
  delivered:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-600',
}

export default async function OrdersPage({
  searchParams
}: { searchParams: { status?: string } }) {
  const supabase = createServerSupabase()
  let query = supabase.from('orders').select(`
    id, order_number, status, total_amount, created_at,
    customer_profiles(full_name, company_name)
  `).order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)

  const { data: orders } = await query

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4 text-sm">
        {['all','pending','confirmed','dispatched','delivered'].map((s: string) => (
          <a key={s} href={s === 'all' ? '/orders' : `/orders?status=${s}`}
            className={`px-3 py-1 rounded-full border capitalize
              ${(searchParams.status ?? 'all') === s ? 'bg-black text-white border-black' : 'border-gray-200'}`}>
            {s}
          </a>
        ))}
      </div>
      {/* Orders table */}
      {orders?.map((o: any) => (
        <a key={o.id} href={`/orders/${o.id}`}
          className="flex items-center gap-4 bg-white border rounded-xl p-4 mb-3 hover:shadow-sm">
          <div className="flex-1">
            <p className="font-mono text-sm">{o.order_number}</p>
            <p className="text-sm text-gray-500">
              {o.customer_profiles?.company_name || o.customer_profiles?.full_name}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>
            {o.status}
          </span>
          <p className="font-semibold">${o.total_amount}</p>
        </a>
      ))}
    </div>
  )
}