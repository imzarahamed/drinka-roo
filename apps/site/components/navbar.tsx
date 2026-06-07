'use client'
import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop blur bar */}
      <div className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-purple-500/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-black font-black text-xs">
            V
          </div>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.12em' }}
                className="text-xl text-white tracking-widest">
            VAPOR
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {[
            { label: 'Products', href: '/products' },
            { label: 'Devices', href: '/products?category=devices' },
            { label: 'E-Liquids', href: '/products?category=e-liquids' },
            { label: 'Accessories', href: '/products?category=accessories' },
          ].map(({ label, href }) => (
            <Link key={label} href={href}
              className="text-slate-400 hover:text-purple-300 transition-colors duration-200 font-medium">
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link href="http://localhost:3001" target="_blank"
            className="hidden sm:flex btn-ghost items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold">
            My Account
          </Link>
          <Link href="/products"
            className="btn-primary px-4 py-2 rounded-full text-sm font-semibold hidden sm:block">
            <span>Shop Now</span>
          </Link>

          {/* Mobile hamburger */}
          <button className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current mb-1 transition-all" />
            <div className="w-5 h-0.5 bg-current transition-all" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-purple-500/10 py-4 px-4 space-y-1">
          {[
            { label: 'Products', href: '/products' },
            { label: 'Devices', href: '/products?category=devices' },
            { label: 'E-Liquids', href: '/products?category=e-liquids' },
            { label: 'Accessories', href: '/products?category=accessories' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)}
              className="block py-2.5 px-3 text-slate-300 hover:text-purple-300 font-medium rounded-lg hover:bg-purple-500/5 transition-colors">
              {label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="http://localhost:3001" target="_blank"
              className="btn-ghost block text-center py-2.5 rounded-full text-sm font-semibold">
              My Account
            </Link>
            <Link href="/products"
              className="btn-primary block text-center py-2.5 rounded-full text-sm font-semibold">
              <span>Shop Now</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}