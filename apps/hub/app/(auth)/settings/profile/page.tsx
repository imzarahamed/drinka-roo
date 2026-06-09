import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { SettingsNav } from '../settings-nav'
import { ProfileForm } from './profile-form'

export default async function ProfilePage() {
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
        <p className="text-sm text-gray-500 mt-1">Manage your profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsNav />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Profile Information</h2>
              <p className="text-sm text-gray-500 mt-1">Update your personal information and contact details</p>
            </div>

            <ProfileForm profile={profile} userEmail={user.email || ''} />
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Important Notes</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div>• Your email address is managed through your account authentication</div>
              <div>• Role changes require Super Admin approval</div>
              <div>• Profile updates are visible to other staff members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}