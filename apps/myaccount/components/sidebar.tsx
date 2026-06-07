'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../lib/supabase-client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard',    icon: '⬡' },
  { href: '/orders',    label: 'My Orders',     icon: '◫' },
  { href: '/catalog',   label: 'Browse Catalog', icon: '◈' },
  { href: '/account',   label: 'Account',        icon: '◎' },
]

export function Sidebar({ userName, companyName }: { userName?: string; companyName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-slate-950 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-medium mb-1">Wholesale</p>
        <p className="text-white text-xl font-semibold tracking-tight">MyAccount</p>
      </div>

      {/* User info */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-semibold">
            {userName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName ?? 'Customer'}</p>
            {companyName && (
              <p className="text-slate-500 text-xs truncate">{companyName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href))
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base leading-none opacity-80">{n.icon}</span>
              {n.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-6 pt-2 border-t border-white/10 mt-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-150 text-left"
        >
          <span className="text-base">⎋</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}