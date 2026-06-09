'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ActivityItem {
  type: string
  action: string
  title: string
  timestamp: string
  data: any
}

interface ActivityLogProps {
  combinedActivity: ActivityItem[]
  createdProducts: any[]
  createdCustomers: any[]
  assignedOrders: any[]
  currentFilter?: string
}

export function ActivityLog({
  combinedActivity,
  createdProducts,
  createdCustomers,
  assignedOrders,
  currentFilter
}: ActivityLogProps) {
  const router = useRouter()

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams()
    if (filter !== 'all') {
      params.set('filter', filter)
    }
    router.push(`/settings/activity?${params.toString()}`)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )
      case 'customer':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )
      case 'order':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h8a2 2 0 012 2v9a2 2 0 01-2 2h-8m0 0V9a2 2 0 012-2h6a2 2 0 012 2v11a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
    }
  }

  const renderActivity = () => {
    if (currentFilter === 'products') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Products Created</h3>
          {createdProducts.map((product) => (
            <div key={product.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {getActivityIcon('product')}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{product.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Created on {new Date(product.created_at!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Product →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (currentFilter === 'customers') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customers Added</h3>
          {createdCustomers.map((customer) => (
            <div key={customer.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {getActivityIcon('customer')}
              <div className="flex-1">
                <h4 className="font-medium">{customer.full_name || customer.company_name}</h4>
                <p className="text-sm text-gray-500">
                  Added on {new Date(customer.created_at!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/customers/${customer.id}/edit`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Customer →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (currentFilter === 'orders') {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Orders Assigned</h3>
          {assignedOrders.map((order) => (
            <div key={order.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              {getActivityIcon('order')}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{order.order_number}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Customer: {order.customer_profiles?.full_name || order.customer_profiles?.company_name || 'N/A'}
                </p>
                {order.total_amount && (
                  <p className="text-sm font-medium text-gray-900">
                    ${order.total_amount.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Assigned on {new Date(order.created_at!).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Order →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Default: Combined timeline
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        {combinedActivity.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <h4 className="font-medium">{activity.title}</h4>
              <p className="text-sm text-gray-500">
                {new Date(activity.timestamp!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={currentFilter || 'all'}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Activity</option>
            <option value="products">Products Only</option>
            <option value="customers">Customers Only</option>
            <option value="orders">Orders Only</option>
          </select>
        </div>
      </div>

      {renderActivity()}

      {/* No activity message */}
      {(!currentFilter && combinedActivity.length === 0) ||
       (currentFilter === 'products' && createdProducts.length === 0) ||
       (currentFilter === 'customers' && createdCustomers.length === 0) ||
       (currentFilter === 'orders' && assignedOrders.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h8a2 2 0 012 2v9a2 2 0 01-2 2h-8m0 0V9a2 2 0 012-2h6a2 2 0 012 2v11a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h3>
          <p className="text-gray-500">
            {currentFilter
              ? `No ${currentFilter} activity found for your account.`
              : 'No recent activity found for your account.'}
          </p>
        </div>
      ) : null}
    </div>
  )
}