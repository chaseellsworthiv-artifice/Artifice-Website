import { NextResponse } from "next/server";

function clean(value) {
  return String(value ?? "").trim();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const submission = {
      name: clean(body.name),
      email: clean(body.email),
      eventType: clean(body.eventType),
      date: clean(body.date),
      location: clean(body.location),
      message: clean(body.message),
      website: clean(body.website),
      submittedAt: new Date().toISOString(),
      source: "artifice-site",
    };

    if (submission.website) {
      return NextResponse.json({ ok: true });
    }

    if (!submission.name || !submission.email || !submission.eventType || !submission.message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!isEmail(submission.email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;

    if (webhookUrl) {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
        cache: "no-store",
      });

      if (!webhookResponse.ok) {
        console.error("Invitation webhook failed", webhookResponse.status, webhookResponse.statusText);
        return NextResponse.json({ error: "Notification failed." }, { status: 502 });
      }
    } else {
      console.info("Artifice invitation request", submission);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invitation route error", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
