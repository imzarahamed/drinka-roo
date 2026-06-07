import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { DeleteCategory } from './delete-button'

export default async function CategoriesPage() {
  const supabase = await createServerSupabase()
  const { data: categories, error } = await supabase
    .from('categories')
    .select(`
      *,
      products(count)
    `)
    .order('sort_order', { ascending: true, nullsFirst: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Link
          href="/categories/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add category
        </Link>
      </div>

      {error && (
        <p className="text-red-500 text-sm mb-4">Error: {error.message}</p>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Sort order</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No categories yet.
                </td>
              </tr>
            )}
            {categories?.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3 text-gray-500">
                  {c.products?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {c.sort_order ?? '—'}
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Link
                    href={`/categories/${c.id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteCategory id={c.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}