import {NextRequest, NextResponse} from 'next/server';

export function middleware(req: NextRequest) {
  // If accessing any /admin route, require an authentication token in cookie
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = req.cookies.get('token');
    if (!token?.value) {
      // Redirect to login page if no token
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  // Otherwise, allow access
  return NextResponse.next();
}

// Only run this middleware for /admin and its subroutes
export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
