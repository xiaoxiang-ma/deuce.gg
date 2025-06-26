import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // If the user is signed in and trying to access the home page or auth pages, redirect to dashboard
    if (auth.userId && (
      req.nextUrl.pathname === "/" || 
      req.nextUrl.pathname.startsWith("/auth")
    )) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 