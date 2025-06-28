'use client';

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to Deuce.gg</h1>
        <p className="text-xl mb-8">Find your perfect tennis match and improve your game</p>
        
        <div className="space-x-4">
          <SignInButton mode="modal">
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Sign In
            </button>
          </SignInButton>
          
          <SignUpButton mode="modal">
            <button className="bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </main>
  );
} 