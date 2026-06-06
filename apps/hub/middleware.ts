import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type HubRole = 'super_admin' | 'manager' | 'order_viewer' | 'staff'

// Define which roles can access which route prefixes
const ROUTE_PERMISSIONS: Record<string, HubRole[]> = {
  '/products':  ['super_admin', 'manager'],
  '/categories':['super_admin', 'manager'],
  '/orders':    ['super_admin', 'manager', 'order_viewer', 'staff'],
  '/customers': ['super_admin', 'manager'],
  '/staff':     ['super_admin'],
  '/settings':  ['super_admin'],
  '/reports':   ['super_admin', 'manager'],
}

function getAllowedRoles(pathname: string): HubRole[] | null {
  for (const [prefix, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(prefix)) return roles
  }
  return null // no restriction (e.g. /dashboard)
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (request.cookies as any).get(name)?.value as string | undefined
        },
        set(name: string, value: string, options?: Record<string, any>) {
          (request.cookies as any).set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: Record<string, any>) {
          (request.cookies as any).set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
    return response
  }

  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // Get hub profile and role
  const { data: profile } = await supabase
    .from('hub_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=inactive', request.url))
  }

  const allowedRoles = getAllowedRoles(pathname)
  if (allowedRoles && !allowedRoles.includes(profile.role as HubRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Pass role to headers for use in Server Components
  response.headers.set('x-hub-role', profile.role)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}