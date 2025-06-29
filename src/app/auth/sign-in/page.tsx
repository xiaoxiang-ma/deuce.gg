'use client';

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Debug auth state
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthDebug] SignIn page auth state:', {
        isLoaded,
        isSignedIn,
        redirect_url: searchParams.redirect_url,
        timestamp: new Date().toISOString()
      });
    }

    // Redirect to dashboard or specified URL if already signed in
    if (isLoaded && isSignedIn) {
      console.log('[AuthDebug] Already signed in, redirecting...');
      router.replace(searchParams.redirect_url || '/dashboard');
    }
  }, [isLoaded, isSignedIn, router, searchParams.redirect_url]);

  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Loading...</h2>
        </div>
      </div>
    );
  }

  // Only render SignIn component if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignIn 
          redirectUrl={searchParams.redirect_url || "/dashboard"}
          afterSignInUrl={searchParams.redirect_url || "/dashboard"}
          routing="path"
          signUpUrl="/auth/sign-up"
        />
      </div>
    );
  }

  // This should never render because of the redirect in useEffect
  return null;
} 