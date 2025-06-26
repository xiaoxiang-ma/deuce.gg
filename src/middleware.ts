import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // If the user is not signed in and the route requires auth
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If the user is signed in and trying to access auth pages, redirect to dashboard
    if (auth.userId && (
      req.nextUrl.pathname.startsWith("/auth/") ||
      req.nextUrl.pathname === "/"
    )) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 