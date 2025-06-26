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
      router.push("/dashboard");
    }
  }, [isLoaded, userId, router]);

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