import { NextResponse } from "next/server";
import { getAvailabilityWindow } from "../_lib/availability";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const availability = await getAvailabilityWindow(start ? new Date(start) : undefined, end ? new Date(end) : undefined);
    return NextResponse.json({ ok: true, ...availability });
  } catch (error) {
    console.error("Availability lookup failed", error);
    return NextResponse.json({ error: "Unable to load availability." }, { status: 500 });
  }
}
