'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  role: string
  is_active: boolean
}

interface PreferencesFormProps {
  profile: Profile
}

export function PreferencesForm({ profile }: PreferencesFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    currency: 'USD',
    itemsPerPage: '20',
    defaultOrderView: 'all',
    theme: 'light',
    language: 'en'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        router.refresh()
        alert('Preferences saved successfully')
      } else {
        const error = await response.text()
        alert(`Error saving preferences: ${error}`)
      }
    } catch (error) {
      alert('Error saving preferences. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            id="dateFormat"
            name="dateFormat"
            value={preferences.dateFormat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/dd/yyyy">MM/dd/yyyy (US)</option>
            <option value="dd/MM/yyyy">dd/MM/yyyy (UK)</option>
            <option value="yyyy-MM-dd">yyyy-MM-dd (ISO)</option>
            <option value="dd MMM yyyy">dd MMM yyyy</option>
          </select>
        </div>

        <div>
          <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            id="timeFormat"
            name="timeFormat"
            value={preferences.timeFormat}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Currency Display
          </label>
          <select
            id="currency"
            name="currency"
            value={preferences.currency}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        <div>
          <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-2">
            Items Per Page
          </label>
          <select
            id="itemsPerPage"
            name="itemsPerPage"
            value={preferences.itemsPerPage}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10 items</option>
            <option value="20">20 items</option>
            <option value="50">50 items</option>
            <option value="100">100 items</option>
          </select>
        </div>

        <div>
          <label htmlFor="defaultOrderView" className="block text-sm font-medium text-gray-700 mb-2">
            Default Order View
          </label>
          <select
            id="defaultOrderView"
            name="defaultOrderView"
            value={preferences.defaultOrderView}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending Orders</option>
            <option value="processing">Processing Orders</option>
            <option value="assigned">My Assigned Orders</option>
          </select>
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={preferences.theme}
            onChange={handleChange}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme (Coming Soon)</option>
            <option value="auto">Auto (System)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Dark theme coming in a future update</p>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="text-gray-900">
              {new Date().toLocaleDateString('en-US', {
                ...(preferences.dateFormat === 'MM/dd/yyyy' && { month: '2-digit', day: '2-digit', year: 'numeric' }),
                ...(preferences.dateFormat === 'dd/MM/yyyy' && { day: '2-digit', month: '2-digit', year: 'numeric' }),
                ...(preferences.dateFormat === 'yyyy-MM-dd' && { year: 'numeric', month: '2-digit', day: '2-digit' }),
                ...(preferences.dateFormat === 'dd MMM yyyy' && { day: '2-digit', month: 'short', year: 'numeric' })
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time:</span>
            <span className="text-gray-900">
              {new Date().toLocaleTimeString('en-US', {
                hour12: preferences.timeFormat === '12h',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Currency:</span>
            <span className="text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: preferences.currency
              }).format(1234.56)}
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => setPreferences({
            dateFormat: 'MM/dd/yyyy',
            timeFormat: '12h',
            currency: 'USD',
            itemsPerPage: '20',
            defaultOrderView: 'all',
            theme: 'light',
            language: 'en'
          })}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  )
}