import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: object }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isPreview = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  if (isPreview) return supabaseResponse

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Unauthenticated: redirect to login for protected routes
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/client'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Resolve user type
    const { data: agencyUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .eq('is_active', true)
      .single()

    const isAgencyUser = !!agencyUser

    // Agency user trying to access /client → redirect to /admin
    if (isAgencyUser && pathname.startsWith('/client')) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }

    // Client user trying to access /admin → redirect to /client
    if (!isAgencyUser && pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/client/dashboard'
      return NextResponse.redirect(url)
    }

    // Authenticated user hits /login → redirect to correct area
    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = isAgencyUser ? '/admin/dashboard' : '/client/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
