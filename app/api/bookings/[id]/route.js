import { NextResponse } from "next/server";
import { updateBooking } from "../../_lib/data-store";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const updates = {
      status: typeof body.status === "string" ? body.status : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
      depositStatus: typeof body.depositStatus === "string" ? body.depositStatus : undefined,
      depositAmount: Number.isFinite(Number(body.depositAmount)) ? Number(body.depositAmount) : undefined,
      depositSessionId: typeof body.depositSessionId === "string" ? body.depositSessionId : undefined,
    };
    const payload = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
    const record = await updateBooking(id, payload);

    if (!record) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking: record });
  } catch (error) {
    console.error("Update booking failed", error);
    return NextResponse.json({ error: "Unable to update booking." }, { status: 500 });
  }
}
