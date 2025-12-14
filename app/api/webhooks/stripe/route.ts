// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { subscriptions, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hdrs = await headers();
  const signature = hdrs.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("❌ Stripe webhook signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  // Helper to convert Stripe's unix seconds → JS Date
  const toDate = (unixSeconds: unknown): Date => {
    const n = typeof unixSeconds === "number"
      ? unixSeconds
      : typeof unixSeconds === "string"
      ? Number(unixSeconds)
      : 0;
    return new Date(n * 1000);
  };

  // -------------------------
  // SUBSCRIPTION CREATED
  // -------------------------
  if (event.type === "customer.subscription.created") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;

    if (!userId) {
      console.error("❌ No userId in subscription metadata");
      return NextResponse.json({ received: true });
    }

    console.log("📦 Subscription object (created):", sub.id);

    const stripeCustomerId = sub.customer?.toString() ?? "";
    const planId = sub.items.data[0]?.price?.id ?? "unknown";

    // IMPORTANT: Stripe gives unix seconds, Drizzle expects Date
    const currentPeriodEnd = toDate((sub as any).current_period_end);

    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      userId,
      stripeCustomerId,
      stripeSubscriptionId: sub.id,
      planId,
      status: sub.status,
      currentPeriodEnd,
    });

    console.log("📝 Inserted new subscription row");

    await db
      .update(userProfiles)
      .set({ plan: "pro" })
      .where(eq(userProfiles.userId, userId));

    console.log("🌟 Updated user profile to PRO:", userId);
  }

  // -------------------------
  // SUBSCRIPTION UPDATED
  // -------------------------
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;

    if (!userId) {
      console.error("❌ No userId in subscription.updated metadata");
      return NextResponse.json({ received: true });
    }

    console.log("🔄 subscription updated:", sub.id, "status:", sub.status);

    const currentPeriodEnd = toDate((sub as any).current_period_end);

    await db
      .update(subscriptions)
      .set({
        status: sub.status,
        currentPeriodEnd,
      })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));

    await db
      .update(userProfiles)
      .set({ plan: sub.status === "active" ? "pro" : "free" })
      .where(eq(userProfiles.userId, userId));

    console.log("🔁 Updated subscription row + user plan");
  }

  // -------------------------
  // SUBSCRIPTION DELETED (canceled)
  // -------------------------
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;

    if (!userId) {
      console.error("❌ No userId in subscription.deleted metadata");
      return NextResponse.json({ received: true });
    }

    console.log("❌ Subscription deleted:", sub.id);

    await db
      .update(userProfiles)
      .set({ plan: "free" })
      .where(eq(userProfiles.userId, userId));

    console.log("⬇️ Downgraded user to FREE:", userId);
  }

  return NextResponse.json({ received: true });
}
