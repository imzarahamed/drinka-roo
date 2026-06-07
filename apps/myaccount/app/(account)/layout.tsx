// apps/myaccount/app/(account)/layout.tsx
import { createServerSupabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('customer_profiles')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        userName={profile?.full_name}
        companyName={profile?.company_name ?? undefined}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}