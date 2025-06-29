import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { checkClerkConfig } from '@/lib/debug-utils'

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
    <ClerkProvider
      appearance={{
        baseTheme: undefined // Prevents flash of unstyled content
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <AuthDebugger>
            {children}
          </AuthDebugger>
        </body>
      </html>
    </ClerkProvider>
  )
} 