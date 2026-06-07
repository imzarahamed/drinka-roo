'use client'
import { deleteCategory } from './actions'

export function DeleteCategory({ id }: { id: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm('Delete this category? Products in it will become uncategorised.')) {
          await deleteCategory(id)
        }
      }}
      className="text-sm text-red-500 hover:underline"
    >
      Delete
    </button>
  )
}