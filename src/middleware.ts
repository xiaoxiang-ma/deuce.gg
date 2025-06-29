import { authMiddleware } from "@clerk/nextjs";

// Debug utility for middleware
function logMiddlewareDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MiddlewareDebug ${new Date().toISOString()}] ${message}`, data ? data : '');
  }
}

export default authMiddleware({
  // Define public routes that don't require authentication
  publicRoutes: [
    "/",
    "/auth/sign-in",
    "/auth/sign-up"
  ],
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
  },

  afterAuth(auth, req) {
    // Log auth state for debugging
    logMiddlewareDebug('Middleware auth state', {
      pathname: req.nextUrl.pathname,
      isAuthenticated: !!auth.userId,
      userId: auth.userId,
      sessionId: auth.sessionId,
      sessionClaims: auth.sessionClaims,
      hasActiveSessions: !!auth.sessionId,
      cookies: req.cookies.toString(),
      timestamp: 'afterAuth'
    });
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 