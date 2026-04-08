"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import styles from "./experience.module.css";

const initialForm = {
  name: "",
  email: "",
  date: "",
  guestCount: "",
  eventType: "",
  location: "",
  details: "",
};

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function parsePriceToCents(price) {
  const numeric = Number.parseFloat(String(price || "$0").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100);
}

export default function SecureDateFlow({ experience, selectedDepth, basePath = "/experience" }) {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const totalAmountCents = useMemo(() => parsePriceToCents(selectedDepth?.price), [selectedDepth]);
  const depositAmountCents = Math.round(totalAmountCents / 2);
  const depositAmount = formatMoney(depositAmountCents / 100);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.sessionStorage.getItem("artifice-design-draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      setForm((current) => ({
        ...current,
        date: current.date || draft.date || "",
        guestCount: current.guestCount || draft.guestCount || "",
        eventType: current.eventType || draft.eventType || "",
        details: current.details || draft.details || "",
      }));
    } catch {}
  }, []);

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.date.trim() || !form.guestCount.trim()) {
      setError("Please complete the required booking details.");
      return;
    }

    setState("submitting");

    try {
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactName: form.name,
          contactEmail: form.email,
          eventType: form.eventType || experience.name,
          eventDate: form.date,
          location: form.location,
          message: [
            `Selected Experience: ${experience.name}`,
            `Selected Depth: ${selectedDepth.name}`,
            `Guest Count: ${form.guestCount}`,
            form.details,
          ]
            .filter(Boolean)
            .join("\n\n"),
          selectedSlotStart: form.date,
          selectedSlotEnd: form.date,
          status: "pending",
          notes: `${experience.name} / ${selectedDepth.name}`,
          depositStatus: "not_requested",
          depositAmount: depositAmountCents,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error("Booking creation failed");
      }

      const bookingPayload = await bookingResponse.json();
      const booking = bookingPayload.booking;

      const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
      const depositResponse = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.id,
          email: form.email,
          name: form.name,
          amount: depositAmountCents,
          successUrl: `${siteUrl}/booking/confirmed?booking=${booking.id}`,
          cancelUrl: `${siteUrl}${basePath}/${experience.slug === "designed" ? "designed-experience" : experience.slug}/secure?depth=${selectedDepth.id}&cancelled=1`,
        }),
      });

      if (!depositResponse.ok) {
        throw new Error("Deposit session failed");
      }

      const depositPayload = await depositResponse.json();
      if (!depositPayload.checkoutUrl) {
        throw new Error("Missing checkout URL");
      }

      window.location.assign(depositPayload.checkoutUrl);
    } catch (submitError) {
      console.error("Secure date handoff failed", submitError);
      setState("idle");
      setError("Unable to continue to deposit. Please try again.");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.detailHero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Secure Your Date</p>
          <h1 className={styles.title}>Confirm the shape of the booking before deposit.</h1>
          <p className={styles.intro}>
            This step keeps the handoff clear. Confirm the experience, the depth, and the event details before payment.
          </p>
        </div>
      </section>

      <section className={styles.detailStage}>
        <div className={styles.detailGrid}>
          <div className={styles.detailCopy}>
            <p className={styles.sectionLabel}>Selection</p>
            <h2>
              {experience.name} / {selectedDepth.name}
            </h2>
            <div className={styles.detailNotes}>
              <p>{selectedDepth.descriptor}</p>
              <p>{selectedDepth.note}</p>
            </div>
            <div className={styles.detailSupport}>
              <p>{selectedDepth.duration}</p>
              <p>Total test price: {selectedDepth.price}</p>
              <p>Deposit due in the next step: {depositAmount}</p>
            </div>
          </div>

          <div className={styles.detailCard}>
            <p className={styles.cardEyebrow}>Booking Details</p>
            <form className={styles.secureForm} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Name</span>
                <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>Email</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
              </label>
              <label className={styles.field}>
                <span>Event Date</span>
                <input type="text" name="date" value={form.date} onChange={handleChange} placeholder="August 30, 2026" />
              </label>
              <label className={styles.field}>
                <span>Guest Count</span>
                <input type="number" min="1" name="guestCount" value={form.guestCount} onChange={handleChange} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Event Type</span>
                <input type="text" name="eventType" value={form.eventType} onChange={handleChange} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Location</span>
                <input type="text" name="location" value={form.location} onChange={handleChange} />
              </label>
              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>Event Details</span>
                <textarea name="details" rows="5" value={form.details} onChange={handleChange} />
              </label>
              {error ? <p className={styles.formError}>{error}</p> : null}
              <button type="submit" className={styles.primaryAction} disabled={state === "submitting"}>
                Continue to Payment
              </button>
            </form>
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href={`${basePath}/${experience.slug === "designed" ? "designed-experience" : experience.slug}?depth=${selectedDepth.id}`} className={styles.secondaryAction}>
            Back to Experience
          </Link>
        </div>
      </section>
    </main>
  );
}
