import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up"
];

// This example protects all routes including api/trpc routes
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes,
  
  afterAuth(auth, req) {
    // Get the pathname of the request
    const { pathname } = req.nextUrl;

    // If the user is logged in...
    if (auth.userId) {
      // and trying to access auth pages or landing, redirect to dashboard
      if (pathname === "/" || pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // If the user is not logged in and trying to access a protected route
    if (!auth.userId && !pathname.startsWith("/auth") && !publicRoutes.includes(pathname)) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 