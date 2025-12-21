// app/api/webhooks/stripe/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/db";
import { subscriptions, userProfiles, stripeEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
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

  /* --------------------------------------------------
     IDEMPOTENCY CHECK (KEEP, BUT FIXED)
  -------------------------------------------------- */
  const alreadyProcessed = await db
    .select()
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id))
    .limit(1);

  if (alreadyProcessed.length > 0) {
    return NextResponse.json({ received: true });
  }

  // Helper to convert Stripe's unix seconds → JS Date
  const toDate = (unixSeconds: unknown): Date => {
    const n =
      typeof unixSeconds === "number"
        ? unixSeconds
        : typeof unixSeconds === "string"
        ? Number(unixSeconds)
        : 0;
    return new Date(n * 1000);
  };

  /* --------------------------------------------------
     PROCESS EVENT + RECORD (ATOMIC)
  -------------------------------------------------- */
  try {
    await db.transaction(async (tx) => {
      // -------------------------
      // SUBSCRIPTION CREATED
      // -------------------------
      if (event.type === "customer.subscription.created") {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.error("❌ No userId in subscription metadata");
          return;
        }

        const stripeCustomerId = sub.customer?.toString() ?? "";
        const planId = sub.items.data[0]?.price?.id ?? "unknown";
        const currentPeriodEnd = toDate((sub as any).current_period_end);

        await tx
          .insert(subscriptions)
          .values({
            id: crypto.randomUUID(),
            userId,
            stripeCustomerId,
            stripeSubscriptionId: sub.id,
            planId,
            status: sub.status,
            currentPeriodEnd,
          })
          .onConflictDoNothing(); // 👈 IMPORTANT

        await tx
          .update(userProfiles)
          .set({ plan: "pro" })
          .where(eq(userProfiles.userId, userId));
      }

      // -------------------------
      // SUBSCRIPTION UPDATED
      // -------------------------
      if (event.type === "customer.subscription.updated") {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.error("❌ No userId in subscription.updated metadata");
          return;
        }

        const currentPeriodEnd = toDate((sub as any).current_period_end);

        await tx
          .update(subscriptions)
          .set({
            status: sub.status,
            currentPeriodEnd,
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        await tx
          .update(userProfiles)
          .set({ plan: sub.status === "active" ? "pro" : "free" })
          .where(eq(userProfiles.userId, userId));
      }

      // -------------------------
      // SUBSCRIPTION DELETED
      // -------------------------
      if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.error("❌ No userId in subscription.deleted metadata");
          return;
        }

        await tx
          .update(userProfiles)
          .set({ plan: "free" })
          .where(eq(userProfiles.userId, userId));
      }

      /* --------------------------------------------
         RECORD EVENT (THIS WAS MISSING)
      -------------------------------------------- */
      await tx.insert(stripeEvents).values({
        id: event.id,
        type: event.type,
        processedAt: new Date,
      });
    });
  } catch (err) {
    console.error("❌ Stripe webhook processing failed:", err);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
