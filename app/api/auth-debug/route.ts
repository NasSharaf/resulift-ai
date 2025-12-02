// app/api/auth-debug/route.ts
import { NextResponse } from "next/server";
import * as ClerkNextServer from "@clerk/nextjs/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    console.log("Clerk Server Import:", Object.keys(ClerkNextServer));

    // Try different authentication methods
    try {
      const authObject = ClerkNextServer.auth();
      console.log("Standard auth() result:", authObject);
    } catch (standardAuthError) {
      console.error("Standard auth() error:", standardAuthError);
    }

    // Try authentication with headers
    try {
      const headersList = headers();
      const clerkToken = headersList.get('x-clerk-auth-token');
      const clerkUserId = headersList.get('x-clerk-auth-user-id');
      
      console.log("Clerk Headers:", {
        hasClerkToken: !!clerkToken,
        hasClerkUserId: !!clerkUserId,
        clerkUserId
      });
    } catch (headersError) {
      console.error("Headers authentication error:", headersError);
    }

    // Verify Clerk configuration
    const envVars = {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'UNSET',
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'UNSET',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    };

    console.log("Environment Variables:", envVars);

    return NextResponse.json({
      success: true,
      message: "Authentication debug completed",
      envVars
    });

  } catch (error) {
    console.error('Comprehensive Auth Debug Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Explicitly set runtime to Node.js
export const runtime = 'nodejs';