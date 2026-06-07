import Link from 'next/link'
import { createServerSupabase } from '../lib/supabase'
import { ProductGrid } from '../components/product-grid'
import { CategoryBar } from '../components/category-bar'

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const [{ data: featured }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select('*, categories(name,slug)')
      .eq('is_active', true).eq('is_featured', true).limit(8),
    supabase.from('categories').select('name,slug').order('sort_order'),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <section className="rounded-[2rem] bg-slate-950 px-8 py-12 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Wholesale marketplace</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight">Quality products for your business</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">Buy bulk inventory, discover trusted categories, and manage your storefront from a modern wholesale catalog.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950">Browse catalog</Link>
          <a href="#featured" className="rounded-full border border-white px-6 py-3 text-sm text-white hover:bg-white/10">Featured products</a>
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Popular categories</p>
            <h2 className="mt-2 text-3xl font-semibold">Shop by category</h2>
          </div>
          <Link href="/products" className="text-sm text-slate-600 hover:text-slate-900">View all products</Link>
        </div>
        <div className="mt-4">
          <CategoryBar categories={categories ?? []} />
        </div>
      </section>

      <section id="featured" className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured collection</p>
            <h2 className="mt-2 text-3xl font-semibold">Top products</h2>
          </div>
          <Link href="/products" className="text-sm text-slate-600 hover:text-slate-900">See catalog</Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured ?? []} />
        </div>
      </section>
    </div>
  )
}