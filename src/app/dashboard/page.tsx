import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Debug utility
function logDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DashboardDebug] ${message}`, data ? data : '');
  }
}

export default async function DashboardPage() {
  try {
    logDebug('Initializing dashboard page');
    
    const { userId } = auth();
    logDebug('Auth check result', { userId });
    
    if (!userId) {
      logDebug('No userId, redirecting to sign-in');
      redirect("/auth/sign-in?redirect_url=/dashboard");
    }

    const user = await currentUser();
    logDebug('User data fetched', { 
      hasUser: !!user,
      firstName: user?.firstName,
      username: user?.username 
    });
    
    if (!user) {
      logDebug('No user data, redirecting to sign-in');
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
  } catch (error) {
    logDebug('Error in dashboard page', { error });
    
    // Handle any unexpected errors
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Error loading dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Please try refreshing the page or signing in again.
          </p>
          <a
            href="/auth/sign-in"
            className="text-blue-500 hover:underline"
          >
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }
} 