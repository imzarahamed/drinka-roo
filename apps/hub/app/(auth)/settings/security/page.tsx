import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsNav } from '../settings-nav'
import { SecurityForm } from './security-form'

export default async function SecurityPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('hub_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your security and authentication settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Password Section */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Password & Authentication</h2>
              <p className="text-sm text-gray-500 mt-1">Update your password and manage authentication settings</p>
            </div>

            <SecurityForm userEmail={user.email || ''} />
          </div>

          {/* Account Security Overview */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Security Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Account Active</p>
                    <p className="text-xs text-green-700">Your account is active and verified</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 px-2 py-1 bg-green-100 rounded-full">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Email Verified</p>
                    <p className="text-xs text-blue-700">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs text-blue-600 px-2 py-1 bg-blue-100 rounded-full">
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-600">Add an extra layer of security (Coming Soon)</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Security Tips</h3>
            <div className="space-y-1 text-sm text-yellow-800">
              <div>• Use a strong password with at least 8 characters</div>
              <div>• Include uppercase, lowercase, numbers, and special characters</div>
              <div>• Don't reuse passwords from other accounts</div>
              <div>• Change your password regularly for better security</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}