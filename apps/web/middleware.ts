import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Extract subdomain
  const subdomain = hostname.split('.')[0]

  // Main domain (tiredist.com)
  if (hostname === 'tiredist.com' || hostname === 'localhost:3000') {
    // Parent tenant - no rewrite needed
    return NextResponse.next()
  }

  // Subdomain (rev1.tiredist.com or rev1.localhost:3000)
  if (subdomain && subdomain !== 'www' && subdomain !== 'tiredist') {
    // Child tenant - rewrite to tenant-specific pages
    url.pathname = `/tenant/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
