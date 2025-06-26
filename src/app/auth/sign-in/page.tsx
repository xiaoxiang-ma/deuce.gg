'use client';

import { SignIn, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  useEffect(() => {
    if (isLoaded && userId) {
      console.log("User is authenticated, redirecting...");
      if (redirectUrl) {
        router.replace(decodeURIComponent(redirectUrl));
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isLoaded, userId, router, redirectUrl]);

  // If the user is already authenticated, show loading
  if (isLoaded && userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
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
        afterSignInUrl={redirectUrl || "/dashboard"}
        signUpUrl="/auth/sign-up"
      />
    </div>
  );
} 