import Link from 'next/link'

export function ProductGrid({ products }: { products?: any[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(products ?? []).map((product) => (
        <Link key={product?.id} href={`/products/${product?.slug ?? product?.id}`} className="group block overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="h-52 bg-gray-100">
            {product?.images?.[0] ? (
              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">No image available</div>
            )}
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-500">{product?.categories?.name}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{product?.name}</h3>
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product?.description ?? 'Wholesale product.'}</p>
            <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>${Number(product?.price ?? 0).toFixed(2)}</span>
              <span className="text-gray-500">{product?.stock_quantity ?? 0} in stock</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
