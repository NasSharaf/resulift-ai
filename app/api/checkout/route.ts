import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  // Create or reuse a Stripe customer with metadata linking to Clerk user
  const customer = await stripe.customers.create({
    metadata: { userId },
  });

  console.log("🧾 Created Stripe customer for:", userId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customer.id, // IMPORTANT!
    line_items: [
      {
        price: process.env.STRIPE_PRICE_BASIC,
        quantity: 1,
      },
    ],
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/?canceled=true`,
    metadata: { userId },            // attach to session
    subscription_data: {
      metadata: { userId },          // attach to subscription
    },
  });

  console.log("➡️ Checkout session created:", session.id);

  return NextResponse.json({ url: session.url });
}
