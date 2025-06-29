import { Inter } from 'next/font/google'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import './globals.css'
import { checkClerkConfig } from '@/lib/debug-utils'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Deuce.gg - Tennis Matchmaking',
  description: 'Find your perfect tennis match',
}

// Debug component to track auth state changes
function AuthDebugger({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[AuthDebug] Layout rendering', {
      timestamp: new Date().toISOString(),
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    });
  }
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check Clerk configuration in development
  if (process.env.NODE_ENV === 'development') {
    checkClerkConfig();
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* Navigation */}
          <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  {/* Logo */}
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-blue-600">RallyPoint</span>
                  </Link>

                  {/* Navigation Links */}
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/sessions/browse"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                    >
                      Find Sessions
                    </Link>
                    <Link
                      href="/sessions/create"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300"
                    >
                      Create Session
                    </Link>
                  </div>
                </div>

                {/* Right side - User button */}
                <div className="flex items-center">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/sessions/browse"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Find Sessions
                </Link>
                <Link
                  href="/sessions/create"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Create Session
                </Link>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
} 