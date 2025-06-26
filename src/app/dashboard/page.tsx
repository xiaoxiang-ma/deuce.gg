'use client';

import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <p>Welcome to your dashboard! You are successfully logged in.</p>
    </div>
  );
} 