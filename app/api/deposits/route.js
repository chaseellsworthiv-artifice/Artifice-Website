import { NextResponse } from "next/server";
import { updateBooking } from "../_lib/data-store";
import { notifyEvent } from "../_lib/notify";

function clean(value) {
  return String(value ?? "").trim();
}

async function createStripeCheckout({ bookingId, amount, email, name }) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!secretKey) {
    return {
      provider: "mock",
      checkoutUrl: `${siteUrl}/studio/bookings?mockDeposit=${bookingId}`,
      sessionId: `mock_${bookingId}`,
    };
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      mode: "payment",
      success_url: `${siteUrl}/studio/bookings?deposit=success&booking=${bookingId}`,
      cancel_url: `${siteUrl}/studio/bookings?deposit=cancelled&booking=${bookingId}`,
      customer_email: email,
      "line_items[0][price_data][currency]": "usd",
      "line_items[0][price_data][product_data][name]": `Artifice deposit for ${name}`,
      "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][quantity]": "1",
      "metadata[bookingId]": bookingId,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe checkout session failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  return {
    provider: "stripe",
    checkoutUrl: payload.url,
    sessionId: payload.id,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const bookingId = clean(body.bookingId);
    const email = clean(body.email);
    const name = clean(body.name);
    const amount = Number(body.amount ?? 0);

    if (!bookingId || !email || !name || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Missing deposit details." }, { status: 400 });
    }

    const session = await createStripeCheckout({ bookingId, amount, email, name });
    await updateBooking(bookingId, {
      depositStatus: session.provider === "stripe" ? "requested" : "mock_requested",
      depositAmount: amount,
      depositSessionId: session.sessionId,
    });
    await notifyEvent("deposit.requested", {
      bookingId,
      amount,
      provider: session.provider,
      sessionId: session.sessionId,
    });

    return NextResponse.json({ ok: true, ...session });
  } catch (error) {
    console.error("Deposit session failed", error);
    return NextResponse.json({ error: "Unable to create deposit session." }, { status: 500 });
  }
}
