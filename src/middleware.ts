import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/auth/sign-in", "/auth/sign-up"],
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