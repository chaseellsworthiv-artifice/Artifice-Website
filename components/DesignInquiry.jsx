"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./design.module.css";

export default function DesignInquiry({ initialValues }) {
  const selectedExperience = initialValues.experience || "";
  const selectedDepth = initialValues.depth || "";
  const selectedDuration = initialValues.duration || "";
  const selectedPrice = initialValues.price || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    venue: initialValues.venue || "",
    atmosphere: "",
    date: initialValues.date || "",
    guestCount: initialValues.guestCount || "",
    eventType: initialValues.eventType || "",
    details: initialValues.details || "",
  });
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

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

    if (!form.name.trim() || !form.email.trim() || !form.eventType.trim() || !form.details.trim()) {
      setError("Please complete the required fields.");
      return;
    }

    setState("submitting");

    try {
      const response = await fetch("/api/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          eventType: form.eventType,
          date: form.date,
          location: form.venue,
          message: [
            selectedExperience ? `Selected Experience: ${selectedExperience}` : "",
            selectedDepth ? `Selected Depth: ${selectedDepth}` : "",
            selectedDuration ? `Duration: ${selectedDuration}` : "",
            selectedPrice ? `Listed Price: ${selectedPrice}` : "",
            form.details,
            form.atmosphere ? `Atmosphere: ${form.atmosphere}` : "",
            form.guestCount ? `Guest Count: ${form.guestCount}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          website: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Inquiry failed");
      }

      setState("submitted");
    } catch (submitError) {
      console.error("Design inquiry failed", submitError);
      setState("idle");
      setError("The inquiry did not go through. Please try again.");
    }
  }

  if (state === "submitted") {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.confirmationEditorial}>
            <p className={styles.eyebrow}>Inquiry Received</p>
            <h1 className={styles.title}>Inquiry received.</h1>
            <p className={styles.subtext}>
              I’ll review the details and follow up with a recommended structure for your event.
            </p>
            <div className={styles.formActions}>
              <Link href="/" className={styles.primaryAction}>
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.inquiryEditorial}>
          <div className={styles.inquiryCopy}>
            <p className={styles.eyebrow}>Request</p>
            <h1 className={styles.title}>Complete the request.</h1>
            <p className={styles.subtext}>
              I already have the event shape. Add the best way to reach you and anything the room should feel like.
            </p>

            {selectedExperience ? (
              <div className={styles.inquiryMemory}>
                <p className={styles.cardEyebrow}>Selected Direction</p>
                <h2>
                  {selectedExperience}
                  {selectedDepth ? ` / ${selectedDepth}` : ""}
                </h2>
                <p>
                  {[selectedDuration, selectedPrice].filter(Boolean).join(" / ")}
                </p>
              </div>
            ) : null}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
            </label>
            <label className={styles.field}>
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
            </label>
            <label className={styles.field}>
              <span>Date</span>
              <input type="text" name="date" value={form.date} onChange={handleChange} />
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
              <span>Venue / City</span>
              <input type="text" name="venue" value={form.venue} onChange={handleChange} />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Describe the Event</span>
              <textarea name="details" rows="5" value={form.details} onChange={handleChange} />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>What Kind of Atmosphere Do You Want to Create?</span>
              <textarea name="atmosphere" rows="4" value={form.atmosphere} onChange={handleChange} />
            </label>
            {error ? <p className={styles.formError}>{error}</p> : null}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryAction} disabled={state === "submitting"}>
                Submit Inquiry
              </button>
              <Link href="/design" className={styles.secondaryAction}>
                Back to Recommendation
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
