export const runtime = "nodejs";

// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

console.log("🔥 Clerk webhook route HIT");

function getReferralCookie(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [k, ...v] = c.split("=");
      return [k, v.join("=")];
    })
  );

  return cookies["resumatch_ref"] ?? null;
}

export async function POST(req: Request) {
  const hdrs = await headers();
  const svixId = hdrs.get("svix-id");
  const svixTimestamp = hdrs.get("svix-timestamp");
  const svixSignature = hdrs.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: any;
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("❌ Clerk webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const data = evt.data;
    const userId: string = data.id;
    const email: string | null = data.email_addresses?.[0]?.email_address ?? null;
    const firstName: string | null = data.first_name ?? null;
    const lastName: string | null = data.last_name ?? null;

    console.log("➡️ Clerk user.created:", userId);

    // Generate referral code from userId
    const referralCode = crypto
      .createHash("sha256")
      .update(userId)
      .digest("hex")
      .slice(0, 10);


    // Read referral cookie (if any)
    const referredBy = getReferralCookie(req);

    // If there is a referrer, credit them +1 free_credits
    if (referredBy) {
      console.log("🎁 Referral detected:", referredBy);
      await db
        .update(userProfiles)
        .set({
          freeCredits: sql`${userProfiles.freeCredits} + 1`,
        })
        .where(eq(userProfiles.referralCode, referredBy));
    }

    // Insert profile for this user
    await db
      .insert(userProfiles)
      .values({
        userId,
        createdAt: new Date(),
        firstName,
        lastName,
        email,
        plan: "free",
        freeCredits: 7,
        freeUsed: 0,
        referralCode,
        referredBy,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          firstName,
          lastName,
          email,
        },
      });

    console.log("✅ user_profiles row created/updated for user:", userId);

    return NextResponse.json({ success: true });
  }

  // Ignore other Clerk events for now
  return NextResponse.json({ status: "ignored", type: evt.type });
}
