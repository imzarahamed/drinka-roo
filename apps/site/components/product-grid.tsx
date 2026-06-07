import Link from 'next/link'
import Image from 'next/image'

export function ProductGrid({ products }: { products?: any[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(products ?? []).map((product) => (
        <Link
          key={product?.id}
          href={`/products/${product?.slug ?? product?.id}`}
          className="card-glow group block overflow-hidden rounded-3xl border border-purple-500/10 bg-[#13131a] transition duration-300"
        >
          <div className="h-52 product-img-placeholder relative overflow-hidden">
            {product?.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-5xl opacity-20 text-purple-300">◈</span>
              </div>
            )}
            {product?.categories?.name && (
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/20 backdrop-blur-sm">
                  {product.categories.name}
                </span>
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-white font-semibold text-base mb-1.5 group-hover:text-purple-300 transition-colors">
              {product?.name}
            </h3>
            <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
              {product?.description ?? 'Premium wholesale product.'}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white text-xl font-bold">
                ${Number(product?.price ?? 0).toFixed(2)}
              </span>
              <span className="text-slate-600 text-xs">
                {product?.stock_quantity ?? 0} in stock
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}