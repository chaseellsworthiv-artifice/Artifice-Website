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

const recommendationNotes = {
  "close-up": "A fluid choice for cocktail-style rooms, receptions, and evenings built around movement.",
  table: "A focused choice when the room can support a deliberate point of invitation.",
  cabaret: "A shared choice when the evening needs one concentrated room-wide moment.",
};

function mapSlug(slug) {
  return slug === "designed" ? "designed-experience" : slug;
}

function buildEventParams(form, selectedType) {
  const params = new URLSearchParams();
  const eventType = selectedType || form.eventType;

  if (form.date) params.set("date", form.date);
  if (form.guestCount) params.set("guestCount", form.guestCount);
  if (eventType) params.set("eventType", eventType);
  if (form.details) params.set("details", form.details);

  return params;
}

export default function DesignFlow() {
  const [step, setStep] = useState("intake");
  const [form, setForm] = useState(initialForm);
  const [selectedType, setSelectedType] = useState("");
  const [result, setResult] = useState(null);
  const [lineIndex, setLineIndex] = useState(0);

  const canContinue = Boolean(form.date.trim() && form.guestCount.trim());

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.sessionStorage.getItem("artifice-design-draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      const restoredForm = {
        date: draft.date || "",
        guestCount: draft.guestCount || "",
        eventType: draft.eventType || "",
        details: draft.details || "",
      };
      setForm(restoredForm);
      setSelectedType(draft.eventType || "");

      if (draft.step === "recommendation") {
        setResult(buildRecommendation(restoredForm));
        setStep("recommendation");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (step !== "considering") return undefined;

    const recommendation = buildRecommendation({
      ...form,
      eventType: selectedType || form.eventType,
    });

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "artifice-design-draft",
        JSON.stringify({
          date: form.date,
          guestCount: form.guestCount,
          eventType: selectedType || form.eventType,
          details: form.details,
          step: "considering",
        })
      );
    }

    const lineTimer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % interstitialLines.length);
    }, 650);

    const revealTimer = window.setTimeout(() => {
      setResult(recommendation);
      setStep("recommendation");
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "artifice-design-draft",
          JSON.stringify({
            date: form.date,
            guestCount: form.guestCount,
            eventType: selectedType || form.eventType,
            details: form.details,
            step: "recommendation",
          })
        );
      }
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
    const params = buildEventParams(form, selectedType);

    return `/design/custom-inquiry?${params.toString()}`;
  }, [form, selectedType]);

  const eventParams = useMemo(() => buildEventParams(form, selectedType), [form, selectedType]);
  const eventSummary = useMemo(() => {
    const pieces = [
      form.guestCount ? `${form.guestCount} guests` : "",
      selectedType || form.eventType,
      form.date,
    ].filter(Boolean);

    return pieces.length ? pieces.join(" / ") : "Your event details";
  }, [form, selectedType]);

  function experienceHref(slug) {
    const params = eventParams.toString();
    return `/design/${mapSlug(slug)}${params ? `?${params}` : ""}`;
  }

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
          <div className={styles.intakeEditorial}>
            <div className={styles.intakeCopy}>
              <p className={styles.eyebrow}>Begin</p>
              <h1 className={styles.title}>Start with the event.</h1>
              <p className={styles.subtext}>Share the shape of the room. I’ll guide the experience from there.</p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Event Date</span>
                <input type="text" name="date" value={form.date} onChange={handleChange} placeholder="August 30, 2026" />
              </label>

              <label className={styles.field}>
                <span>Guest Count</span>
                <input type="number" min="1" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="80" />
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
          <div className={styles.recommendationIntro}>
            <p className={styles.eyebrow}>Recommendation</p>
            <h1 className={styles.title}>Your event, thoughtfully considered.</h1>
            <p className={styles.subtext}>Based on what you shared, this is where I would begin.</p>
            <p className={styles.eventSummary}>{eventSummary}</p>
          </div>

          <div className={styles.recommendationEditorial}>
            <div className={styles.recommendationRule} aria-hidden="true" />
            <article className={styles.primaryRecommendation}>
              <p className={styles.cardEyebrow}>{recommendationLabel}</p>
              <h2>{result.primary.name}</h2>
              <p className={styles.primaryStatement}>{result.primary.feeling}</p>
              <div className={styles.recommendationNotes}>
                <p>
                  <span>Why this direction</span>
                  {recommendationNotes[result.primary.slug] || result.primary.why}
                </p>
              </div>
              <Link href={experienceHref(result.primary.slug)} className={styles.primaryAction}>
                Explore {result.primary.name}
              </Link>
            </article>

            <aside className={styles.alternateEditorial}>
              <p className={styles.cardEyebrow}>Other Directions</p>
              {result.alternatives.map((experience) => (
                <article key={experience.slug} className={styles.alternateRow}>
                  <h3>{experience.name}</h3>
                  <p>{experience.why}</p>
                  <Link href={experienceHref(experience.slug)} className={styles.secondaryAction}>
                    Explore
                  </Link>
                </article>
              ))}
            </aside>
          </div>

          <div className={styles.customPrompt}>
            <div>
              <p className={styles.customPromptLabel}>Need something outside these paths?</p>
              <p className={styles.customPromptCopy}>
                Your event details will carry forward. You will not need to start over.
              </p>
            </div>
            <Link href={inquiryHref} className={styles.secondaryAction}>
              Custom Inquiry
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
