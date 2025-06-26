import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/auth/sign-in", "/auth/sign-up"],
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If the user is logged in and trying to access a protected route, allow them
    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }

    // If the user is logged in and trying to access auth pages, redirect them to dashboard
    if (auth.userId && auth.isPublicRoute && (
      req.nextUrl.pathname === "/auth/sign-in" || 
      req.nextUrl.pathname === "/auth/sign-up"
    )) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 