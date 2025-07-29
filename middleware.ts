import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // Admin route protection
    if (path.startsWith('/admin')) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    
    // Client slug route protection
    const slugMatch = path.match(/^\/([^\/]+)$/)
    if (slugMatch && slugMatch[1] !== 'login' && slugMatch[1] !== 'api') {
      const requestedSlug = slugMatch[1]
      
      // Admin can access any slug
      if (token?.role === UserRole.ADMIN) {
        return NextResponse.next()
      }
      
      // Client can only access their assigned slug
      if (token?.role === UserRole.CLIENT && token?.clientSlug !== requestedSlug) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|login|$).*)',
  ]
}