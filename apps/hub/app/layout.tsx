// Use the local path to the server-side Supabase helper. Adjust if your project
// keeps the helper in a different location (e.g. /lib or /utils).
// Adjusted import to use the project-level lib path where the Supabase
// server helper typically resides.
import { createServerSupabase } from '../lib/supabase'
import { redirect } from 'next/navigation'
import { Sidebar } from '../components/sidebar'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('hub_profiles').select('full_name, role').eq('id', user.id).single()

  return (
    <div className="flex h-screen">
      <Sidebar role={profile?.role} userName={profile?.full_name} />
      <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
    </div>
  )
}