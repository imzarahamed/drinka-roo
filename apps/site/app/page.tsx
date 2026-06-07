import Link from 'next/link'
import { createServerSupabase } from '../lib/supabase'
import { ProductGrid } from '../components/product-grid'
import { CategoryBar } from '../components/category-bar'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Premium Performance',
    desc: 'Industry-leading devices engineered for consistent, satisfying vapor production.',
  },
  {
    icon: '🌿',
    title: 'Premium E-Liquids',
    desc: 'Crafted with pharmaceutical-grade ingredients. Hundreds of flavors to explore.',
  },
  {
    icon: '🔒',
    title: 'Age-Verified Sales',
    desc: 'Strict 18+ verification on every order. Safe, compliant, responsible.',
  },
  {
    icon: '🚀',
    title: 'Fast Fulfillment',
    desc: 'Same-day dispatch on orders before 2pm. Track your parcel in real time.',
  },
]

const BRANDS = ['SMOK', 'Vaporesso', 'Uwell', 'GeekVape', 'Voopoo', 'Aspire', 'Innokin', 'Freemax']

const TESTIMONIALS = [
  {
    name: 'Alex R.',
    handle: '@alexvapes',
    text: 'Best wholesale supplier I\'ve used. Fast delivery, legit products, and the prices are unbeatable for bulk orders.',
    rating: 5,
  },
  {
    name: 'Jamie T.',
    handle: '@mistycloud_uk',
    text: 'The product range is insane. My shop customers keep coming back for the exclusive flavors only available here.',
    rating: 5,
  },
  {
    name: 'Sam K.',
    handle: '@vapeworldstore',
    text: 'Account management is smooth, orders arrive perfectly packed. Zero issues across 50+ wholesale orders.',
    rating: 5,
  },
]

const CATEGORIES_STATIC = [
  { name: 'Pod Systems', icon: '◈', desc: 'Compact & discreet', color: 'from-purple-500/20 to-fuchsia-500/10' },
  { name: 'Box Mods', icon: '▣', desc: 'Maximum power', color: 'from-indigo-500/20 to-purple-500/10' },
  { name: 'E-Liquids', icon: '◉', desc: '500+ flavors', color: 'from-fuchsia-500/20 to-pink-500/10' },
  { name: 'Accessories', icon: '◫', desc: 'Coils, tanks & more', color: 'from-violet-500/20 to-indigo-500/10' },
]

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const [{ data: featured }, { data: categories }] = await Promise.all([
    supabase.from('products')
      .select('*, categories(name,slug)')
      .eq('is_active', true)
      .limit(6),
    supabase.from('categories').select('name,slug').order('sort_order'),
  ])

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(192,132,252,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 badge-glow mb-8">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-purple-300 text-xs font-semibold tracking-widest uppercase">
                Wholesale &amp; Retail
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", lineHeight: 0.95 }}
              className="text-[clamp(3.5rem,10vw,8rem)] font-normal mb-6">
              <span className="hero-text block">Elevate</span>
              <span className="text-white block">Your Vape</span>
              <span className="hero-text block">Experience</span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
              Premium devices, exclusive e-liquids, and professional accessories — 
              all in one destination. Trusted by 2,000+ shops across the UK.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products"
                className="btn-primary px-8 py-4 rounded-full text-base font-bold text-center">
                <span>Explore Products</span>
              </Link>
              <Link href="http://localhost:3001" target="_blank"
                className="btn-ghost px-8 py-4 rounded-full text-base font-semibold text-center">
                Trade Account Login
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-16">
              {[
                { val: '500+', label: 'Products' },
                { val: '2K+', label: 'Trade Accounts' },
                { val: '99.2%', label: 'Satisfaction' },
                { val: '24h', label: 'Dispatch' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{val}</p>
                  <p className="text-slate-500 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
      </section>

      {/* ── BRAND MARQUEE ── */}
      <section className="py-8 border-y border-purple-500/10 overflow-hidden">
        <div className="flex overflow-hidden">
          <div className="marquee-track">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="text-slate-600 font-semibold tracking-widest uppercase text-sm px-8">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Categories</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-4xl sm:text-6xl text-white">
            Shop By Type
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES_STATIC.map(({ name, icon, desc, color }) => (
            <Link key={name} href={`/products?category=${name.toLowerCase().replace(' ', '-')}`}
              className={`card-glow group relative p-6 rounded-2xl border border-purple-500/10 bg-gradient-to-br ${color} backdrop-blur-sm`}>
              <div className="text-3xl mb-4 text-purple-300">{icon}</div>
              <h3 className="text-white font-semibold text-lg mb-1">{name}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
              <div className="mt-4 text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Browse →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Featured</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-4xl sm:text-6xl text-white">
              Top Products
            </h2>
          </div>
          <Link href="/products"
            className="hidden sm:block btn-ghost px-5 py-2.5 rounded-full text-sm font-semibold">
            View All
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <ProductGrid products={featured} />
        ) : (
          /* Skeleton / placeholder cards when no DB data */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Helios Pod Kit 40W', category: 'Pod Systems', price: '34.99', stock: 48 },
              { name: 'Aura Box Mod 200W', category: 'Box Mods', price: '79.99', stock: 22 },
              { name: 'Mango Ice E-Liquid 100ml', category: 'E-Liquids', price: '12.99', stock: 200 },
              { name: 'Mesh Pro Tank', category: 'Tanks', price: '29.99', stock: 65 },
              { name: 'Blueberry Frost 50ml', category: 'E-Liquids', price: '9.99', stock: 150 },
              { name: 'Carbon Fiber Carry Case', category: 'Accessories', price: '19.99', stock: 30 },
            ].map((product) => (
              <div key={product.name}
                className="card-glow group block overflow-hidden rounded-3xl border border-purple-500/10 bg-[#13131a]">
                {/* Image placeholder */}
                <div className="h-52 product-img-placeholder flex items-center justify-center">
                  <div className="text-4xl opacity-30">◈</div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-purple-400 font-medium mb-1">{product.category}</p>
                  <h3 className="text-white font-semibold text-base mb-2">{product.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">Premium wholesale product. Contact your account manager for bulk pricing.</p>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-white text-lg">${product.price}</span>
                    <span className="text-slate-600">{product.stock} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10 sm:hidden">
          <Link href="/products" className="btn-ghost px-6 py-3 rounded-full text-sm font-semibold">
            View All Products
          </Link>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Why VAPOR</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-4xl sm:text-6xl text-white">
              Built For The Trade
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title}
                className="p-6 rounded-2xl border border-purple-500/10 bg-[#13131a] hover:border-purple-500/25 transition-colors group">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-3">Reviews</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            className="text-4xl sm:text-6xl text-white">
            Trusted By Shops
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, handle, text, rating }) => (
            <div key={name}
              className="p-6 rounded-2xl border border-purple-500/10 bg-[#13131a]">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="star text-sm">★</span>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">"{text}"</p>
              <div>
                <p className="text-white font-semibold text-sm">{name}</p>
                <p className="text-slate-600 text-xs">{handle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-fuchsia-900/20 to-indigo-900/40" />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(192,132,252,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <p className="text-purple-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">Trade Account</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              className="text-4xl sm:text-6xl text-white mb-6">
              Ready To Order?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
              Log into your trade account to access wholesale pricing, place orders, and track deliveries — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="http://localhost:3001" target="_blank"
                className="btn-primary px-10 py-4 rounded-full text-base font-bold">
                <span>Login to My Account</span>
              </Link>
              <Link href="/products"
                className="btn-ghost px-10 py-4 rounded-full text-base font-semibold">
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-purple-500/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-black font-black text-xs">V</div>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.12em' }}
                  className="text-lg text-white">VAPOR</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Premium vape wholesale & retail. Trusted by 2,000+ retailers across the UK.
              </p>
            </div>
            {[
              { title: 'Products', links: ['Pod Systems', 'Box Mods', 'E-Liquids', 'Accessories', 'Coils & Pods'] },
              { title: 'Account', links: ['Login', 'Register Interest', 'Track Order', 'Returns Policy'] },
              { title: 'Company', links: ['About Us', 'Trade Programme', 'Contact', 'Age Verification'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-4">{title}</p>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-slate-600 hover:text-purple-400 text-sm transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-purple-500/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-700 text-xs">
              © 2025 VAPOR Ltd. All rights reserved. 18+ only. Please vape responsibly.
            </p>
            <p className="text-slate-700 text-xs">
              ⚠️ Nicotine products. Not for sale to persons under 18.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}