import { auth, currentUser } from "@clerk/nextjs";

// Debug utility
function logDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DashboardDebug ${new Date().toISOString()}] ${message}`, data ? data : '');
  }
}

export default async function DashboardPage() {
  try {
    logDebug('Initializing dashboard page');
    
    const { userId } = auth();
    const user = await currentUser();
    
    logDebug('User data fetched', { 
      hasUser: !!user,
      userId,
      firstName: user?.firstName,
      username: user?.username 
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">
              Welcome, {user?.firstName || user?.username || "User"}!
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
    throw error;
  }
} 