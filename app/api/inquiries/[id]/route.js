import { NextResponse } from "next/server";
import { updateInquiry } from "../../_lib/data-store";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const allowed = {
      status: typeof body.status === "string" ? body.status : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    };

    const updates = Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));
    const record = await updateInquiry(id, updates);

    if (!record) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, inquiry: record });
  } catch (error) {
    console.error("Update request failed", error);
    return NextResponse.json({ error: "Unable to update request." }, { status: 500 });
  }
}
