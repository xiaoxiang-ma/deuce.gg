import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Only the landing page and auth pages are public
  publicRoutes: ["/", "/auth/sign-in", "/auth/sign-up"],
  
  afterAuth(auth, req) {
    // If user is authenticated and tries to access public routes
    if (auth.userId && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user is not authenticated and tries to access protected routes
    if (!auth.userId && !req.nextUrl.pathname.startsWith("/auth/")) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      // Preserve the intended destination
      signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
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