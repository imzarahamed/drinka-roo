'use client'

export function DeleteProduct({ id }: { id: string }) {
  return (
    <form action={`/products/${id}/delete`} method="post">
      <button type="submit" className="text-sm text-red-500">Delete</button>
    </form>
  )
}
