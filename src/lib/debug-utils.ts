// Debug utility for environment variables
export function checkClerkConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
  ];

  const config: Record<string, string | undefined> = {};
  const missingVars: string[] = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missingVars.push(varName);
    }
    // Only log public variables
    if (varName.startsWith('NEXT_PUBLIC_')) {
      config[varName] = value;
    } else {
      config[varName] = value ? '[SECRET]' : undefined;
    }
  });

  console.log(`[ConfigDebug ${new Date().toISOString()}] Clerk Configuration:`, {
    config,
    missingVars,
    isDevelopment: process.env.NODE_ENV === 'development',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || typeof window !== 'undefined' ? window.location.origin : 'unknown',
  });

  return {
    hasAllVars: missingVars.length === 0,
    missingVars
  };
} 