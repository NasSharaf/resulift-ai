// app/api/free-usage/route.js
import { cookies } from "next/headers";
import { getAuth } from "@clerk/nextjs/server";
import { getAnonymousUsage } from "@/app/utils/usageLimits";

export async function GET(req) {
  const { userId } = getAuth(req);
  const cookieStore = await cookies();

  // Logged-in users = unlimited
  if (userId) {
    return Response.json({
      remaining: Infinity,
      used: 0,
      limit: Infinity
    });
  }

  const visitorId = cookieStore.get("resumatch_vid")?.value;
  if (!visitorId) {
    return Response.json({
      remaining: 3,
      used: 0,
      limit: 3
    });
  }

  const usage = await getAnonymousUsage(visitorId);
  return Response.json({
    remaining: Math.max(3 - (usage.resumeCount ?? 0), 0),
    used: usage.resumeCount ?? 0,
    limit: 3
  });
}
