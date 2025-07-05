'use client';

import { SignIn } from "@clerk/nextjs";

// Debug utility for auth flow
function logAuthDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AuthFlowDebug ${new Date().toISOString()}] ${message}`, data ? data : '');
  }
}

export default function SignInPage() {
  // Log initial render for debugging
  if (process.env.NODE_ENV === 'development') {
    logAuthDebug('SignIn page rendered');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn redirectUrl="/dashboard" afterSignInUrl="/dashboard" />
    </div>
  );
} 