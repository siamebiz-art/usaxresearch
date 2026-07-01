import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICE_IDS: Record<string, string> = {
  pro:          process.env.STRIPE_PRO_PRICE_ID   ?? "",
  elite:        process.env.STRIPE_ELITE_PRICE_ID ?? "",
  pro_annual:   process.env.STRIPE_PRO_ANNUAL_PRICE_ID   ?? "",
  elite_annual: process.env.STRIPE_ELITE_ANNUAL_PRICE_ID ?? "",
};

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia" as any,
  });

  try {
    const { userId, email, plan = "pro" } = await req.json();
    const priceId = PRICE_IDS[plan];
    if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://usaxresearch.com";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { userId, plan },
      success_url: `${siteUrl}/dashboard?upgraded=true&plan=${plan}`,
      cancel_url:  `${siteUrl}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
