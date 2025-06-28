import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Only the landing page and auth pages are public
  publicRoutes: ["/"],
  
  afterAuth(auth, req) {
    // If user is authenticated and tries to access auth pages or root
    if (auth.userId && (req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/auth"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and tries to access protected routes
    if (!auth.userId && !req.nextUrl.pathname.startsWith("/auth/") && req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

// Protect all routes except static files and API routes
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}; 