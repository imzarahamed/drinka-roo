import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function InventoryReportPage() {
  const supabase = await createServerSupabase()

  const [
    { data: products },
    { data: lowStockProducts },
    { data: outOfStockProducts },
    { data: categoryStock }
  ] = await Promise.all([
    supabase.from('products')
      .select(`
        id, name, sku, stock_quantity, price, cost_price, is_active,
        categories(name)
      `)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true }),

    supabase.from('products')
      .select(`
        id, name, sku, stock_quantity, price,
        categories(name)
      `)
      .eq('is_active', true)
      .lte('stock_quantity', 10)
      .gt('stock_quantity', 0)
      .order('stock_quantity', { ascending: true }),

    supabase.from('products')
      .select(`
        id, name, sku, categories(name)
      `)
      .eq('is_active', true)
      .eq('stock_quantity', 0),

    supabase.from('products')
      .select(`
        stock_quantity, price, cost_price,
        categories(name)
      `)
      .eq('is_active', true)
  ])

  const totalProducts = products?.length || 0
  const totalValue = products?.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0) || 0
  const totalCostValue = products?.reduce((sum, p) => sum + (p.stock_quantity * (p.cost_price || 0)), 0) || 0

  const categoryStockData = processCategoryStock(categoryStock || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/reports" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Reports
          </Link>
          <h1 className="text-2xl font-semibold">Inventory Report</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Cost Value', value: `$${totalCostValue.toLocaleString()}`, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Low Stock Items', value: lowStockProducts?.length || 0, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border p-4 ${color}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Out of Stock Products ({outOfStockProducts?.length || 0})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {outOfStockProducts?.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-800">{product.name}</p>
                  <p className="text-sm text-red-600">SKU: {product.sku || 'N/A'}</p>
                  <p className="text-xs text-red-500">{product.categories?.name || 'Uncategorized'}</p>
                </div>
                <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                  Out of Stock
                </span>
              </div>
            )) || <p className="text-gray-500 text-center">No out of stock products</p>}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">Low Stock Products ({lowStockProducts?.length || 0})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {lowStockProducts?.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-800">{product.name}</p>
                  <p className="text-sm text-orange-600">SKU: {product.sku || 'N/A'}</p>
                  <p className="text-xs text-orange-500">{product.categories?.name || 'Uncategorized'}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                    {product.stock_quantity} left
                  </span>
                  <p className="text-xs text-gray-500 mt-1">${product.price}</p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center">No low stock products</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStockData.map((category, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{category.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">{category.productCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stock:</span>
                  <span className="font-medium">{category.totalStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-medium text-green-600">${category.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">All Products Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products?.slice(0, 50).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.categories?.name || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.sku || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-medium ${
                      product.stock_quantity === 0 ? 'text-red-600' :
                      product.stock_quantity <= 10 ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">
                    ${(product.stock_quantity * product.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock_quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stock_quantity <= 10
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stock_quantity === 0 ? 'Out of Stock' :
                       product.stock_quantity <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(products?.length || 0) > 50 && (
          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
            Showing first 50 products of {products?.length} total
          </div>
        )}
      </div>
    </div>
  )
}

function processCategoryStock(products: any[]) {
  const categoryMap = new Map()

  products.forEach(product => {
    const categoryName = product.categories?.name || 'Uncategorized'
    const stock = product.stock_quantity || 0
    const value = stock * (product.price || 0)

    if (categoryMap.has(categoryName)) {
      const existing = categoryMap.get(categoryName)
      categoryMap.set(categoryName, {
        ...existing,
        productCount: existing.productCount + 1,
        totalStock: existing.totalStock + stock,
        value: existing.value + value
      })
    } else {
      categoryMap.set(categoryName, {
        name: categoryName,
        productCount: 1,
        totalStock: stock,
        value: value
      })
    }
  })

  return Array.from(categoryMap.values())
    .sort((a, b) => b.value - a.value)
}