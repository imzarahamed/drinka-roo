import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StaffActions } from './staff-actions'

export default async function StaffDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: staff } = await supabase
    .from('hub_profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!staff) {
    notFound()
  }

  // Get orders assigned to this staff member
  const { data: assignedOrders, count: ordersCount } = await supabase
    .from('orders')
    .select(`
      id, order_number, status, total_amount, created_at,
      customer_profiles(full_name, company_name)
    `, { count: 'exact' })
    .eq('assigned_to', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get products created by this staff member
  const { data: createdProducts, count: productsCount } = await supabase
    .from('products')
    .select('id, name, created_at, is_active', { count: 'exact' })
    .eq('created_by', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get customers created by this staff member
  const { data: createdCustomers, count: customersCount } = await supabase
    .from('customer_profiles')
    .select('id, full_name, company_name, created_at', { count: 'exact' })
    .eq('created_by', params.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const roleLabels = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    order_viewer: 'Order Viewer',
    staff: 'Staff'
  }

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    order_viewer: 'bg-green-100 text-green-800 border-green-200',
    staff: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/staff" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Staff
          </Link>
          <h1 className="text-2xl font-semibold">{staff.full_name}</h1>
          <p className="text-sm text-gray-500 mt-1">Staff member details and activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href={`/staff/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <StaffActions staff={staff} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Staff Information</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <span className="text-lg font-medium text-gray-600">
                  {staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-medium">{staff.full_name}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${roleColors[staff.role]}`}>
                  {roleLabels[staff.role]}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {staff.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-sm font-mono text-gray-900">{staff.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created:</span>
                <span className="text-sm text-gray-900">{new Date(staff.created_at!).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated:</span>
                <span className="text-sm text-gray-900">{new Date(staff.updated_at!).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{ordersCount ?? 0}</div>
              <div className="text-sm text-blue-700">Assigned Orders</div>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="text-2xl font-bold text-green-600">{productsCount ?? 0}</div>
              <div className="text-sm text-green-700">Products Created</div>
            </div>
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <div className="text-2xl font-bold text-purple-600">{customersCount ?? 0}</div>
              <div className="text-sm text-purple-700">Customers Created</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold mb-4">Recent Assigned Orders</h4>
              <div className="space-y-3">
                {assignedOrders?.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{order.order_number}</div>
                      <div className="text-xs text-gray-500">
                        {order.customer_profiles?.full_name || order.customer_profiles?.company_name || 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${order.total_amount?.toLocaleString()}</div>
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
                )) || <p className="text-gray-500 text-center py-4">No assigned orders</p>}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold mb-4">Recent Created Items</h4>
              <div className="space-y-3">
                {createdProducts?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">Product</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{new Date(product.created_at!).toLocaleDateString()}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )) || <p className="text-gray-500 text-center py-4">No created items</p>}

                {createdCustomers?.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{customer.full_name || customer.company_name}</div>
                      <div className="text-xs text-gray-500">Customer</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{new Date(customer.created_at!).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}