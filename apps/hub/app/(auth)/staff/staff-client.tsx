'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Staff {
  id: string
  full_name: string
  role: 'super_admin' | 'manager' | 'order_viewer' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface StaffClientProps {
  initialStaff: Staff[]
  searchParams: { search?: string; role?: string; status?: string }
  roleColors: Record<string, string>
  roleLabels: Record<string, string>
}

export function StaffClient({ initialStaff, searchParams, roleColors, roleLabels }: StaffClientProps) {
  const router = useRouter()
  const [selectedStaff, setSelectedStaff] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

  const handleSearch = (search: string) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (searchParams.role) params.set('role', searchParams.role)
    if (searchParams.status) params.set('status', searchParams.status)

    router.push(`/staff?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (searchParams.search) params.set('search', searchParams.search)

    if (key === 'role' && value !== 'all') {
      params.set('role', value)
    }
    if (key === 'status' && value !== 'all') {
      params.set('status', value)
    }

    // Preserve other filters
    if (key !== 'role' && searchParams.role) params.set('role', searchParams.role)
    if (key !== 'status' && searchParams.status) params.set('status', searchParams.status)

    router.push(`/staff?${params.toString()}`)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStaff(initialStaff.map(s => s.id))
    } else {
      setSelectedStaff([])
    }
  }

  const handleSelectStaff = (staffId: string, checked: boolean) => {
    if (checked) {
      setSelectedStaff(prev => [...prev, staffId])
    } else {
      setSelectedStaff(prev => prev.filter(id => id !== staffId))
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedStaff.length === 0) return

    const confirmed = confirm(`Are you sure you want to ${action} ${selectedStaff.length} staff member(s)?`)
    if (!confirmed) return

    // Here you would implement the actual bulk action API calls
    console.log(`Bulk ${action}:`, selectedStaff)

    // Reset selection
    setSelectedStaff([])
    setShowBulkActions(false)

    // Refresh the page
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Staff Members</h3>
          {selectedStaff.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{selectedStaff.length} selected</span>
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Bulk Actions
              </button>
            </div>
          )}
        </div>

        {showBulkActions && selectedStaff.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search staff by name..."
              defaultValue={searchParams.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={searchParams.role || 'all'}
              onChange={(e) => handleFilter('role', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="manager">Manager</option>
              <option value="order_viewer">Order Viewer</option>
              <option value="staff">Staff</option>
            </select>

            <select
              value={searchParams.status || 'all'}
              onChange={(e) => handleFilter('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedStaff.length === initialStaff.length && initialStaff.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(staff.id)}
                    onChange={(e) => handleSelectStaff(staff.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-gray-600">
                        {staff.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{staff.full_name}</div>
                      <div className="text-sm text-gray-500">{staff.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${roleColors[staff.role]}`}>
                    {roleLabels[staff.role]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    staff.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(staff.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/staff/${staff.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </Link>
                    <Link
                      href={`/staff/${staff.id}/edit`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {initialStaff.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-500 mb-4">
            {searchParams.search || searchParams.role || searchParams.status
              ? 'Try adjusting your search criteria.'
              : 'Get started by adding your first staff member.'}
          </p>
          <Link
            href="/staff/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Add Staff Member
          </Link>
        </div>
      )}
    </div>
  )
}