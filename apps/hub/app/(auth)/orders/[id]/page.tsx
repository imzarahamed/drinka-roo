import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import StatusChanger from './StatusChanger.client'

export default async function OrderPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase()

  // Try several lookups because IDs may be numeric or string, or the link
  // might have used order_number by accident. Try id (string), id (number), then order_number.
  let order: any = null

  const selectCols = `
      id, order_number, status, total_amount, created_at,
      customer_profiles(full_name, company_name, phone),
      order_items(quantity, product_name, unit_price)
    `

  // 1) Try id as string
  let res = await supabase.from('orders').select(selectCols).eq('id', params.id).limit(1)
  if (res.error) {
    return (
      <div>
        <p className="text-sm">Supabase error querying order by id (string): {res.error.message}</p>
        <p className="text-xs text-gray-500 mt-2">Tried id: {params.id}</p>
        <Link href="/orders" className="text-sm text-blue-600">Back to orders</Link>
      </div>
    )
  }
  if (res.data && res.data.length > 0) order = res.data[0]

  // 2) Try numeric id
  if (!order) {
    const maybeNum = Number(params.id)
    if (!Number.isNaN(maybeNum)) {
      res = await supabase.from('orders').select(selectCols).eq('id', maybeNum).limit(1)
      if (res.error) {
        return (
          <div>
            <p className="text-sm">Supabase error querying order by id (number): {res.error.message}</p>
            <p className="text-xs text-gray-500 mt-2">Tried id: {maybeNum}</p>
            <Link href="/orders" className="text-sm text-blue-600">Back to orders</Link>
          </div>
        )
      }
      if (res.data && res.data.length > 0) order = res.data[0]
    }
  }

  // 3) Try order_number
  if (!order) {
    res = await supabase.from('orders').select(selectCols).eq('order_number', params.id).limit(1)
    if (res.error) {
      return (
        <div>
          <p className="text-sm">Supabase error querying order by order_number: {res.error.message}</p>
          <p className="text-xs text-gray-500 mt-2">Tried order_number: {params.id}</p>
          <Link href="/orders" className="text-sm text-blue-600">Back to orders</Link>
        </div>
      )
    }
    if (res.data && res.data.length > 0) order = res.data[0]
  }

  if (!order) {
    return (
      <div>
        <p className="text-sm">Order not found.</p>
        <p className="text-xs text-gray-500 mt-2">Tried id: {params.id}</p>
        <Link href="/orders" className="text-sm text-blue-600">Back to orders</Link>
      </div>
    )
  }

  const items = order.order_items ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Order {order.order_number}</h2>
          <p className="text-sm text-gray-500">Placed {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Total</p>
          <p className="font-semibold">${Number(order.total_amount).toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-gray-600">Customer</h3>
        <p className="font-medium">{order.customer_profiles?.company_name || order.customer_profiles?.full_name}</p>
        {order.customer_profiles?.phone && <p className="text-sm text-gray-500">{order.customer_profiles.phone}</p>}
      </div>

      <div className="mb-6">
        <h3 className="text-sm text-gray-600">Status</h3>
        <StatusChanger orderId={order.id} current={order.status} />
      </div>

      <div>
        <h3 className="text-sm text-gray-600 mb-2">Items</h3>
        <div className="bg-white border rounded-lg divide-y">
          {items.map((it: any, i: number) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{it.product_name}</p>
                <p className="text-sm text-gray-500">{it.quantity} × ${Number(it.unit_price).toFixed(2)}</p>
              </div>
              <div className="font-semibold">${(it.quantity * Number(it.unit_price)).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
