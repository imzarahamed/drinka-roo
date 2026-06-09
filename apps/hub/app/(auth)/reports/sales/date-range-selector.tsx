'use client'

interface DateRangeSelectorProps {
  currentRange: string
  basePath: string
}

export function DateRangeSelector({ currentRange, basePath }: DateRangeSelectorProps) {
  return (
    <select
      value={currentRange}
      onChange={(e) => {
        const newRange = e.target.value
        const params = new URLSearchParams()
        if (newRange !== '30days') params.set('range', newRange)
        window.location.href = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`
      }}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="today">Today</option>
      <option value="7days">Last 7 days</option>
      <option value="30days">Last 30 days</option>
      <option value="90days">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  )
}