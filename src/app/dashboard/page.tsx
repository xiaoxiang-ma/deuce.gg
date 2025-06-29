import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/auth/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  
  if (!user) {
    // This should rarely happen, but handle it just in case
    redirect("/auth/sign-in?redirect_url=/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {user.firstName || user.username || "User"}!
          </h1>
          <p className="text-gray-600 mb-4">
            You're successfully signed in to your dashboard.
          </p>
          {/* Add your dashboard content here */}
        </div>
      </div>
    </div>
  );
} 