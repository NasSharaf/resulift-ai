// app/api/user-info/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { db } from "@/db";
import { userProfiles, anonymousVisitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isSubscribed, getUsageStatus } from "@/app/utils/usageLimits";

export async function GET(req: Request) {
  const { userId } = getAuth(req);

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("resumatch_vid")?.value || null;

  // If logged in → return full user profile info
  if (userId) {
    // Paid?
    const subscribed = await isSubscribed(userId);

    // Usage (free or paid)
    const usage = await getUsageStatus({ userId, visitorId });

    // User profile
    const rows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const profile = rows[0];

    const referralLink = profile?.referralCode
      ? `${process.env.NEXT_PUBLIC_APP_URL || "https://resumatch.ai"}/sign-up?ref=${profile.referralCode}`
      : null;

    return NextResponse.json({
      isLoggedIn: true,
      isSubscribed: subscribed,
      freeCredits: profile?.freeCredits ?? 0,
      freeUsed: profile?.freeUsed ?? 0,
      remaining: usage.remaining ?? 0,
      referralCode: profile?.referralCode ?? null,
      referralLink,
      referredBy: profile?.referredBy ?? null,
    });
  }

  // Anonymous user → return 3 free usage info
  if (visitorId) {
    const usage = await getUsageStatus({ userId: null, visitorId });

    return NextResponse.json({
      isLoggedIn: false,
      visitorId,
      remaining: usage.remaining,
      isSubscribed: false,
      referralCode: null,
      referralLink: null,
    });
  }

  // No cookie, not logged in → treat as fully anonymous
  return NextResponse.json({
    isLoggedIn: false,
    visitorId: null,
    remaining: 3,
    isSubscribed: false,
    referralCode: null,
    referralLink: null,
  });
}
