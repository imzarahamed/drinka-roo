import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { DateRangeSelector } from './date-range-selector'

type DateRange = 'today' | '7days' | '30days' | '90days' | 'all'

export default async function SalesReportPage({
  searchParams
}: {
  searchParams: { range?: DateRange }
}) {
  const supabase = await createServerSupabase()
  const dateRange = searchParams.range || '30days'
  const dateFilter = getDateFilter(dateRange)

  const [
    { data: salesOrders },
    { data: salesByStatus },
    { data: salesByCustomer },
    { data: salesByProduct },
    { data: dailySales }
  ] = await Promise.all([
    supabase.from('orders')
      .select(`
        id, order_number, total_amount, discount, created_at, status,
        customer_profiles(full_name, company_name)
      `)
      .gte('created_at', dateFilter)
      .order('created_at', { ascending: false }),

    supabase.from('orders')
      .select('status, total_amount')
      .gte('created_at', dateFilter),

    supabase.from('orders')
      .select(`
        customer_id, total_amount, created_at,
        customer_profiles(full_name, company_name)
      `)
      .gte('created_at', dateFilter)
      .eq('status', 'delivered'),

    supabase.from('order_items')
      .select(`
        product_name, quantity, unit_price, subtotal,
        orders!inner(created_at, status)
      `)
      .gte('orders.created_at', dateFilter)
      .eq('orders.status', 'delivered'),

    supabase.from('orders')
      .select('total_amount, created_at')
      .gte('created_at', dateFilter)
      .eq('status', 'delivered')
      .order('created_at', { ascending: true })
  ])

  const totalRevenue = salesOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const deliveredRevenue = salesOrders?.filter(o => o.status === 'delivered').reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
  const totalDiscount = salesOrders?.reduce((sum, order) => sum + (order.discount || 0), 0) || 0
  const averageOrderValue = salesOrders?.length ? totalRevenue / salesOrders.length : 0

  const statusData = processStatusData(salesByStatus || [])
  const topCustomers = processTopCustomers(salesByCustomer || [])
  const topProducts = processTopProducts(salesByProduct || [])
  const chartData = processDailySales(dailySales || [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/reports" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Reports
          </Link>
          <h1 className="text-2xl font-semibold">Sales Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            {dateRange === 'today' ? 'Today' :
             dateRange === '7days' ? 'Last 7 days' :
             dateRange === '30days' ? 'Last 30 days' :
             dateRange === '90days' ? 'Last 90 days' : 'All time'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DateRangeSelector currentRange={dateRange} basePath="/reports/sales" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Delivered Revenue', value: `$${deliveredRevenue.toLocaleString()}`, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Total Orders', value: salesOrders?.length || 0, color: 'bg-purple-50 text-purple-700 border-purple-200' },
          { label: 'Avg Order Value', value: `$${averageOrderValue.toFixed(2)}`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border p-4 ${color}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Sales Trend</h3>
          <div className="h-64 flex items-end space-x-1">
            {chartData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 w-full rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(data.value / Math.max(...chartData.map(d => d.value))) * 100}%` }}
                  title={`${data.label}: $${data.value.toLocaleString()}`}
                />
                <span className="text-xs text-gray-500 mt-2 text-center transform rotate-45 origin-left">
                  {data.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Sales by Status</h3>
          <div className="space-y-3">
            {statusData.map(({ status, count, revenue, color }) => (
              <div key={status} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium capitalize">{status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{count} orders</div>
                    <div className="text-xs text-gray-500">${revenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${color.replace('bg-', 'bg-').replace('-200', '-500')}`}
                    style={{ width: `${(revenue / totalRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="space-y-3">
            {topCustomers.slice(0, 8).map((customer, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.orderCount} orders</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">${customer.totalSpent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.slice(0, 8).map((product, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">#{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantitySold} sold</p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">${product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Sales Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesOrders?.slice(0, 20).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.order_number}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.customer_profiles?.full_name || order.customer_profiles?.company_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${order.total_amount?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

function processStatusData(orders: any[]) {
  const statusMap = new Map()
  const colors = {
    pending: 'bg-yellow-200',
    confirmed: 'bg-blue-200',
    processing: 'bg-purple-200',
    dispatched: 'bg-orange-200',
    delivered: 'bg-green-200',
    cancelled: 'bg-red-200'
  }

  orders.forEach(order => {
    const status = order.status
    const amount = order.total_amount || 0

    if (statusMap.has(status)) {
      const existing = statusMap.get(status)
      statusMap.set(status, {
        ...existing,
        count: existing.count + 1,
        revenue: existing.revenue + amount
      })
    } else {
      statusMap.set(status, {
        status,
        count: 1,
        revenue: amount,
        color: colors[status as keyof typeof colors] || 'bg-gray-200'
      })
    }
  })

  return Array.from(statusMap.values())
    .sort((a, b) => b.revenue - a.revenue)
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

function processDailySales(orders: any[]) {
  const dailyMap = new Map()

  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString()
    const amount = order.total_amount || 0

    dailyMap.set(date, (dailyMap.get(date) || 0) + amount)
  })

  return Array.from(dailyMap.entries())
    .map(([label, value]) => ({ label, value }))
    .slice(-14)
}