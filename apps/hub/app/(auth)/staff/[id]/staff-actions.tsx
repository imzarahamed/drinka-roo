'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Staff {
  id: string
  full_name: string
  role: string
  is_active: boolean
}

export function StaffActions({ staff }: { staff: Staff }) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  const handleToggleStatus = async () => {
    const action = staff.is_active ? 'deactivate' : 'activate'
    const confirmed = confirm(`Are you sure you want to ${action} ${staff.full_name}?`)

    if (!confirmed) return

    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !staff.is_active })
      })

      if (response.ok) {
        router.refresh()
        setShowMenu(false)
      } else {
        alert(`Failed to ${action} staff member`)
      }
    } catch (error) {
      alert(`Error ${action}ing staff member`)
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete ${staff.full_name}? This action cannot be undone.`)

    if (!confirmed) return

    try {
      const response = await fetch(`/api/staff/${staff.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/staff')
      } else {
        alert('Failed to delete staff member')
      }
    } catch (error) {
      alert('Error deleting staff member')
    }
  }

  const handleResetPassword = async () => {
    const confirmed = confirm(`Send password reset email to ${staff.full_name}?`)

    if (!confirmed) return

    try {
      const response = await fetch(`/api/staff/${staff.id}/reset-password`, {
        method: 'POST'
      })

      if (response.ok) {
        alert('Password reset email sent successfully')
        setShowMenu(false)
      } else {
        alert('Failed to send password reset email')
      }
    } catch (error) {
      alert('Error sending password reset email')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Actions
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleToggleStatus}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {staff.is_active ? 'Deactivate' : 'Activate'} User
            </button>

            <button
              onClick={handleResetPassword}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Reset Password
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete User
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}