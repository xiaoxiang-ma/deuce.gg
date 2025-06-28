'use client';

import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="absolute top-4 right-4">
        <UserButton afterSignOutUrl="/" />
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to the App</h1>
        <SignInButton mode="modal">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Sign In
          </button>
        </SignInButton>
      </div>
    </div>
  );
} 