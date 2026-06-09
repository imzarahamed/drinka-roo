import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsNav } from '../settings-nav'
import { ActivityLog } from './activity-log'

export default async function ActivityPage({
  searchParams
}: {
  searchParams: { filter?: string }
}) {
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

  // Get user activity data
  const [
    { data: createdProducts, count: productsCount },
    { data: createdCustomers, count: customersCount },
    { data: assignedOrders, count: ordersCount },
    { data: allProducts },
    { data: allCustomers },
    { data: allOrders }
  ] = await Promise.all([
    supabase.from('products')
      .select('id, name, created_at, is_active', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(searchParams.filter === 'products' ? 50 : 10),

    supabase.from('customer_profiles')
      .select('id, full_name, company_name, created_at', { count: 'exact' })
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(searchParams.filter === 'customers' ? 50 : 10),

    supabase.from('orders')
      .select('id, order_number, status, total_amount, created_at, customer_profiles(full_name, company_name)', { count: 'exact' })
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })
      .limit(searchParams.filter === 'orders' ? 50 : 10),

    // Get all for combined timeline if no filter
    !searchParams.filter ? supabase.from('products')
      .select('id, name, created_at, is_active')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20) : Promise.resolve({ data: [] }),

    !searchParams.filter ? supabase.from('customer_profiles')
      .select('id, full_name, company_name, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(20) : Promise.resolve({ data: [] }),

    !searchParams.filter ? supabase.from('orders')
      .select('id, order_number, status, created_at, customer_profiles(full_name, company_name)')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })
      .limit(20) : Promise.resolve({ data: [] })
  ])

  // Create combined timeline for overview
  const combinedActivity = []

  if (!searchParams.filter) {
    allProducts?.forEach(item => {
      combinedActivity.push({
        type: 'product',
        action: 'created',
        title: `Created product "${item.name}"`,
        timestamp: item.created_at,
        data: item
      })
    })

    allCustomers?.forEach(item => {
      combinedActivity.push({
        type: 'customer',
        action: 'created',
        title: `Added customer "${item.full_name || item.company_name}"`,
        timestamp: item.created_at,
        data: item
      })
    })

    allOrders?.forEach(item => {
      combinedActivity.push({
        type: 'order',
        action: 'assigned',
        title: `Assigned to order ${item.order_number}`,
        timestamp: item.created_at,
        data: item
      })
    })
  }

  combinedActivity.sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">View your account activity and contributions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Activity Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Activity Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{productsCount ?? 0}</div>
                <div className="text-sm text-blue-700">Products Created</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{customersCount ?? 0}</div>
                <div className="text-sm text-green-700">Customers Added</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{ordersCount ?? 0}</div>
                <div className="text-sm text-purple-700">Orders Assigned</div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <ActivityLog
            combinedActivity={combinedActivity}
            createdProducts={createdProducts || []}
            createdCustomers={createdCustomers || []}
            assignedOrders={assignedOrders || []}
            currentFilter={searchParams.filter}
          />
        </div>
      </div>
    </div>
  )
}