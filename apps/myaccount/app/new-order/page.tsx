'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase-client'

export default function NewOrderPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true)
      .then((res: any) => setProducts(res.data ?? []))
  }, [])

  function setQty(id: string, qty: number) {
    setCart(c => ({ ...c, [id]: Math.max(0, qty) }))
  }

  async function placeOrder() {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const items = Object.entries(cart).filter(([_, q]) => q > 0)
    if (!items.length) return

    const total = items.reduce((sum, [id, qty]) => {
      const p = products.find(p => p.id === id)
      return sum + (p?.price ?? 0) * qty
    }, 0)

    const { data: order } = await supabase.from('orders')
      .insert({ customer_id: user!.id, total_amount: total })
      .select().single()

    await supabase.from('order_items').insert(
      items.map(([id, qty]) => {
        const p = products.find(p => p.id === id)!
        return { order_id: order!.id, product_id: id,
          product_name: p.name, quantity: qty, unit_price: p.price }
      })
    )
    window.location.href = `/orders/${order!.id}`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">New order</h1>
      {products.map(p => (
        <div key={p.id} className="flex items-center gap-4 border-b py-4">
          <div className="flex-1">
            <p className="font-medium">{p.name}</p>
            <p className="text-sm text-gray-500">${p.price} each</p>
          </div>
          <input type="number" min="0" value={cart[p.id] ?? 0}
            onChange={e => setQty(p.id, Number(e.target.value))}
            className="w-20 border rounded px-2 py-1 text-center" />
        </div>
      ))}
      <button onClick={placeOrder} disabled={submitting}
        className="mt-6 w-full bg-black text-white py-3 rounded-lg">
        Place order
      </button>
    </div>
  )
}