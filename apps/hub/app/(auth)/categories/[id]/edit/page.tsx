import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { updateCategory } from '../../actions'

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!category) notFound()

  const action = updateCategory.bind(null, params.id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Edit category</h1>

      <form
        action={action}
        className="bg-white rounded-xl border shadow-sm p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            name="name"
            required
            defaultValue={category.name}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={category.slug}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort order</label>
          <input
            name="sort_order"
            type="number"
            min="0"
            defaultValue={category.sort_order ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Save changes
          </button>
          <a
            href="/categories"
            className="px-5 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}