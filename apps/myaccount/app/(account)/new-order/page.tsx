'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No authenticated user')
        return
      }

      // Ensure a customer profile exists for this auth user. Orders reference
      // `customer_profiles.id` so insertion will fail if the profile is missing.
      const { data: existingProfile } = await supabase
        .from('customer_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      if (!existingProfile) {
        // full_name is required by the database schema, so provide a fallback
        const fullName = (user.user_metadata as any)?.full_name ||
                        user.email?.split('@')[0] ||
                        'Customer'
        const { error: profileError } = await supabase.from('customer_profiles').insert({
          id: user.id,
          full_name: fullName,
        })
        if (profileError) throw profileError
      }

      const items = Object.entries(cart).filter(([_, q]) => q > 0)
      if (!items.length) return

      const total = items.reduce((sum, [id, qty]) => {
        const p = products.find(p => p.id === id)
        return sum + (p?.price ?? 0) * qty
      }, 0)

      // Generate a unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      const { data: order, error: orderError } = await supabase.from('orders')
        .insert({
          customer_id: user.id,
          total_amount: total,
          order_number: orderNumber
        })
        .select().single()

      if (orderError) throw orderError

      const { error: itemsError } = await supabase.from('order_items').insert(
        items.map(([id, qty]) => {
          const p = products.find(p => p.id === id)!
          return { order_id: order.id, product_id: id,
            product_name: p.name, quantity: qty, unit_price: p.price }
        })
      )

      if (itemsError) throw itemsError

      window.location.href = `/orders/${order.id}`
    } catch (err) {
      console.error('Place order failed', err)
      alert('Failed to place order — check console for details.')
    } finally {
      setSubmitting(false)
    }
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