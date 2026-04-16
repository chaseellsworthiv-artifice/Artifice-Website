import { NextResponse } from "next/server";
import { createBooking, listBookings } from "../_lib/data-store";
import { notifyEvent } from "../_lib/notify";

function clean(value) {
  return String(value ?? "").trim();
}

export async function GET() {
  try {
    const bookings = await listBookings();
    return NextResponse.json({ ok: true, bookings });
  } catch (error) {
    console.error("List bookings failed", error);
    return NextResponse.json({ error: "Unable to load bookings." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const bookingInput = {
      inquiryId: clean(body.inquiryId) || null,
      contactName: clean(body.contactName),
      contactEmail: clean(body.contactEmail),
      eventType: clean(body.eventType),
      eventDate: clean(body.eventDate),
      location: clean(body.location),
      message: clean(body.message),
      selectedSlotStart: clean(body.selectedSlotStart),
      selectedSlotEnd: clean(body.selectedSlotEnd),
      status: clean(body.status) || "pending",
      notes: clean(body.notes),
    };

    if (!bookingInput.contactName || !bookingInput.contactEmail || !bookingInput.eventType || !bookingInput.selectedSlotStart || !bookingInput.selectedSlotEnd) {
      return NextResponse.json({ error: "Missing required booking fields." }, { status: 400 });
    }

    const booking = await createBooking(bookingInput);
    await notifyEvent("booking.created", booking);
    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("Create booking failed", error);
    return NextResponse.json({ error: "Unable to create booking." }, { status: 500 });
  }
}
