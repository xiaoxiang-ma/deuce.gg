'use client';

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push('/dashboard');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

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