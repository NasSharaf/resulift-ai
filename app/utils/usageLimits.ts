// app/utils/usageLimits.ts
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { anonymousVisitors, subscriptions, userProfiles } from "@/db/schema";

export const USAGE_LIMITS = {
  ANON: 2,
  FREE_DEFAULT: 3,
};

/* ---------------------------------------------------------
   GET SUBSCRIPTION STATE
--------------------------------------------------------- */
function isAdmin(userId?: string | null) {
  if (!userId) return false;
  const admins = process.env.ADMIN_USER_IDS?.split(",") ?? [];
  return admins.includes(userId);
}

export async function isSubscribed(userId: string): Promise<boolean> {
  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub.length) return false;

  return (
    sub[0].status === "active" ||
    sub[0].status === "trialing" ||
    sub[0].status === "past_due" // optional: allow access during past_due
  );
}

/* ---------------------------------------------------------
   ANONYMOUS USER HELPERS
--------------------------------------------------------- */

export async function getAnonymousUsage(visitorId: string) {
  if (!visitorId) return null;

  const rows = await db
    .select()
    .from(anonymousVisitors)
    .where(eq(anonymousVisitors.visitorId, visitorId))
    .limit(1);

  if (rows.length === 0) {
    const now = new Date();

    await db.insert(anonymousVisitors).values({
      visitorId,
      resumeCount: 0,
      createdAt: now,
      lastUsedAt: now,
      deviceHash: null,
    });

    return {
      visitorId,
      resumeCount: 0,
      createdAt: now,
      lastUsedAt: now,
      deviceHash: null as string | null,
    };
  }

  return rows[0];
}

export async function incrementAnonymousUsage(visitorId: string) {
  const now = new Date();

  await db
    .update(anonymousVisitors)
    .set({
      resumeCount: sql`${anonymousVisitors.resumeCount} + 1`,
      lastUsedAt: now,
    })
    .where(eq(anonymousVisitors.visitorId, visitorId));
}

/* ---------------------------------------------------------
   FREE USER HELPERS (LOGGED-IN)
--------------------------------------------------------- */

export async function getFreeUserUsage(userId: string) {
  const rows = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!rows.length) return null;

  return rows[0];
}

export async function incrementFreeUserUsage(userId: string) {
  await db
    .update(userProfiles)
    .set({
      freeUsed: sql`${userProfiles.freeUsed} + 1`,
    })
    .where(eq(userProfiles.userId, userId));
}

/* ---------------------------------------------------------
   CENTRAL CHECK & CONSUME FUNCTION
--------------------------------------------------------- */

export async function checkAndConsumeUsage(opts: {
  userId?: string | null;
  visitorId?: string | null;
}): Promise<{
  allowed: boolean;
  remaining?: number; // remaining free credits
  reason?: "ANON_LIMIT" | "FREE_LIMIT" | "PAID" | "ADMIN";
}> {
  const { userId, visitorId } = opts;

  if (isAdmin(userId)) {
    return {
      allowed: true,
      remaining: Infinity,
      reason: "ADMIN",
    };
  }

  /* ---------------------------------
     1) PAID USER → unlimited
  --------------------------------- */
  if (userId) {
    const paid = await isSubscribed(userId);
    if (paid) {
      return { allowed: true, reason: "PAID", remaining: Infinity };
    }
  }

  /* ---------------------------------
     2) LOGGED-IN FREE USER
  --------------------------------- */
  if (userId) {
    const profile = await getFreeUserUsage(userId);

    if (!profile) {
      // Should not happen unless webhook hasn't run yet
      return { allowed: false, reason: "FREE_LIMIT", remaining: 0 };
    }

    const { freeCredits, freeUsed } = profile;

    if (freeUsed >= freeCredits) {
      return { allowed: false, reason: "FREE_LIMIT", remaining: 0 };
    }

    await incrementFreeUserUsage(userId);

    return {
      allowed: true,
      reason: "FREE_LIMIT",
      remaining: freeCredits - (freeUsed + 1),
    };
  }

  /* ---------------------------------
     3) ANONYMOUS USER
  --------------------------------- */
  if (!visitorId) {
    return { allowed: false, reason: "ANON_LIMIT", remaining: 0 };
  }

  const anon = await getAnonymousUsage(visitorId);

  if (anon.resumeCount >= 2) {
    return { allowed: false, reason: "ANON_LIMIT", remaining: 0 };
  }

  await incrementAnonymousUsage(visitorId);

  return {
    allowed: true,
    reason: "ANON_LIMIT",
    remaining: 2 - (anon.resumeCount + 1),
  };
}

/* ---------------------------------------------------------
   HELPER FOR UI: PEEK USAGE WITHOUT CONSUMING
--------------------------------------------------------- */

export async function getUsageStatus(opts: {
  userId?: string | null;
  visitorId?: string | null;
}) {
  const { userId, visitorId } = opts;

  /* ----------------------------
     PAID USER
  ---------------------------- */
  if (userId) {
    const paid = await isSubscribed(userId);
    if (paid) {
      return {
        type: "PAID",
        remaining: null,
        limit: null,
      };
    }

    const profile = await getFreeUserUsage(userId);
    if (!profile) {
      return {
        type: "FREE",
        remaining: 0,
        limit: USAGE_LIMITS.FREE_DEFAULT,
      };
    }

    return {
      type: "FREE",
      remaining: profile.freeCredits - profile.freeUsed,
      limit: profile.freeCredits,
    };
  }

  /* ----------------------------
     ANONYMOUS USER
  ---------------------------- */
  if (visitorId) {
    const anon = await getAnonymousUsage(visitorId);

    return {
      type: "ANON",
      remaining: USAGE_LIMITS.ANON - anon.resumeCount,
      limit: USAGE_LIMITS.ANON,
    };
  }

  return {
    type: "ANON",
    remaining: 2,
    limit: USAGE_LIMITS.ANON,
  };
}
