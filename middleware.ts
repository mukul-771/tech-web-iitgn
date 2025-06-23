import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.email && (
      token.email.endsWith('@iitgn.ac.in') || 
      token.email === 'mukulmee771@gmail.com'
    );

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // EMERGENCY FIX: Redirect malformed club URLs
    const url = req.nextUrl.pathname;
    const malformedClubMatch = url.match(/\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/);
    if (malformedClubMatch) {
      const cleanId = malformedClubMatch[1];
      const remainingPath = malformedClubMatch[3] || '';
      const cleanUrl = `/admin/clubs/${cleanId}${remainingPath}`;
      console.log('MIDDLEWARE: Redirecting malformed URL from', url, 'to', cleanUrl);
      return NextResponse.redirect(new URL(cleanUrl, req.url));
    }

    // Also check API routes
    const malformedApiMatch = url.match(/\/api\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/);
    if (malformedApiMatch) {
      const cleanId = malformedApiMatch[1];
      const remainingPath = malformedApiMatch[3] || '';
      const cleanUrl = `/api/admin/clubs/${cleanId}${remainingPath}`;
      console.log('MIDDLEWARE: Redirecting malformed API URL from', url, 'to', cleanUrl);
      return NextResponse.redirect(new URL(cleanUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
}
