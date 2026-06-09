'use client'

import { useState } from 'react'

interface SecurityFormProps {
  userEmail: string
}

export function SecurityForm({ userEmail }: SecurityFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      })

      if (response.ok) {
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
        alert('Password updated successfully')
      } else {
        const error = await response.text()
        alert(`Error updating password: ${error}`)
      }
    } catch (error) {
      alert('Error updating password. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    const confirmed = confirm('Send a password reset email to your registered email address?')
    if (!confirmed) return

    setLoading(true)

    try {
      const response = await fetch('/api/account/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })

      if (response.ok) {
        alert('Password reset email sent successfully')
      } else {
        alert('Error sending password reset email')
      }
    } catch (error) {
      alert('Error sending password reset email')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    if (strength <= 2) return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-500' }
    if (strength <= 3) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-500' }
    if (strength <= 4) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-500' }
    return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.new_password)

  return (
    <div className="space-y-8">
      {/* Change Password Form */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                id="current_password"
                name="current_password"
                required
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.current ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                required
                minLength={8}
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.new ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {passwordForm.new_password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Strength:</span>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${passwordStrength.bgColor}`}
                    style={{ width: `${(getPasswordStrength(passwordForm.new_password).label === 'Weak' ? 20 :
                                             getPasswordStrength(passwordForm.new_password).label === 'Fair' ? 40 :
                                             getPasswordStrength(passwordForm.new_password).label === 'Good' ? 60 : 80)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirm_password"
                name="confirm_password"
                required
                minLength={8}
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPasswords.confirm ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            Send Password Reset Email Instead
          </button>
          <button
            type="submit"
            disabled={loading || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password || passwordForm.new_password !== passwordForm.confirm_password}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}