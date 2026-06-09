import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsNav } from '../settings-nav'
import { PreferencesForm } from './preferences-form'

export default async function PreferencesPage() {
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
        <p className="text-sm text-gray-500 mt-1">Customize your preferences and workspace settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsNav />
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Display Preferences */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Display Preferences</h2>
              <p className="text-sm text-gray-500 mt-1">Customize how information is displayed in the hub</p>
            </div>

            <PreferencesForm profile={profile} />
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Notification Settings</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Order Updates</h4>
                  <p className="text-sm text-gray-500">Get notified when orders are assigned to you</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">New Customer Registrations</h4>
                  <p className="text-sm text-gray-500">Get notified about new customer sign-ups</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Low Stock Alerts</h4>
                  <p className="text-sm text-gray-500">Get notified when products are running low</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" disabled />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"></div>
                </label>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Coming Soon:</strong> Email notifications and advanced notification preferences will be available in a future update.
                </p>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Browser:</span>
                <p className="text-gray-900" id="browser-info">Loading...</p>
              </div>
              <div>
                <span className="text-gray-500">Screen Resolution:</span>
                <p className="text-gray-900" id="screen-info">Loading...</p>
              </div>
              <div>
                <span className="text-gray-500">Timezone:</span>
                <p className="text-gray-900">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              </div>
              <div>
                <span className="text-gray-500">Language:</span>
                <p className="text-gray-900">{typeof window !== 'undefined' ? navigator.language : 'en-US'}</p>
              </div>
            </div>

            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if (typeof window !== 'undefined') {
                    document.getElementById('browser-info').textContent = navigator.userAgent.split(' ').slice(-2).join(' ');
                    document.getElementById('screen-info').textContent = window.screen.width + ' × ' + window.screen.height;
                  }
                `
              }}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About Preferences</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Your preferences are saved automatically</div>
              <div>• Settings may vary based on your role and permissions</div>
              <div>• Some features require administrator approval</div>
              <div>• Contact your system administrator for additional customizations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}