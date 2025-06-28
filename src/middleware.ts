import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // Handle public routes when user is authenticated
    if (auth.userId && (
      req.nextUrl.pathname === "/" || 
      req.nextUrl.pathname.startsWith("/auth")
    )) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Handle protected routes when user is not authenticated
    if (!auth.userId && req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
    '/dashboard',
    '/profile',
    '/matches',
    '/sessions/:path*'
  ],
}; 