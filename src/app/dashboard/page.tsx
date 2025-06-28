import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-lg text-gray-700">
          You're successfully logged in! Start exploring matches or create a new session.
        </p>
      </div>
    </div>
  );
} 