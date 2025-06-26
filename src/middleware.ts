import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // Get the URL to redirect to after sign-in
    const redirectUrl = req.nextUrl.searchParams.get("redirect_url");
    
    // If the user is not signed in and the route requires auth
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      if (req.url !== "/") {
        signInUrl.searchParams.set("redirect_url", req.url);
      }
      return NextResponse.redirect(signInUrl);
    }

    // If the user is signed in and trying to access auth pages
    if (auth.userId && req.nextUrl.pathname.startsWith("/auth/")) {
      // If there's a redirect URL, use it, otherwise go to dashboard
      if (redirectUrl) {
        return NextResponse.redirect(new URL(decodeURIComponent(redirectUrl)));
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 