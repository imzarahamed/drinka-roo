'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  roles: ['super_admin','manager','order_viewer','staff'] },
  { href: '/orders',     label: 'Orders',      roles: ['super_admin','manager','order_viewer','staff'] },
  { href: '/products',   label: 'Products',    roles: ['super_admin','manager'] },
  { href: '/categories', label: 'Categories', roles: ['super_admin','manager'] },
  { href: '/customers',  label: 'Customers',   roles: ['super_admin','manager'] },
  { href: '/reports',    label: 'Reports',     roles: ['super_admin','manager'] },
  { href: '/staff',      label: 'Staff',       roles: ['super_admin'] },
  { href: '/settings',   label: 'Settings',    roles: ['super_admin'] },
]

export function Sidebar({ role, userName }: { role?: string; userName?: string }) {
  const pathname = usePathname()
  const visible = role
    ? NAV.filter(n => n.roles.includes(role))
    : NAV.map(n => ({ ...n, disabled: true }))

  return (
    <aside className="w-56 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <p className="font-semibold text-sm">HUB</p>
        <p className="text-xs text-gray-400 capitalize">{role ? role.replace('_',' ') : 'No profile'}</p>
      </div>
      <nav className="flex-1 p-2">
        {visible.map((n: any) => (
          n.disabled ? (
            <div key={n.href} className={`flex items-center px-3 py-2 rounded-lg text-sm mb-1 text-gray-300`}>
              {n.label}
            </div>
          ) : (
            <Link key={n.href} href={n.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm mb-1 transition
                ${pathname.startsWith(n.href) ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
              {n.label}
            </Link>
          )
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="text-sm text-gray-500 mb-3">{userName}</div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </aside>
  )
}