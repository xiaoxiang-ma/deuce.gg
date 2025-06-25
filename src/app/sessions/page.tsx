export default function Sessions() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Tennis Sessions</h1>
      <div className="flex gap-4 mb-8">
        <a
          href="/sessions/create"
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Create Session
        </a>
        <a
          href="/sessions/browse"
          className="rounded-md bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Browse Sessions
        </a>
      </div>
      {/* SessionList component will go here */}
    </div>
  )
} 