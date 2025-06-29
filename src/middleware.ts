import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Debug utility for middleware
function logMiddlewareDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MiddlewareDebug ${new Date().toISOString()}] ${message}`, data ? data : '');
  }
}

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
  debug: true, // Enable Clerk's built-in debugging
  
  beforeAuth: (req) => {
    // Log before Clerk auth check
    logMiddlewareDebug('Middleware executing before auth', {
      url: req.url,
      pathname: req.nextUrl.pathname,
      headers: Object.fromEntries(req.headers.entries()),
      cookies: req.cookies.toString(),
      timestamp: 'beforeAuth'
    });
    return NextResponse.next();
  },

  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;
    const startTime = Date.now();

    // Detailed auth state logging
    logMiddlewareDebug('Middleware auth state', {
      pathname,
      isAuthenticated: !!auth.userId,
      userId: auth.userId,
      sessionId: auth.sessionId,
      sessionClaims: auth.sessionClaims,
      hasActiveSessions: !!auth.sessionId,
      executionTime: `${Date.now() - startTime}ms`,
      cookies: req.cookies.toString(),
      timestamp: 'afterAuth'
    });

    // Log auth-related headers
    logMiddlewareDebug('Auth-related headers', {
      authorization: req.headers.get('authorization'),
      cookie: req.headers.get('cookie'),
      timestamp: 'headers'
    });

    // If the user is logged in and trying to access auth routes
    if (auth.userId && authRoutes.includes(pathname)) {
      logMiddlewareDebug('Redirecting authenticated user from auth route to dashboard', {
        from: pathname,
        to: '/dashboard',
        userId: auth.userId
      });
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If the user is not logged in and trying to access a protected route
    if (!auth.userId && !publicRoutes.includes(pathname)) {
      logMiddlewareDebug('Redirecting unauthenticated user to sign-in', {
        from: pathname,
        to: '/auth/sign-in',
        redirectUrl: pathname
      });
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    logMiddlewareDebug('Allowing request to proceed', {
      pathname,
      isAuthenticated: !!auth.userId,
      timestamp: 'proceed'
    });
    return NextResponse.next();
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 