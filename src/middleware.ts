import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: ["/"],
  
  afterAuth(auth, req) {
    // If the user is logged in and on the home page, redirect to dashboard
    if (auth.userId && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Handle authenticated users
    if (auth.userId) {
      // Redirect from auth pages or root to dashboard
      if (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/auth")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      
      // Allow access to all other routes
      return NextResponse.next();
    }

    // Handle non-authenticated users
    if (!auth.userId && !req.nextUrl.pathname.startsWith("/auth/") && req.nextUrl.pathname !== "/") {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 