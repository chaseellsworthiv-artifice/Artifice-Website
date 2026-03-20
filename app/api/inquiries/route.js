import { NextResponse } from "next/server";
import { listInquiries } from "../_lib/data-store";

export async function GET() {
  try {
    const inquiries = await listInquiries();
    return NextResponse.json({ ok: true, inquiries });
  } catch (error) {
    console.error("List inquiries failed", error);
    return NextResponse.json({ error: "Unable to load inquiries." }, { status: 500 });
  }
}
