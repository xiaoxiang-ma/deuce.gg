import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up"
];

// Define routes that should redirect to dashboard when authenticated
const authRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up"
];

// This example protects all routes including api/trpc routes
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes,
  debug: process.env.NODE_ENV === 'development',
  
  afterAuth(auth, req) {
    // Get the pathname of the request
    const { pathname } = req.nextUrl;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthDebug] Middleware executing:', {
        pathname,
        isAuthenticated: !!auth.userId,
        timestamp: new Date().toISOString()
      });
    }

    // If the user is logged in and trying to access auth routes, redirect to dashboard
    if (auth.userId && authRoutes.includes(pathname)) {
      console.log('[AuthDebug] Authenticated user accessing auth route, redirecting to dashboard');
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is not logged in and trying to access a protected route
    if (!auth.userId && !publicRoutes.includes(pathname)) {
      console.log('[AuthDebug] Unauthenticated user accessing protected route, redirecting to sign-in');
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Allow the request to proceed
    return NextResponse.next();
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 