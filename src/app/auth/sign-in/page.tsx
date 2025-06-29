'use client';

import { SignIn, useAuth, useClerk, useSession } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Debug utility for auth flow
function logAuthDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AuthFlowDebug ${new Date().toISOString()}] ${message}`, data ? data : '');
  }
}

// Debug utility for session state
function logSessionState(clerk: any, session: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SessionDebug ${new Date().toISOString()}]`, {
      hasSession: !!session,
      sessionId: session?.id,
      lastActiveSessionId: clerk?.lastActiveSessionId,
      activeSessionCount: clerk?.activeSessions?.length,
      sessionToken: session?.getToken() || null,
      sessionStatus: session?.status,
      sessionExpiry: session?.expireAt,
    });
  }
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { session } = useSession();
  const clerk = useClerk();
  const router = useRouter();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Function to check browser storage state
  const checkBrowserStorage = () => {
    try {
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      const cookies = document.cookie;

      logAuthDebug('Browser storage state', {
        localStorageKeys,
        sessionStorageKeys,
        cookies,
        hasLocalStorage: !!localStorage,
        hasSessionStorage: !!sessionStorage
      });
    } catch (error) {
      logAuthDebug('Error checking browser storage', { error });
    }
  };

  // Function to handle redirect with detailed logging
  const handleRedirect = async () => {
    const targetUrl = searchParams.redirect_url || '/dashboard';
    
    logAuthDebug('Starting redirect process', {
      attempt: redirectAttempts + 1,
      targetUrl,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      authState: { isLoaded, isSignedIn, userId }
    });

    // Log session state before redirect
    if (clerk && session) {
      logSessionState(clerk, session);
    }

    // Check browser storage before redirect
    checkBrowserStorage();

    try {
      logAuthDebug('Attempting router.replace redirect');
      await router.replace(targetUrl);
      
      // Set a timeout to check if we're still on the same page
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/sign-in')) {
          logAuthDebug('Still on sign-in page after router.replace, trying fallback');
          
          if (redirectAttempts < 2) {
            setRedirectAttempts(prev => prev + 1);
            logAuthDebug('Attempting window.location redirect');
            window.location.href = targetUrl;
          } else {
            setRedirectError('Redirect failed. Please try manually navigating to the dashboard.');
            logAuthDebug('All redirect attempts failed', {
              attempts: redirectAttempts,
              targetUrl,
              finalAuthState: { isLoaded, isSignedIn, userId }
            });
          }
        }
      }, 1000);
    } catch (error) {
      logAuthDebug('Redirect error caught', { error });
      setRedirectError('Error during redirect. Please try again.');
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      logAuthDebug('Auth not yet loaded');
      return;
    }

    logAuthDebug('Auth state changed', {
      isSignedIn,
      userId,
      redirectAttempts,
      hasRedirectError: !!redirectError,
      sessionPresent: !!session
    });

    // Log detailed session state on auth state change
    if (clerk && session) {
      logSessionState(clerk, session);
    }

    if (isSignedIn && !redirectError) {
      handleRedirect();
    }
  }, [isLoaded, isSignedIn, redirectAttempts, clerk, session]);

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