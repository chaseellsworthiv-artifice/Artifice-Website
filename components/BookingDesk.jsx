"use client";

import { useState } from "react";
import styles from "./inquiry-dashboard.module.css";

function formatSlot(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingDesk({ initialInquiries, initialBookings, initialSlots }) {
  const [inquiries] = useState(initialInquiries);
  const [bookings, setBookings] = useState(initialBookings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const inquiryId = String(formData.get("inquiryId") ?? "");
    const selectedInquiry = inquiries.find((entry) => entry.id === inquiryId);
    const slot = String(formData.get("slot") ?? "");
    const [selectedSlotStart, selectedSlotEnd] = slot.split("|");
    const valueOrFallback = (fieldName, fallback) => {
      const value = String(formData.get(fieldName) ?? "").trim();
      return value || fallback || "";
    };

    const payload = {
      inquiryId: inquiryId || null,
      contactName: valueOrFallback("contactName", selectedInquiry?.name),
      contactEmail: valueOrFallback("contactEmail", selectedInquiry?.email),
      eventType: valueOrFallback("eventType", selectedInquiry?.event_type ?? selectedInquiry?.eventType),
      eventDate: valueOrFallback("eventDate", selectedInquiry?.event_date ?? selectedInquiry?.date),
      location: valueOrFallback("location", selectedInquiry?.location),
      message: valueOrFallback("notes", selectedInquiry?.message),
      notes: String(formData.get("notes") ?? "").trim(),
      selectedSlotStart,
      selectedSlotEnd,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Create booking failed");
      }

      const result = await response.json();
      setBookings((current) => [result.booking, ...current]);
      event.currentTarget.reset();
      setMessage("Booking record created.");
    } catch (issue) {
      console.error(issue);
      setError("Could not create booking.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Booking Flow</p>
        <h1>Booking desk</h1>
        <p className={styles.subtitle}>Convert qualified inquiries into booking records using the current availability layer.</p>
      </header>

      <section className={styles.shell}>
        <aside className={styles.list}>
          <p className={styles.detailLabel}>Existing bookings</p>
          {bookings.length ? (
            bookings.map((booking) => (
              <div key={booking.id} className={styles.listItem}>
                <div className={styles.listTop}>
                  <span>{booking.contactName ?? booking.contact_name}</span>
                  <span className={styles.status}>{booking.status}</span>
                </div>
                <p>{booking.eventType ?? booking.event_type}</p>
                <small>{booking.selectedSlotStart ? formatSlot(booking.selectedSlotStart) : booking.selected_slot_start ? formatSlot(booking.selected_slot_start) : "Slot pending"}</small>
              </div>
            ))
          ) : (
            <div className={styles.empty}>No bookings created yet.</div>
          )}
        </aside>

        <section className={styles.detail}>
          <form className={styles.controls} onSubmit={handleSubmit}>
            <label className={styles.controlBlock}>
              <span>Inquiry</span>
              <select name="inquiryId" defaultValue="">
                <option value="">Manual entry</option>
                {inquiries.map((inquiry) => (
                  <option key={inquiry.id} value={inquiry.id}>
                    {inquiry.name} · {inquiry.event_type ?? inquiry.eventType ?? "Inquiry"}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.controlBlock}>
              <span>Contact Name</span>
              <input name="contactName" type="text" required />
            </label>

            <label className={styles.controlBlock}>
              <span>Contact Email</span>
              <input name="contactEmail" type="email" required />
            </label>

            <label className={styles.controlBlock}>
              <span>Event Type</span>
              <input name="eventType" type="text" required />
            </label>

            <label className={styles.controlBlock}>
              <span>Event Date</span>
              <input name="eventDate" type="text" />
            </label>

            <label className={styles.controlBlock}>
              <span>Location</span>
              <input name="location" type="text" />
            </label>

            <label className={styles.controlBlock}>
              <span>Slot</span>
              <select name="slot" required>
                <option value="">Select a slot</option>
                {initialSlots.map((slot) => (
                  <option key={slot.start} value={`${slot.start}|${slot.end}`}>
                    {formatSlot(slot.start)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.controlBlock}>
              <span>Notes</span>
              <textarea name="notes" rows="6" />
            </label>

            <button type="submit" className={styles.listItem} disabled={saving}>
              {saving ? "Creating…" : "Create booking record"}
            </button>
            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.status}>{message}</p> : null}
          </form>
        </section>
      </section>
    </main>
  );
}
