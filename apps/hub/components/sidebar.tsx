'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  roles: ['super_admin','manager','order_viewer','staff'] },
  { href: '/orders',     label: 'Orders',      roles: ['super_admin','manager','order_viewer','staff'] },
  { href: '/products',   label: 'Products',    roles: ['super_admin','manager'] },
  { href: '/customers',  label: 'Customers',   roles: ['super_admin','manager'] },
  { href: '/reports',    label: 'Reports',     roles: ['super_admin','manager'] },
  { href: '/staff',      label: 'Staff',       roles: ['super_admin'] },
  { href: '/settings',   label: 'Settings',    roles: ['super_admin'] },
]

export function Sidebar({ role, userName }: { role?: string; userName?: string }) {
  const pathname = usePathname()
  const visible = NAV.filter(n => role && n.roles.includes(role))

  return (
    <aside className="w-56 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <p className="font-semibold text-sm">HUB</p>
        <p className="text-xs text-gray-400 capitalize">{role?.replace('_',' ')}</p>
      </div>
      <nav className="flex-1 p-2">
        {visible.map(n => (
          <Link key={n.href} href={n.href}
            className={`flex items-center px-3 py-2 rounded-lg text-sm mb-1 transition
              ${pathname.startsWith(n.href) ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t text-sm text-gray-500">{userName}</div>
    </aside>
  )
}