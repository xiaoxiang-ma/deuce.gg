'use client';

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Utility function for enhanced debugging
function logDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AuthDebug] ${message}`, data ? data : '');
  }
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Function to handle redirect with fallbacks
  const handleRedirect = async () => {
    const targetUrl = searchParams.redirect_url || '/dashboard';
    
    logDebug('Attempting redirect', {
      attempt: redirectAttempts + 1,
      targetUrl,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      authState: { isLoaded, isSignedIn }
    });

    try {
      // First attempt: Next.js router
      logDebug('Trying router.replace...');
      await router.replace(targetUrl);
      
      // Set a timeout to check if we're still on the same page
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/sign-in')) {
          logDebug('Still on sign-in page after router.replace, trying fallback...');
          
          // Second attempt: window.location
          if (redirectAttempts < 2) {
            setRedirectAttempts(prev => prev + 1);
            window.location.href = targetUrl;
          } else {
            setRedirectError('Redirect failed. Please try manually navigating to the dashboard.');
            logDebug('All redirect attempts failed', {
              attempts: redirectAttempts,
              targetUrl
            });
          }
        }
      }, 1000);
    } catch (error) {
      logDebug('Redirect error caught', { error });
      setRedirectError('Error during redirect. Please try again.');
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      logDebug('Auth not yet loaded');
      return;
    }

    logDebug('Auth state changed', {
      isSignedIn,
      redirectAttempts,
      hasRedirectError: !!redirectError
    });

    if (isSignedIn && !redirectError) {
      handleRedirect();
    }
  }, [isLoaded, isSignedIn, redirectAttempts]);

  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Loading authentication...</h2>
        </div>
      </div>
    );
  }

  // Show error message if redirect failed
  if (redirectError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{redirectError}</h2>
          <button
            onClick={() => {
              setRedirectError(null);
              setRedirectAttempts(0);
              handleRedirect();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="block mt-4 text-blue-500 hover:underline"
          >
            Go to Dashboard Directly
          </a>
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

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Redirecting to dashboard...</h2>
        <p className="text-sm text-gray-500">Attempt {redirectAttempts + 1}/3</p>
      </div>
    </div>
  );
} 