'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  role: 'super_admin' | 'manager' | 'order_viewer' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  profile: Profile
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile.full_name
  })

  const roleLabels = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    order_viewer: 'Order Viewer',
    staff: 'Staff'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name
        })
      })

      if (response.ok) {
        router.refresh()
        alert('Profile updated successfully')
      } else {
        const error = await response.text()
        alert(`Error updating profile: ${error}`)
      }
    } catch (error) {
      alert('Error updating profile. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const hasChanges = formData.full_name !== profile.full_name

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Section */}
      <div className="flex items-center space-x-6">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl font-medium text-gray-600">
            {formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-medium">{formData.full_name}</h3>
          <p className="text-sm text-gray-500">{userEmail}</p>
          <button
            type="button"
            disabled
            className="mt-2 text-sm text-gray-400 cursor-not-allowed"
          >
            Change Photo (Coming Soon)
          </button>
        </div>
      </div>

      {/* Basic Information */}
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
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={userEmail}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Email changes are handled through security settings
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <input
            type="text"
            id="role"
            value={roleLabels[profile.role]}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            Role changes require Super Admin approval
          </p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">User ID:</span>
            <p className="font-mono text-gray-900">{profile.id.slice(0, 8)}...</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className={profile.is_active ? 'text-green-600' : 'text-red-600'}>
              {profile.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Member Since:</span>
            <p className="text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <p className="text-gray-900">{new Date(profile.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => setFormData({ full_name: profile.full_name })}
          disabled={!hasChanges}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading || !hasChanges}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {hasChanges && (
        <div className="text-sm text-orange-600 text-center">
          You have unsaved changes
        </div>
      )}
    </form>
  )
}