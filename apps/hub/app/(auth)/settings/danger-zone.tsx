'use client'

export function DangerZone() {
  const handleDeactivationRequest = () => {
    alert('Account deactivation requires administrator approval. Please contact your system administrator.')
  }

  return (
    <div className="bg-white rounded-lg border border-red-200 p-6">
      <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <h4 className="font-medium text-red-900">Request Account Deactivation</h4>
            <p className="text-sm text-red-700">Temporarily disable your account access</p>
          </div>
          <button
            onClick={handleDeactivationRequest}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50"
          >
            Request Deactivation
          </button>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Important Notes</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Only Super Admins can deactivate or delete staff accounts</div>
            <div>• Account deactivation requires administrator approval</div>
            <div>• Deactivated accounts can be reactivated by administrators</div>
            <div>• Account deletion is permanent and cannot be undone</div>
            <div>• All data associated with deleted accounts will be removed</div>
          </div>
        </div>
      </div>
    </div>
  )
}