import { NextResponse } from "next/server";
import { listInquiries } from "../_lib/data-store";

export async function GET() {
  try {
    const inquiries = await listInquiries();
    return NextResponse.json({ ok: true, inquiries });
  } catch (error) {
    console.error("List requests failed", error);
    return NextResponse.json({ error: "Unable to load requests." }, { status: 500 });
  }
}
