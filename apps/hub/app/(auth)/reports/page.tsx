import { createServerSupabase } from '@/lib/supabase'
import { ReportsClient } from './reports-client'
import Link from 'next/link'

type DateRange = 'today' | '7days' | '30days' | '90days' | 'all'

export default async function ReportsPage({
  searchParams
}: {
  searchParams: { range?: DateRange }
}) {
  const supabase = await createServerSupabase()
  const dateRange = searchParams.range || '30days'

  const dateFilter = getDateFilter(dateRange)

  const [
    { count: ordersTotal },
    { count: ordersPending },
    { count: ordersConfirmed },
    { count: ordersProcessing },
    { count: ordersDispatched },
    { count: ordersDelivered },
    { count: ordersCancelled },
    { count: productsTotal },
    { count: customersTotal },
    { count: lowStockProducts },
    { data: recentOrders },
    { data: topCustomers },
    { data: topProducts },
    { data: salesData },
    { data: categoryPerformance }
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed').gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'processing').gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'dispatched').gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered').gte('created_at', dateFilter),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled').gte('created_at', dateFilter),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('customer_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true).lte('stock_quantity', 10),

    supabase.from('orders')
      .select('id, order_number, status, total_amount, created_at, customer_profiles(full_name, company_name)')
      .gte('created_at', dateFilter)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase.from('orders')
      .select(`
        customer_id,
        total_amount,
        customer_profiles(full_name, company_name)
      `)
      .gte('created_at', dateFilter)
      .eq('status', 'delivered'),

    supabase.from('order_items')
      .select(`
        product_name,
        quantity,
        subtotal,
        orders!inner(created_at, status)
      `)
      .gte('orders.created_at', dateFilter)
      .eq('orders.status', 'delivered'),

    supabase.from('orders')
      .select('total_amount, created_at')
      .gte('created_at', dateFilter)
      .eq('status', 'delivered')
      .order('created_at', { ascending: true }),

    supabase.from('order_items')
      .select(`
        subtotal,
        quantity,
        products!inner(category_id, categories(name))
      `)
      .gte('orders.created_at', dateFilter)
      .eq('orders.status', 'delivered')
  ])

  const totalRevenue = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const averageOrderValue = salesData?.length ? totalRevenue / salesData.length : 0

  const topCustomersData = processTopCustomers(topCustomers || [])
  const topProductsData = processTopProducts(topProducts || [])
  const categoryData = processCategoryPerformance(categoryPerformance || [])
  const chartData = processChartData(salesData || [], dateRange)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
        <ReportsClient currentRange={dateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/reports/sales" className="block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Sales Report</h3>
              <p className="text-sm text-blue-600">Detailed sales analytics</p>
            </div>
          </div>
        </Link>

        <Link href="/reports/inventory" className="block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:from-green-100 hover:to-green-200 transition-all">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Inventory Report</h3>
              <p className="text-sm text-green-600">Stock levels & valuation</p>
            </div>
          </div>
        </Link>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 opacity-75">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Customer Report</h3>
              <p className="text-sm text-purple-600">Coming soon</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 opacity-75">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">Performance Report</h3>
              <p className="text-sm text-orange-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Total Orders', value: ordersTotal ?? 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Avg Order Value', value: `$${averageOrderValue.toFixed(2)}`, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Customers', value: customersTotal ?? 0, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Low Stock Items', value: lowStockProducts ?? 0, color: 'bg-orange-50 text-orange-700 border-orange-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border p-4 ${color}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <div className="h-64 flex items-end space-x-2">
            {chartData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(data.value / Math.max(...chartData.map(d => d.value))) * 100}%` }}
                  title={`${data.label}: $${data.value.toLocaleString()}`}
                />
                <span className="text-xs text-gray-500 mt-2 text-center">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: ordersPending ?? 0, color: 'bg-yellow-200' },
              { label: 'Confirmed', value: ordersConfirmed ?? 0, color: 'bg-blue-200' },
              { label: 'Processing', value: ordersProcessing ?? 0, color: 'bg-purple-200' },
              { label: 'Dispatched', value: ordersDispatched ?? 0, color: 'bg-orange-200' },
              { label: 'Delivered', value: ordersDelivered ?? 0, color: 'bg-green-200' },
              { label: 'Cancelled', value: ordersCancelled ?? 0, color: 'bg-red-200' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="space-y-3">
            {topCustomersData.slice(0, 5).map((customer, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.orderCount} orders</p>
                </div>
                <p className="font-semibold text-green-600">${customer.totalSpent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProductsData.slice(0, 5).map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.quantitySold} sold</p>
                </div>
                <p className="font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          <div className="space-y-3">
            {categoryData.map((category, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{category.name}</span>
                  <span className="font-semibold">${category.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(category.revenue / Math.max(...categoryData.map(c => c.revenue))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders?.slice(0, 8).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {order.customer_profiles?.full_name || order.customer_profiles?.company_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${order.total_amount?.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getDateFilter(range: DateRange): string {
  const now = new Date()
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    case 'all':
    default:
      return '2020-01-01T00:00:00.000Z'
  }
}

function processTopCustomers(orders: any[]) {
  const customerMap = new Map()

  orders.forEach(order => {
    const customerId = order.customer_id
    const customerName = order.customer_profiles?.full_name || order.customer_profiles?.company_name || 'Unknown'
    const amount = order.total_amount || 0

    if (customerMap.has(customerId)) {
      const existing = customerMap.get(customerId)
      customerMap.set(customerId, {
        ...existing,
        totalSpent: existing.totalSpent + amount,
        orderCount: existing.orderCount + 1
      })
    } else {
      customerMap.set(customerId, {
        name: customerName,
        totalSpent: amount,
        orderCount: 1
      })
    }
  })

  return Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
}

function processTopProducts(orderItems: any[]) {
  const productMap = new Map()

  orderItems.forEach(item => {
    const productName = item.product_name
    const quantity = item.quantity || 0
    const subtotal = item.subtotal || 0

    if (productMap.has(productName)) {
      const existing = productMap.get(productName)
      productMap.set(productName, {
        ...existing,
        quantitySold: existing.quantitySold + quantity,
        revenue: existing.revenue + subtotal
      })
    } else {
      productMap.set(productName, {
        name: productName,
        quantitySold: quantity,
        revenue: subtotal
      })
    }
  })

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
}

function processCategoryPerformance(orderItems: any[]) {
  const categoryMap = new Map()

  orderItems.forEach(item => {
    const categoryName = item.products?.categories?.name || 'Uncategorized'
    const subtotal = item.subtotal || 0

    if (categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, categoryMap.get(categoryName) + subtotal)
    } else {
      categoryMap.set(categoryName, subtotal)
    }
  })

  return Array.from(categoryMap.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

function processChartData(salesData: any[], dateRange: DateRange) {
  if (!salesData.length) return []

  const groupBy = dateRange === 'today' ? 'hour' :
                  dateRange === '7days' ? 'day' :
                  dateRange === '30days' ? 'day' :
                  dateRange === '90days' ? 'week' : 'month'

  const grouped = new Map()

  salesData.forEach(order => {
    const date = new Date(order.created_at)
    let key: string

    if (groupBy === 'hour') {
      key = `${date.getHours()}:00`
    } else if (groupBy === 'day') {
      key = date.toLocaleDateString()
    } else if (groupBy === 'week') {
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
      key = weekStart.toLocaleDateString()
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    grouped.set(key, (grouped.get(key) || 0) + (order.total_amount || 0))
  })

  return Array.from(grouped.entries())
    .map(([label, value]) => ({ label, value }))
    .slice(-12)
}