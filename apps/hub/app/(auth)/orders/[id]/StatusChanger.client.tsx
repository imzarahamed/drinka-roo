"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from './actions'

export default function StatusChanger({ orderId, current }: { orderId: string, current: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const statuses = ['pending','confirmed','processing','dispatched','delivered','cancled']

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (!confirm(`Change status to ${newStatus}?`)) return
    try {
      setLoading(true)
      // call server action
      await updateOrderStatus(orderId, newStatus)
      router.refresh()
    } catch (err) {
      console.error('Failed to update status', err)
      alert('Failed to update status — check console')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select value={current} onChange={onChange} disabled={loading}
        className="px-3 py-1 border rounded">
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {loading && <span className="text-sm text-gray-500">Updating…</span>}
    </div>
  )
}
