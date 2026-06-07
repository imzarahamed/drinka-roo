import { createServerSupabase } from '../../../lib/supabase'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Account</h1>
        <p className="text-slate-400 text-sm mt-1">Your account details</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-medium text-slate-900">Profile Information</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Full Name',    value: profile?.full_name },
            { label: 'Email',        value: user.email },
            { label: 'Company',      value: profile?.company_name ?? '—' },
            { label: 'Phone',        value: profile?.phone ?? '—' },
            { label: 'Address',      value: profile?.address ?? '—' },
            { label: 'Member Since', value: profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0">
              <p className="text-sm text-slate-500 w-32 flex-shrink-0">{label}</p>
              <p className="text-sm text-slate-900 font-medium text-right">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-4 text-center">
        To update your account details, please contact your account manager.
      </p>
    </div>
  )
}