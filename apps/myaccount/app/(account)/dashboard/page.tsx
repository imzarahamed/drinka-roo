import { createServerSupabase } from '@/lib/supabase'
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

export default async function Dashboard() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: orders, count: totalOrders }] = await Promise.all([
    supabase.from('customer_profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at, order_items(quantity, product_name, unit_price)', { count: 'exact' })
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate lifetime spend
  const { data: allOrders } = await supabase
    .from('orders')
    .select('total_amount, status')
    .eq('customer_id', user.id)
    .neq('status', 'cancelled')

  const lifetimeSpend = allOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0
  const pendingOrders = allOrders?.filter(o => ['pending', 'confirmed', 'processing', 'dispatched'].includes(o.status)).length ?? 0

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 max-w-5xl">
      {/* Header greeting */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm mb-1">{greeting}</p>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          {firstName} 👋
        </h1>
        {profile?.company_name && (
          <p className="text-slate-400 text-sm mt-1">{profile.company_name}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Total Orders</p>
          <p className="text-4xl font-bold text-slate-900 tabular-nums">{totalOrders ?? 0}</p>
          <p className="text-slate-400 text-xs mt-2">all time</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Active Orders</p>
          <p className="text-4xl font-bold text-indigo-600 tabular-nums">{pendingOrders}</p>
          <p className="text-slate-400 text-xs mt-2">in progress</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium mb-3">Lifetime Spend</p>
          <p className="text-4xl font-bold text-slate-900 tabular-nums">
            ${lifetimeSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-slate-400 text-xs mt-2">completed orders</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/new-order"
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <span>+</span> Place New Order
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View All Orders
          </Link>
          <Link
            href="/catalog"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View all →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-300 text-5xl mb-4">◫</p>
            <p className="text-slate-500 font-medium mb-1">No orders yet</p>
            <p className="text-slate-400 text-sm mb-6">Place your first order to get started</p>
            <Link
              href="/new-order"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Place New Order
            </Link>
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
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Order number */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {formattedDate} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Status */}
                    <StatusBadge status={order.status} />

                    {/* Amount */}
                    <p className="font-semibold text-slate-900 tabular-nums text-sm ml-4">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>

                    {/* Arrow */}
                    <span className="text-slate-300 group-hover:text-slate-500 transition-colors ml-2">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}