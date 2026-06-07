'use client'
import { useState } from 'react'
import { deleteCustomer } from './actions'

export function DeleteCustomer({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${name}"?\n\nThis will permanently remove the customer account, all their orders, and their login access. This cannot be undone.`
      )
    )
      return

    setLoading(true)
    try {
      await deleteCustomer(id)
    } catch (e) {
      alert('Failed to delete customer. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:underline disabled:opacity-40"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  )
}