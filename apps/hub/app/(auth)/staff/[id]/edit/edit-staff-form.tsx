'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  full_name: string
  role: 'super_admin' | 'manager' | 'order_viewer' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

export function EditStaffForm({ staff }: { staff: Staff }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: staff.full_name,
    role: staff.role,
    is_active: staff.is_active,
    reset_password: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active,
          reset_password: formData.reset_password
        })
      })

      if (response.ok) {
        if (formData.reset_password) {
          alert('Staff member updated and password reset email sent')
        } else {
          alert('Staff member updated successfully')
        }
        router.push(`/staff/${staff.id}`)
      } else {
        const error = await response.text()
        alert(`Error updating staff member: ${error}`)
      }
    } catch (error) {
      alert('Error updating staff member. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const hasChanges = () => {
    return (
      formData.full_name !== staff.full_name ||
      formData.role !== staff.role ||
      formData.is_active !== staff.is_active ||
      formData.reset_password
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="staff">Staff</option>
            <option value="order_viewer">Order Viewer</option>
            <option value="manager">Manager</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active (user can log in)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reset_password"
              name="reset_password"
              checked={formData.reset_password}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reset_password" className="ml-2 text-sm text-gray-700">
              Send password reset email
            </label>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>User ID:</span>
              <span className="font-mono">{staff.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{new Date(staff.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>{new Date(staff.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !hasChanges()}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Staff Member'}
        </button>
      </div>

      {hasChanges() && (
        <div className="text-sm text-orange-600 text-center">
          You have unsaved changes
        </div>
      )}
    </form>
  )
}