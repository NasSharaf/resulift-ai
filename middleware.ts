// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes: DO NOT authenticate, DO NOT wrap, DO NOT touch body
const publicRoutes = [
  "/api/webhooks/clerk",
  "/api/webhooks/stripe",
  "/api/free-usage",
  "/api/user-info",
];

// LLM routes: bypass Clerk so cookies don't get messed with
const LLM_API_PATHS = [
  "/api/rewrite",
  "/api/fetch-resume",
  "/api/tailored-resume",
];

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl.pathname;

  // 1. Fully bypass middleware for webhooks & other public routes
  if (publicRoutes.some((p) => url.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Bypass Clerk for LLM routes
  if (LLM_API_PATHS.some((p) => url.startsWith(p))) {
    return NextResponse.next();
  }

  // 3. Everything else: let Clerk handle normally
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\.[\\w]+$|_next).*)"
  ],
};
