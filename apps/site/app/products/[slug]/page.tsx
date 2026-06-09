import { createServerSupabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.from('products').select('name,meta_title,meta_desc')
    .eq('slug', params.slug).single()
  if (!data) return { title: 'Product not found' }
  return { title: data.meta_title || data.name, description: data.meta_desc }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = await createServerSupabase()
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name,slug)')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Image gallery */}
      <div>
        {product.images?.map((url: string, i: number) => (
          <img key={i} src={url} alt={product.name} className="rounded-lg mb-2 w-full" />
        ))}
      </div>
      {/* Product info */}
      <div>
        <p className="text-sm text-gray-500">{product.categories?.name}</p>
        <h1 className="text-3xl font-semibold mt-1">{product.name}</h1>
        <p className="text-2xl mt-4">${product.price.toFixed(2)}</p>
        <p className="mt-4 text-gray-600">{product.description}</p>
        <p className="mt-4 text-sm text-gray-400">SKU: {product.sku}</p>
        <a href="/login" className="block mt-8 text-center bg-black text-white py-3 rounded-lg">
          Login to order
        </a>
      </div>
    </div>
  )
}