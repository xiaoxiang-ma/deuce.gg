'use client';

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-blue-900 mb-6">
          Find Your Perfect Tennis Match
        </h1>
        <p className="text-xl text-gray-700 mb-12">
          Connect with tennis players at your skill level, schedule matches, and improve your game.
          Track your progress with our ELO rating system.
        </p>
        
        {/* Auth Buttons */}
        <div className="space-x-4 mb-20">
          <SignInButton mode="modal">
            <button className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </div>
        
        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Skill-Based Matching</h3>
            <p className="text-gray-600">Find players at your level using our NTRP-based matching system</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Easy Scheduling</h3>
            <p className="text-gray-600">Create or join tennis sessions that fit your schedule</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Track Progress</h3>
            <p className="text-gray-600">Monitor your improvement with our ELO rating system</p>
          </div>
        </div>
      </div>
    </main>
  );
} 