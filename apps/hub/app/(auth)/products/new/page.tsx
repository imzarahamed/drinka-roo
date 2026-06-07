import { createServerSupabase } from '@/lib/supabase'
import { createProduct } from '../actions'

export default async function NewProductPage() {
  const supabase = await createServerSupabase()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Add product</h1>

      <form action={createProduct} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
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
              defaultValue={0}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              name="sku"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category_id"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">— No category —</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product image</label>
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
            defaultChecked
            id="is_active"
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">Active (visible on site)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Create product
          </button>
          
            <a href="/products"
            className="px-5 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}