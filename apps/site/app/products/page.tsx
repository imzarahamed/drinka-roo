import Link from 'next/link'
import { createServerSupabase } from '../../lib/supabase'
import { ProductGrid } from '../../components/product-grid'
import { CategoryBar } from '../../components/category-bar'

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: string; search?: string; page?: string }
}) {
  const supabase = await createServerSupabase()
  const page = Number(searchParams.page ?? 1)
  const limit = 24
  const from = (page - 1) * limit
  const categorySlug = searchParams.category
  const searchQuery = searchParams.search ?? ''

  const [categoriesRes, categoryRes] = await Promise.all([
    supabase.from('categories').select('name,slug').order('sort_order'),
    categorySlug
      ? supabase.from('categories').select('id').eq('slug', categorySlug).single()
      : Promise.resolve({ data: null, error: null })
  ])

  let productQuery = supabase.from('products')
    .select('*, categories(name,slug)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false })

  if (categoryRes?.data?.id) {
    productQuery = productQuery.eq('category_id', categoryRes.data.id)
  }

  if (searchQuery) {
    productQuery = productQuery.ilike('name', `%${searchQuery}%`)
  }

  const productsRes = await productQuery
  let products = productsRes.data ?? []
  let count = productsRes.count ?? 0

  const pageCount = Math.max(1, Math.ceil((count ?? 0) / limit))
  const queryParams = new URLSearchParams()
  if (categorySlug) queryParams.set('category', categorySlug)
  if (searchQuery) queryParams.set('search', searchQuery)

  const prevParams = new URLSearchParams(queryParams)
  prevParams.set('page', String(Math.max(page - 1, 1)))
  const nextParams = new URLSearchParams(queryParams)
  nextParams.set('page', String(Math.min(page + 1, pageCount)))

  const buildHref = (params: URLSearchParams) => 
    `/products${params.toString() ? `?${params.toString()}` : ''}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Product catalog</p>
          <h1 className="mt-3 text-4xl font-semibold">Discover wholesale inventory</h1>
        </div>
        <form action="/products" className="flex w-full max-w-xl gap-2 md:w-auto">
          <input
            name="search"
            defaultValue={searchQuery}
            placeholder="Search products"
            className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-black focus:outline-none"
          />
          <button type="submit" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <CategoryBar categories={categoriesRes.data ?? []} activeSlug={categorySlug} />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
        <p>{count ? `${count} products found` : 'No products found'}</p>
        <div>Page {page} of {pageCount}</div>
      </div>

      <div className="mt-6">
        <ProductGrid products={products} />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Link href={buildHref(prevParams)} className={`rounded-full px-5 py-3 text-sm font-semibold ${page === 1 ? 'bg-slate-200 text-slate-400' : 'bg-black text-white'}`}>
          Previous
        </Link>
        <Link href={buildHref(nextParams)} className={`rounded-full px-5 py-3 text-sm font-semibold ${page >= pageCount ? 'bg-slate-200 text-slate-400' : 'bg-black text-white'}`}>
          Next
        </Link>
      </div>
    </div>
  )
}