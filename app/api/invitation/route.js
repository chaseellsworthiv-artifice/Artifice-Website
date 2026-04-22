import { NextResponse } from "next/server";
import { storeInquiry } from "./store";
import { notifyEvent } from "../_lib/notify";

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

    const storageResult = await storeInquiry(submission);

    let notification = { delivered: false, mode: "skipped" };
    try {
      notification = await notifyEvent("inquiry.created", {
        submission,
        inquiryId: storageResult.record?.id ?? null,
        mode: storageResult.mode,
      });
    } catch (notificationError) {
      console.error("Request notification failed", notificationError);
    }

    return NextResponse.json({
      ok: true,
      stored: storageResult.stored,
      mode: storageResult.mode,
      id: storageResult.record?.id ?? null,
      notification,
    });
  } catch (error) {
    console.error("Invitation route error", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
