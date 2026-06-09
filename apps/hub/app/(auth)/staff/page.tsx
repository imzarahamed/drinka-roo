import { createServerSupabase } from '@/lib/supabase'
import { StaffClient } from './staff-client'
import Link from 'next/link'

export default async function StaffPage({
  searchParams
}: {
  searchParams: { search?: string; role?: string; status?: string }
}) {
  const supabase = await createServerSupabase()

  let query = supabase
    .from('hub_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.search) {
    query = query.ilike('full_name', `%${searchParams.search}%`)
  }

  if (searchParams.role) {
    query = query.eq('role', searchParams.role)
  }

  if (searchParams.status) {
    query = query.eq('is_active', searchParams.status === 'active')
  }

  const { data: staff } = await query

  const [
    { count: totalStaff },
    { count: activeStaff },
    { count: inactiveStaff },
    { count: superAdmins },
    { count: managers },
    { count: orderViewers },
    { count: staffMembers }
  ] = await Promise.all([
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('is_active', false),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('role', 'super_admin'),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('role', 'manager'),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('role', 'order_viewer'),
    supabase.from('hub_profiles').select('*', { count: 'exact', head: true }).eq('role', 'staff')
  ])

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800 border-red-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    order_viewer: 'bg-green-100 text-green-800 border-green-200',
    staff: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const roleLabels = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    order_viewer: 'Order Viewer',
    staff: 'Staff'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hub users and their permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/staff/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Staff Member
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: totalStaff ?? 0, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Active', value: activeStaff ?? 0, color: 'bg-green-50 text-green-700 border-green-200' },
          { label: 'Inactive', value: inactiveStaff ?? 0, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Admins', value: (superAdmins ?? 0) + (managers ?? 0), color: 'bg-purple-50 text-purple-700 border-purple-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg border p-4 ${color}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {[
              { role: 'super_admin', count: superAdmins ?? 0, label: 'Super Admins', color: 'bg-red-200' },
              { role: 'manager', count: managers ?? 0, label: 'Managers', color: 'bg-blue-200' },
              { role: 'order_viewer', count: orderViewers ?? 0, label: 'Order Viewers', color: 'bg-green-200' },
              { role: 'staff', count: staffMembers ?? 0, label: 'Staff', color: 'bg-gray-200' },
            ].map(({ role, count, label, color }) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <StaffClient
            initialStaff={staff || []}
            searchParams={searchParams}
            roleColors={roleColors}
            roleLabels={roleLabels}
          />
        </div>
      </div>
    </div>
  )
}