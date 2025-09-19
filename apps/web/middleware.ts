import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Extract subdomain
  const subdomain = hostname.split('.')[0]

  // Skip middleware for development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // For local development, check if subdomain exists
    if (subdomain && subdomain !== 'localhost' && !subdomain.includes('127')) {
      url.pathname = `/reseller/${subdomain}${url.pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // Main distributor domain
  const mainDomain = process.env.MAIN_DOMAIN || 'tiredist.com'

  // Main domain - distributor B2B site
  if (hostname === mainDomain || hostname === `www.${mainDomain}`) {
    return NextResponse.next()
  }

  // Subdomain - reseller B2C site (rev1.tiredist.com)
  if (hostname.endsWith(`.${mainDomain}`) && subdomain !== 'www') {
    url.pathname = `/reseller/${subdomain}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Custom domain - reseller with custom domain
  if (!hostname.endsWith(mainDomain)) {
    url.pathname = `/custom-domain/${hostname}${url.pathname}`
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
