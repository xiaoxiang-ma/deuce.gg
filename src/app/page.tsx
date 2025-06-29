'use client';

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Debug auth state changes
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthDebug] Home page auth state:', {
        isLoaded,
        userId,
        isSignedIn,
        timestamp: new Date().toISOString()
      });
    }

    if (isLoaded && isSignedIn) {
      console.log('[AuthDebug] Redirecting to dashboard...');
      router.replace('/dashboard');
      return;
    }
  }, [isLoaded, isSignedIn, userId, router]);

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

  // Only render sign-in UI if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="absolute top-4 right-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Welcome to Deuce.gg</h1>
          <p className="text-xl mb-8">Find your perfect tennis match today!</p>
          <SignInButton mode="modal" redirectUrl="/dashboard">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // This should never render because of the redirect in useEffect
  return null;
} 