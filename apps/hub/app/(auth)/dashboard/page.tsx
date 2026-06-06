import { createServerSupabase } from '@/lib/supabase'

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('hub_profiles')
    .select('full_name, role, is_active')
    .eq('id', user?.id)
    .single()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome to the Hub admin.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Debug: Auth & Profile</h2>
        <pre className="mt-3 text-xs text-gray-700 bg-gray-50 p-3 rounded">
{JSON.stringify({ user: user ?? null, profile: profile ?? null }, null, 2)}
        </pre>

        <div className="mt-6">
          <p className="text-sm text-gray-500">If `profile` is null, create a `hub_profiles` row for the user id.</p>
        </div>
      </div>
    </div>
  )
}
