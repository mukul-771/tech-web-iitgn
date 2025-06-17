import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Allow access to login page
      if (req.nextUrl.pathname === "/admin/login") {
        return NextResponse.next();
      }

      // Check if user is authenticated and is admin
      if (!req.nextauth.token?.isAdmin) {
        // Redirect to admin login page
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }

        // For admin routes, require admin token
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token?.isAdmin;
        }

        // Allow all other routes
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
};
