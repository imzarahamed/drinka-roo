'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from './actions'

export function DeleteProduct({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <button
      onClick={async () => {
        if (!confirm('Delete this product?')) return
        try {
          setLoading(true)
          await deleteProduct(id)
          router.refresh()
        } finally {
          setLoading(false)
        }
      }}
      disabled={loading}
      className="text-sm text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
