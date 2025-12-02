// utils/clerk-debug.ts
import { env } from 'process';

export function checkClerkConfiguration() {
  const checks = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: !!env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: !!env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: !!env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: !!env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  };

  console.log('Clerk Environment Configuration:', checks);

  const missingConfigs = Object.entries(checks)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingConfigs.length > 0) {
    console.warn('Missing Clerk Configuration Variables:', missingConfigs);
  }

  return checks;
}