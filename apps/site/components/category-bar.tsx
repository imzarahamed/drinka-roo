import Link from 'next/link'

export function CategoryBar({ categories, activeSlug }: { categories?: any[]; activeSlug?: string }) {
  return (
    <nav className="flex flex-wrap gap-2 py-2">
      {(categories ?? []).map((category) => {
        const slug = category?.slug || category?.name?.toLowerCase().replace(/\s+/g, '-')
        return (
          <Link key={slug} href={`/products?category=${encodeURIComponent(slug)}`} className={`rounded-full px-4 py-2 text-sm transition ${activeSlug === slug ? 'bg-black text-white' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'}`}>
            {category?.name ?? category}
          </Link>
        )
      })}
    </nav>
  )
}
