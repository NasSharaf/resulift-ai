// app/api/user-info/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { db } from "@/db";
import { userProfiles, anonymousVisitors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isSubscribed, getUsageStatus, isAdmin } from "@/app/utils/usageLimits";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("resumatch_vid")?.value || null;

  const usage = await getUsageStatus({ userId, visitorId });

  // Logged-in user
  if (userId) {
    const subscribed = await isSubscribed(userId);

    const rows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const profile = rows[0];

    const referralLink = profile?.referralCode
      ? `${process.env.NEXT_PUBLIC_APP_URL || "https://resumatch-ai.vercel.app"}sign-up?ref=${profile.referralCode}`
      : null;

    return NextResponse.json({
      isLoggedIn: true,
      isSubscribed: subscribed,
      isAdmin: isAdmin(userId),
      tier: subscribed ? "paid" : "free",

      remaining: usage.remaining,
      limit: usage.limit,

      referralCode: profile?.referralCode ?? null,
      referralLink,
      referredBy: profile?.referredBy ?? null,
    });
  }

  // Anonymous user (cookie present OR not)
  return NextResponse.json({
    isLoggedIn: false,
    tier: "anon",
    visitorId,

    remaining: usage.remaining,
    limit: usage.limit,            

    isSubscribed: false,
    referralCode: null,
    referralLink: null,
  });
}
