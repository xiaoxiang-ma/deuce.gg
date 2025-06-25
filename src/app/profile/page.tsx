export default function Profile() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          {/* UserStats component will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          {/* MatchHistory component will go here */}
        </div>
      </div>
    </div>
  )
} 