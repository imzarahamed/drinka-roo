'use client'

import { useRouter } from 'next/navigation'

type DateRange = 'today' | '7days' | '30days' | '90days' | 'all'

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
] as const

interface ReportsClientProps {
  currentRange: DateRange
}

export function ReportsClient({ currentRange }: ReportsClientProps) {
  const router = useRouter()

  const handleRangeChange = (range: DateRange) => {
    const params = new URLSearchParams()
    if (range !== '30days') {
      params.set('range', range)
    }
    const newUrl = `/reports${params.toString() ? `?${params.toString()}` : ''}`
    router.push(newUrl)
  }

  const handleExport = () => {
    window.print()
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Period:</label>
        <select
          value={currentRange}
          onChange={(e) => handleRangeChange(e.target.value as DateRange)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DATE_RANGES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleExport}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report
      </button>
    </div>
  )
}