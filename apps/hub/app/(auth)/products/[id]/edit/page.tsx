import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { updateProduct } from '../../actions'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('name'),
  ])

  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Edit product</h1>

      <form action={action} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            required
            defaultValue={product.name}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price *</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product.price}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock quantity *</label>
            <input
              name="stock_quantity"
              type="number"
              min="0"
              required
              defaultValue={product.stock_quantity}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              name="sku"
              defaultValue={product.sku ?? ''}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category_id"
              defaultValue={product.category_id ?? ''}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">— No category —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product image{' '}
            <span className="text-gray-400 font-normal">(leave blank to keep existing)</span>
          </label>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-lg mb-2 border"
            />
          )}
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked={product.is_active ?? true}
            id="is_active"
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active (visible on site)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Save changes
          </button>
          <a
            href="/products"
            className="px-5 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}