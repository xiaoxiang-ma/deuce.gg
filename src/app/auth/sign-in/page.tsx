'use client';

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      console.log("User is authenticated, redirecting to dashboard...");
      router.replace("/dashboard");
    }
  }, [isLoaded, userId, router]);

  // If the user is already authenticated, don't render the SignIn component
  if (isLoaded && userId) {
    return null;
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only render SignIn component if user is not authenticated
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md",
          },
        }}
        routing="path"
        path="/auth/sign-in"
        afterSignInUrl="/dashboard"
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 