import { createServerSupabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  confirmed:  { label: 'Confirmed',  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  processing: { label: 'Processing', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  dispatched: { label: 'Dispatched', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  delivered:  { label: 'Delivered',  color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at, order_items(quantity, product_name, unit_price)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  const { data: orders } = await query

  const FILTERS = ['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled']
  const activeFilter = searchParams.status ?? 'all'

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">My Orders</h1>
        <p className="text-slate-400 text-sm mt-1">Track and manage your orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/orders' : `/orders?status=${f}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              activeFilter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {/* New order CTA */}
      <div className="flex justify-end mb-4">
        <Link
          href="/new-order"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Place New Order
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <p className="text-slate-300 text-5xl mb-4">◫</p>
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">
            {activeFilter !== 'all' ? `No ${activeFilter} orders` : 'Place your first order to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {orders.map((order: any) => {
              const itemCount = order.order_items?.reduce((sum: number, i: any) => sum + i.quantity, 0) ?? 0
              const date = new Date(order.created_at)
              const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {order.order_number}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {formattedDate} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                    {/* Item preview */}
                    {order.order_items?.slice(0, 2).map((item: any, i: number) => (
                      <p key={i} className="text-slate-500 text-xs mt-0.5 truncate">
                        {item.quantity}× {item.product_name}
                      </p>
                    ))}
                    {order.order_items?.length > 2 && (
                      <p className="text-slate-400 text-xs">+{order.order_items.length - 2} more items</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={order.status} />
                    <p className="font-semibold text-slate-900 tabular-nums text-sm">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                  <span className="text-slate-300 group-hover:text-slate-500 transition-colors ml-2">→</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}