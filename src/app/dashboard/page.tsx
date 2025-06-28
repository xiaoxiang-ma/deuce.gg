import { auth, currentUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

// Temporary mock data - replace with actual data fetching
const mockStats = {
  elo: 1200,
  recentMatches: [
    { id: 1, opponent: "John Doe", result: "Won", date: "2024-03-15" },
    { id: 2, opponent: "Jane Smith", result: "Lost", date: "2024-03-10" },
  ],
  upcomingSessions: [
    { id: 1, type: "Match", opponent: "Alice Brown", date: "2024-03-20", time: "14:00" },
    { id: 2, type: "Practice", opponent: "Bob Wilson", date: "2024-03-22", time: "16:00" },
  ]
};

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect("/auth/sign-in?redirect_url=/dashboard");
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.firstName || user.username}!</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">ELO Rating</p>
              <p className="text-2xl font-bold text-blue-600">{mockStats.elo}</p>
            </div>
            <div>
              <p className="text-gray-600">Recent Matches</p>
              <div className="space-y-2">
                {mockStats.recentMatches.map(match => (
                  <div key={match.id} className="flex justify-between items-center">
                    <span>{match.opponent}</span>
                    <span className={match.result === "Won" ? "text-green-600" : "text-red-600"}>
                      {match.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {mockStats.upcomingSessions.map(session => (
              <div key={session.id} className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{session.type}</span>
                  <span className="text-gray-600">{session.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>with {session.opponent}</span>
                  <span>{session.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              href="/sessions/create" 
              className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Session
            </Link>
            <Link 
              href="/sessions/browse" 
              className="block w-full text-center bg-white text-blue-600 px-4 py-2 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse Sessions
            </Link>
            <Link 
              href="/profile" 
              className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 