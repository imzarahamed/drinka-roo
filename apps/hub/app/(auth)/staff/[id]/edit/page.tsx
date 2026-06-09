import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EditStaffForm } from './edit-staff-form'

export default async function EditStaffPage({
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

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/staff/${params.id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to {staff.full_name}
        </Link>
        <h1 className="text-2xl font-semibold">Edit Staff Member</h1>
        <p className="text-sm text-gray-500 mt-1">Update staff member information and permissions</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <EditStaffForm staff={staff} />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Role Permissions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div><strong>Super Admin:</strong> Full system access including staff management and settings</div>
            <div><strong>Manager:</strong> Can manage products, categories, customers, orders, and view reports</div>
            <div><strong>Order Viewer:</strong> Can view and manage orders, access dashboard</div>
            <div><strong>Staff:</strong> Basic access to dashboard and order viewing</div>
          </div>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h3>
          <div className="space-y-1 text-sm text-yellow-800">
            <div>• Changing a user's role will immediately affect their access permissions</div>
            <div>• Deactivating a user will prevent them from logging in</div>
            <div>• Only Super Admins can manage other staff members</div>
          </div>
        </div>
      </div>
    </div>
  )
}