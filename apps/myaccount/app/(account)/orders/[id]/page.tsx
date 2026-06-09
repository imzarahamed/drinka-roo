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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Try several lookups because IDs may be numeric or string, or the link
  // might have used order_number by accident. Try id (string), id (number), then order_number.
  let order: any = null

  const selectCols = `
      id, order_number, status, total_amount, created_at, discount, notes,
      order_items(quantity, product_name, unit_price)
    `

  // 1) Try id as string - only allow orders belonging to this customer
  let res = await supabase.from('orders').select(selectCols).eq('id', id).eq('customer_id', user.id).limit(1)
  if (res.error) {
    return (
      <div className="p-8 max-w-2xl">
        <p className="text-sm text-red-600">Error loading order: {res.error.message}</p>
        <p className="text-xs text-gray-500 mt-2">Order ID: {id}</p>
        <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800 mt-4 inline-block">← Back to orders</Link>
      </div>
    )
  }
  if (res.data && res.data.length > 0) order = res.data[0]

  // 2) Try numeric id (if string conversion failed)
  if (!order) {
    const maybeNum = Number(id)
    if (!Number.isNaN(maybeNum)) {
      res = await supabase.from('orders').select(selectCols).eq('id', maybeNum).eq('customer_id', user.id).limit(1)
      if (res.data && res.data.length > 0) order = res.data[0]
    }
  }

  // 3) Try order_number
  if (!order) {
    res = await supabase.from('orders').select(selectCols).eq('order_number', id).eq('customer_id', user.id).limit(1)
    if (res.data && res.data.length > 0) order = res.data[0]
  }

  if (!order) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Order not found</h1>
        <p className="text-slate-500 mb-4">We couldn't find an order with ID: {id}</p>
        <Link href="/orders" className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
          ← Back to orders
        </Link>
      </div>
    )
  }

  const items = order.order_items ?? []
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
  const discount = order.discount || 0
  const total = order.total_amount

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block">
          ← Back to orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{order.order_number}</h1>
            <p className="text-slate-500 mt-1">Placed {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          <hr className="border-slate-200" />
          <div className="flex justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="font-semibold text-slate-900">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Items ({items.length})</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {items.map((item: any, i: number) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{item.product_name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Quantity: {item.quantity} × ${item.unit_price.toFixed(2)} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Notes (if any) */}
      {order.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Order Notes</h3>
          <p className="text-blue-800 text-sm">{order.notes}</p>
        </div>
      )}
    </div>
  )
}