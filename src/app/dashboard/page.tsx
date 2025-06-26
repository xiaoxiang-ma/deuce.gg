'use client';

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      console.log("User not authenticated, redirecting to sign-in...");
      router.push("/auth/sign-in");
    } else if (isLoaded && userId) {
      console.log("User authenticated, showing dashboard...");
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard! User ID: {userId}</p>
    </div>
  );
} 