'use client';

import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      console.log("User not authenticated, redirecting to sign-in...");
      router.replace("/auth/sign-in");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/auth/sign-in" />
      </div>
      <p>Welcome to your dashboard! You are successfully logged in.</p>
    </div>
  );
} 