import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  returnTo?: string; // e.g. "/report?url=..."
};

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secretKey || !priceId || !siteUrl) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe env vars. Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, and NEXT_PUBLIC_SITE_URL.",
      },
      { status: 500 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const returnTo = body.returnTo && body.returnTo.startsWith("/") ? body.returnTo : "/report";

  const joiner = returnTo.includes("?") ? "&" : "?";
  const successUrl = `${siteUrl}${returnTo}${joiner}session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl}${returnTo}`;

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Keep it friendly: people can checkout without creating an account.
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
