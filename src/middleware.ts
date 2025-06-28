import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // Handle authenticated users trying to access public routes
    if (auth.userId && req.nextUrl.pathname === "/") {
      return Response.redirect(new URL("/dashboard", req.url));
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