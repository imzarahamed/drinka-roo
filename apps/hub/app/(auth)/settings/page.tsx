import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsNav } from './settings-nav'
import { DangerZone } from './danger-zone'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('hub_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get account activity data
  const [
    { data: recentLogins },
    { data: createdProducts, count: productsCount },
    { data: createdCustomers, count: customersCount },
    { data: assignedOrders, count: ordersCount }
  ] = await Promise.all([
    // This would need to be implemented with actual login tracking
    Promise.resolve({ data: [] }),

    supabase.from('products')
      .select('id, name, created_at', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('customer_profiles')
      .select('id, full_name, company_name, created_at', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('orders')
      .select('id, order_number, status, created_at', { count: 'exact' })
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

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
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Profile Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Profile Overview</h2>
            <div className="flex items-start space-x-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">
                  {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{profile.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${roleColors[profile.role]}`}>
                    {roleLabels[profile.role]}
                  </span>
                </div>
                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Member since {new Date(profile.created_at!).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{productsCount ?? 0}</div>
              <div className="text-sm text-blue-700">Products Created</div>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="text-2xl font-bold text-green-600">{customersCount ?? 0}</div>
              <div className="text-sm text-green-700">Customers Added</div>
            </div>
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <div className="text-2xl font-bold text-purple-600">{ordersCount ?? 0}</div>
              <div className="text-sm text-purple-700">Orders Assigned</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {createdProducts?.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created product "{product.name}"</p>
                    <p className="text-xs text-gray-500">{new Date(product.created_at!).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {createdCustomers?.map((customer) => (
                <div key={customer.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Added customer "{customer.full_name || customer.company_name}"</p>
                    <p className="text-xs text-gray-500">{new Date(customer.created_at!).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {assignedOrders?.map((order) => (
                <div key={order.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h8a2 2 0 012 2v9a2 2 0 01-2 2h-8m0 0V9a2 2 0 012-2h6a2 2 0 012 2v11a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assigned to order {order.order_number}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at!).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}

              {(!createdProducts?.length && !createdCustomers?.length && !assignedOrders?.length) && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h2m0-13h8a2 2 0 012 2v9a2 2 0 01-2 2h-8m0 0V9a2 2 0 012-2h6a2 2 0 012 2v11a2 2 0 01-2 2h-6a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          <DangerZone />
        </div>
      </div>
    </div>
  )
}