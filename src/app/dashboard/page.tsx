import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user?.firstName || "User"}!
          </h1>
          <p className="text-gray-600">
            You're successfully signed in to the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
} 