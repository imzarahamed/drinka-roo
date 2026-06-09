import Link from 'next/link'
import { AddStaffForm } from './add-staff-form'

export default function NewStaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/staff" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
          ← Back to Staff
        </Link>
        <h1 className="text-2xl font-semibold">Add New Staff Member</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new hub user account with appropriate permissions</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <AddStaffForm />
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
      </div>
    </div>
  )
}