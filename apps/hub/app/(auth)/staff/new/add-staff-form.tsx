'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AddStaffForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'staff' as 'super_admin' | 'manager' | 'order_viewer' | 'staff',
    is_active: true,
    password: '',
    confirm_password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      // Here you would implement the API call to create the staff member
      // This would typically involve:
      // 1. Creating an auth user in Supabase
      // 2. Creating a hub_profile record
      // 3. Sending invitation email

      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          password: formData.password
        })
      })

      if (response.ok) {
        router.push('/staff')
      } else {
        const error = await response.text()
        alert(`Error creating staff member: ${error}`)
      }
    } catch (error) {
      alert('Error creating staff member. Please try again.')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            required
            minLength={8}
            value={formData.confirm_password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm password"
          />
        </div>
      </div>

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
          Active (user can log in immediately)
        </label>
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
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Staff Member'}
        </button>
      </div>
    </form>
  )
}