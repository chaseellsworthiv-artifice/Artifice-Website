"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buildRecommendation } from "./experience-data";
import styles from "./design.module.css";

const initialForm = {
  date: "",
  guestCount: "",
  eventType: "",
  details: "",
};

const eventTypes = ["Wedding", "Corporate", "Private Event", "Other"];
const interstitialLines = [
  "Reviewing guest count",
  "Considering flow of the room",
  "Shaping the strongest experience",
];

function mapSlug(slug) {
  return slug === "designed" ? "designed-experience" : slug;
}

export default function DesignFlow() {
  const [step, setStep] = useState("intake");
  const [form, setForm] = useState(initialForm);
  const [selectedType, setSelectedType] = useState("");
  const [result, setResult] = useState(null);
  const [lineIndex, setLineIndex] = useState(0);

  const canContinue = Boolean(form.date.trim() && form.guestCount.trim());

  useEffect(() => {
    if (step !== "considering") return undefined;

    const recommendation = buildRecommendation({
      ...form,
      eventType: selectedType || form.eventType,
    });

    const lineTimer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % interstitialLines.length);
    }, 650);

    const revealTimer = window.setTimeout(() => {
      setResult(recommendation);
      setStep("recommendation");
    }, 1850);

    return () => {
      window.clearInterval(lineTimer);
      window.clearTimeout(revealTimer);
    };
  }, [form, selectedType, step]);

  const recommendationLabel = useMemo(() => {
    if (!result) return "";
    return result.primary.slug === "close-up" ? "Recommended For Your Event" : "Where I Would Begin";
  }, [result]);

  const inquiryHref = useMemo(() => {
    const params = new URLSearchParams({
      date: form.date,
      guestCount: form.guestCount,
      eventType: selectedType || form.eventType,
      details: form.details,
    });

    return `/design/custom-inquiry?${params.toString()}`;
  }, [form, selectedType]);

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!canContinue) return;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "artifice-design-draft",
        JSON.stringify({
          date: form.date,
          guestCount: form.guestCount,
          eventType: selectedType || form.eventType,
          details: form.details,
        })
      );
    }

    setLineIndex(0);
    setStep("considering");
  }

  return (
    <main className={styles.page}>
      {step === "intake" ? (
        <section className={styles.shell}>
          <div className={styles.intakePanel}>
            <p className={styles.eyebrow}>Design Your Experience</p>
            <h1 className={styles.title}>Tell me about your event.</h1>
            <p className={styles.subtext}>
              A few details will help me recommend the right experience.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Event Date</span>
                <input
                  type="text"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="August 30, 2026"
                />
              </label>

              <label className={styles.field}>
                <span>Guest Count</span>
                <input
                  type="number"
                  min="1"
                  name="guestCount"
                  value={form.guestCount}
                  onChange={handleChange}
                  placeholder="80"
                />
              </label>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span>Event Type</span>
                <div className={styles.chips}>
                  {eventTypes.map((type) => {
                    const active = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>A Few Details</span>
                <textarea
                  name="details"
                  rows="5"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Anything I should know about the setting, pacing, or kind of experience you want to create?"
                />
              </label>

              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryAction} disabled={!canContinue}>
                  Continue
                </button>
              </div>
            </form>
          </div>

        </section>
      ) : null}

      {step === "considering" ? (
        <section className={`${styles.shell} ${styles.consideringShell}`}>
          <div className={styles.consideringPanel}>
            <div className={styles.trace} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className={styles.eyebrow}>Considering Your Event</p>
            <h2 className={styles.consideringTitle}>Considering your event</h2>
            <p className={styles.consideringLine}>{interstitialLines[lineIndex]}</p>
          </div>

        </section>
      ) : null}

      {step === "recommendation" && result ? (
        <section className={styles.recommendationShell}>
          <div className={styles.recommendationHeader}>
            <p className={styles.eyebrow}>Recommendation</p>
            <h1 className={styles.title}>Your Event, Thoughtfully Considered</h1>
            <p className={styles.subtext}>
              Based on what you shared, here is what I would recommend to create the strongest experience for your guests.
            </p>
          </div>

          <div className={styles.recommendationStack}>
            <article className={`${styles.card} ${styles.primaryCard}`}>
              <p className={styles.cardEyebrow}>{recommendationLabel}</p>
              <h2>{result.primary.name}</h2>
              <div className={styles.cardSection}>
                <strong>Why this fits</strong>
                <p>{result.primary.why}</p>
              </div>
              <div className={styles.cardSection}>
                <strong>What it feels like</strong>
                <p>{result.primary.feeling}</p>
              </div>
              <Link href={`/design/${mapSlug(result.primary.slug)}`} className={styles.primaryAction}>
                View Experience
              </Link>
            </article>

            <div className={styles.alternateStack}>
              {result.alternatives.map((experience) => (
                <article key={experience.slug} className={styles.card}>
                  <h3>{experience.name}</h3>
                  <p>{experience.why}</p>
                  <Link href={`/design/${mapSlug(experience.slug)}`} className={styles.secondaryAction}>
                    View Experience
                  </Link>
                </article>
              ))}
            </div>

            <article className={`${styles.card} ${styles.designedCard}`}>
              <p className={styles.cardEyebrow}>Designed Experience</p>
              <h3>Designed Experience</h3>
              <p>{result.designed.summary}</p>
              <p>{result.designed.feeling}</p>
              <p className={styles.priceCue}>Typically from $2,500+</p>
              <Link href="/design/designed-experience" className={styles.secondaryAction}>
                Explore This Experience
              </Link>
            </article>
          </div>

          <div className={styles.customPrompt}>
            <p className={styles.customPromptLabel}>Need something more tailored?</p>
            <Link href={inquiryHref} className={styles.secondaryAction}>
              Custom Inquiry
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
