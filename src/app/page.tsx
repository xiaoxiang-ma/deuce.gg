export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to RallyPoint</h1>
      <p className="text-xl mb-8">Connect with tennis players for skill-matched sessions</p>
      <div className="flex gap-4">
        <a
          href="/auth/sign-in"
          className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Sign In
        </a>
        <a
          href="/auth/sign-up"
          className="rounded-md bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          Sign Up
        </a>
      </div>
    </div>
  )
} 