import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const { pathname } = url

  // Cost of living articles → city database (pattern: /articles/cost-of-living-in-{slug}-2026|2027)
  const colSingle = pathname.match(/^\/articles\/cost-of-living-in-(.+)-202(6|7)$/)
  if (colSingle) {
    const citySlug = colSingle[1]
    return NextResponse.redirect(new URL(`/cities/${citySlug}`, url), 301)
  }

  // Non indicizzare URL di ricerca (es. /articoli?search=...) per evitare duplicati/URL inutili in GSC.
  if (url.searchParams.has('search')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex')
    return response
  }

  return NextResponse.next()
}

export const config = {
  // Applica a tutte le pagine; la condizione sopra decide quando intervenire.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}


