import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteProduct } from './delete-button'

export default async function ProductsPage() {
  const supabase = createServerSupabase()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/products/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm">
          + Add product
        </Link>
      </div>
      <table className="w-full text-sm bg-white rounded-xl border overflow-hidden">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">Price</th>
            <th className="text-left px-4 py-3">Stock</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p: any) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 text-gray-500">{p.categories?.name}</td>
              <td className="px-4 py-3">${p.price}</td>
              <td className="px-4 py-3">{p.stock_quantity}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs
                  ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 flex gap-2">
                <Link href={`/products/${p.id}/edit`}
                  className="text-blue-600 hover:underline">Edit</Link>
                <DeleteProduct id={p.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}