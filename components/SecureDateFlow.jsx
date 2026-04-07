"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

export default function SecureDateFlow({ experience, selectedDepth, basePath = "/experience" }) {
  const [form, setForm] = useState(initialForm);

  const depositAmount = useMemo(() => {
    const price = Number.parseFloat(String(selectedDepth?.price || "$0").replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(price)) return "$0.00";
    return `$${(price / 2).toFixed(2)}`;
  }, [selectedDepth]);

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
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
            <form className={styles.secureForm}>
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
              <button type="button" className={styles.primaryAction} disabled>
                Continue to Deposit
              </button>
              <p className={styles.placeholderNote}>Phase 3 complete. Stripe deposit comes next.</p>
            </form>
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href={`${basePath}/${experience.slug === "designed" ? "designed-experience" : experience.slug}?depth=${selectedDepth.id}`} className={styles.secondaryAction}>
            Back to Experience
          </Link>
          <Link href="/#booking" className={styles.secondaryAction}>
            Custom Inquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
