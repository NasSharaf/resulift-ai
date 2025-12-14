import { stripe } from "@/app/lib/stripe";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub.length) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub[0].stripeCustomerId,
    return_url: req.headers.get("origin")!,
  });

  return NextResponse.json({ url: session.url });
}
