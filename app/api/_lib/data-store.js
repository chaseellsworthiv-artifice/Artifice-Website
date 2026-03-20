import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const inquiryFile = path.join(dataDir, "inquiries.json");
const bookingFile = path.join(dataDir, "bookings.json");
const validModes = new Set(["auto", "file", "supabase", "none"]);

function getMode() {
  const raw = process.env.INQUIRY_STORE_MODE?.trim().toLowerCase();
  return validModes.has(raw) ? raw : "auto";
}

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function shouldUseFileStore(mode) {
  return mode === "file" || (mode === "auto" && process.env.NODE_ENV !== "production" && !hasSupabaseConfig());
}

function shouldUseSupabase(mode) {
  return mode === "supabase" || (mode === "auto" && hasSupabaseConfig());
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase storage selected without SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return { supabaseUrl, serviceRoleKey };
}

async function ensureStore(filePath) {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, "[]\n", "utf8");
  }
}

async function readAll(filePath) {
  await ensureStore(filePath);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeAll(filePath, records) {
  await ensureStore(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function mapInquirySubmissionToRecord(submission) {
  return {
    status: "new",
    notes: "",
    source: submission.source,
    name: submission.name,
    email: submission.email,
    event_type: submission.eventType,
    event_date: submission.date,
    location: submission.location,
    message: submission.message,
    submitted_at: submission.submittedAt,
  };
}

function mapBookingRecordToRow(record) {
  return {
    inquiry_id: record.inquiryId ?? null,
    status: record.status,
    notes: record.notes,
    contact_name: record.contactName,
    contact_email: record.contactEmail,
    event_type: record.eventType,
    event_date: record.eventDate,
    location: record.location,
    message: record.message,
    selected_slot_start: record.selectedSlotStart,
    selected_slot_end: record.selectedSlotEnd,
    deposit_status: record.depositStatus,
    deposit_amount: record.depositAmount,
    deposit_session_id: record.depositSessionId,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

async function insertSupabase(tableName, payload) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase insert failed for ${tableName}: ${response.status} ${errorText}`);
  }

  const [record] = await response.json();
  return record;
}

async function listSupabase(tableName, select = "*") {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=${encodeURIComponent(select)}&order=created_at.desc`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase list failed for ${tableName}: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function updateSupabase(tableName, id, payload) {
  const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Supabase update failed for ${tableName}: ${response.status} ${errorText}`);
  }

  const [record] = await response.json();
  return record;
}

export async function storeInquiry(submission) {
  const mode = getMode();
  if (shouldUseSupabase(mode)) {
    const tableName = process.env.INQUIRY_TABLE_NAME || "inquiries";
    const record = await insertSupabase(tableName, mapInquirySubmissionToRecord(submission));
    return { stored: true, mode: "supabase", record: record ? { id: record.id, status: record.status } : undefined };
  }

  if (shouldUseFileStore(mode)) {
    const inquiries = await readAll(inquiryFile);
    const record = { id: crypto.randomUUID(), status: "new", notes: "", ...submission, createdAt: submission.submittedAt };
    inquiries.unshift(record);
    await writeAll(inquiryFile, inquiries);
    return { stored: true, mode: "file", record };
  }

  if (mode === "supabase") {
    throw new Error("Supabase inquiry storage is enabled but not configured.");
  }

  return { stored: false, mode: "none" };
}

export async function listInquiries() {
  const mode = getMode();
  if (shouldUseSupabase(mode)) {
    const tableName = process.env.INQUIRY_TABLE_NAME || "inquiries";
    return listSupabase(tableName);
  }

  if (shouldUseFileStore(mode)) {
    return readAll(inquiryFile);
  }

  return [];
}

export async function updateInquiry(id, updates) {
  const mode = getMode();
  if (shouldUseSupabase(mode)) {
    const tableName = process.env.INQUIRY_TABLE_NAME || "inquiries";
    return updateSupabase(tableName, id, updates);
  }

  if (shouldUseFileStore(mode)) {
    const inquiries = await readAll(inquiryFile);
    const index = inquiries.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    inquiries[index] = { ...inquiries[index], ...updates, updatedAt: new Date().toISOString() };
    await writeAll(inquiryFile, inquiries);
    return inquiries[index];
  }

  return null;
}

export async function createBooking(input) {
  const record = {
    id: crypto.randomUUID(),
    inquiryId: input.inquiryId ?? null,
    status: input.status ?? "pending",
    notes: input.notes ?? "",
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    eventType: input.eventType,
    eventDate: input.eventDate ?? "",
    location: input.location ?? "",
    message: input.message ?? "",
    selectedSlotStart: input.selectedSlotStart ?? "",
    selectedSlotEnd: input.selectedSlotEnd ?? "",
    depositStatus: input.depositStatus ?? "not_requested",
    depositAmount: input.depositAmount ?? 0,
    depositSessionId: input.depositSessionId ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mode = getMode();
  if (shouldUseSupabase(mode)) {
    const tableName = process.env.BOOKING_TABLE_NAME || "bookings";
    const inserted = await insertSupabase(tableName, mapBookingRecordToRow(record));
    return { ...record, id: inserted?.id ?? record.id };
  }

  if (shouldUseFileStore(mode)) {
    const bookings = await readAll(bookingFile);
    bookings.unshift(record);
    await writeAll(bookingFile, bookings);
    return record;
  }

  return record;
}

export async function listBookings() {
  const mode = getMode();
  if (shouldUseSupabase(mode)) {
    const tableName = process.env.BOOKING_TABLE_NAME || "bookings";
    return listSupabase(tableName);
  }

  if (shouldUseFileStore(mode)) {
    return readAll(bookingFile);
  }

  return [];
}

export async function updateBooking(id, updates) {
  const mode = getMode();
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (shouldUseSupabase(mode)) {
    const tableName = process.env.BOOKING_TABLE_NAME || "bookings";
    const mapped = {};
    if (payload.status !== undefined) mapped.status = payload.status;
    if (payload.notes !== undefined) mapped.notes = payload.notes;
    if (payload.depositStatus !== undefined) mapped.deposit_status = payload.depositStatus;
    if (payload.depositAmount !== undefined) mapped.deposit_amount = payload.depositAmount;
    if (payload.depositSessionId !== undefined) mapped.deposit_session_id = payload.depositSessionId;
    if (payload.updatedAt !== undefined) mapped.updated_at = payload.updatedAt;
    return updateSupabase(tableName, id, mapped);
  }

  if (shouldUseFileStore(mode)) {
    const bookings = await readAll(bookingFile);
    const index = bookings.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    bookings[index] = { ...bookings[index], ...payload };
    await writeAll(bookingFile, bookings);
    return bookings[index];
  }

  return null;
}
