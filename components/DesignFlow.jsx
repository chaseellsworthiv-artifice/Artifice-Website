"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buildRecommendation, getPublicSlug, performanceFlowOptions } from "./experience-data";
import styles from "./design.module.css";

const initialForm = {
  date: "",
  guestCount: "",
  eventType: "",
  performanceFlow: "",
  details: "",
};

const eventTypes = ["Wedding", "Corporate", "Private Event", "Other"];

function mapSlug(slug) {
  return getPublicSlug(slug);
}

function buildEventParams(form, selectedType) {
  const params = new URLSearchParams();
  const eventType = selectedType || form.eventType;

  if (form.date) params.set("date", form.date);
  if (form.guestCount) params.set("guestCount", form.guestCount);
  if (eventType) params.set("eventType", eventType);
  if (form.performanceFlow) params.set("performanceFlow", form.performanceFlow);
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
        performanceFlow: draft.performanceFlow || "",
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
          performanceFlow: form.performanceFlow,
          details: form.details,
          step: "considering",
        })
      );
    }

    const firstBeat = window.setTimeout(() => {
      setLineIndex(1);
    }, 880);

    const secondBeat = window.setTimeout(() => {
      setLineIndex(2);
    }, 1820);

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
            performanceFlow: form.performanceFlow,
            details: form.details,
            step: "recommendation",
          })
        );
      }
    }, 2850);

    return () => {
      window.clearTimeout(firstBeat);
      window.clearTimeout(secondBeat);
      window.clearTimeout(revealTimer);
    };
  }, [form, selectedType, step]);

  const recommendationLabel = useMemo(() => {
    if (!result) return "";
    return "Where I Would Begin";
  }, [result]);

  const inquiryHref = useMemo(() => {
    const params = buildEventParams(form, selectedType);

    return `/design/custom-inquiry?${params.toString()}`;
  }, [form, selectedType]);

  const eventParams = useMemo(() => buildEventParams(form, selectedType), [form, selectedType]);
  const consideringRecommendation = useMemo(
    () =>
      buildRecommendation({
        ...form,
        eventType: selectedType || form.eventType,
      }),
    [form, selectedType]
  );
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
          performanceFlow: form.performanceFlow,
          details: form.details,
        })
      );
    }

    setLineIndex(0);
    setStep("considering");
  }

  function handleAdjustDetails() {
    setStep("intake");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "artifice-design-draft",
        JSON.stringify({
          date: form.date,
          guestCount: form.guestCount,
          eventType: selectedType || form.eventType,
          performanceFlow: form.performanceFlow,
          details: form.details,
          step: "intake",
        })
      );
    }
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

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span>Choose how the room should experience it.</span>
                <div className={styles.flowOptions}>
                  {performanceFlowOptions.map((option) => {
                    const active = form.performanceFlow === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`${styles.flowOption} ${active ? styles.flowOptionActive : ""}`}
                        onClick={() => setForm((current) => ({ ...current, performanceFlow: option.id }))}
                        aria-pressed={active}
                      >
                        <span className={styles.flowIndicator} aria-hidden="true" />
                        <strong>{option.label}</strong>
                        <small>{option.summary}</small>
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
            <div className={styles.consideringLead}>
              <p className={styles.eyebrow}>Composing The Recommendation</p>
              <div className={styles.consideringRule} aria-hidden="true">
                <span />
                <span />
              </div>
              <div className={styles.consideringSigils} aria-hidden="true">
                <svg viewBox="0 0 340 220" className={styles.consideringSigilSvg}>
                  <path
                    d="M28 136 C48 92, 86 86, 112 114"
                    className={`${styles.sigilFragment} ${styles.sigilFragmentOne} ${
                      lineIndex >= 0 ? styles.sigilFragmentActive : ""
                    } ${lineIndex >= 1 ? styles.sigilFragmentDrift : ""}`}
                  />
                  <path
                    d="M146 158 L176 122 L208 156"
                    className={`${styles.sigilFragment} ${styles.sigilFragmentTwo} ${
                      lineIndex >= 1 ? styles.sigilFragmentActive : ""
                    } ${lineIndex >= 2 ? styles.sigilFragmentDrift : ""}`}
                  />
                  <path
                    d="M228 120 C248 90, 286 88, 308 122"
                    className={`${styles.sigilFragment} ${styles.sigilFragmentThree} ${
                      lineIndex >= 2 ? styles.sigilFragmentActive : ""
                    }`}
                  />
                </svg>
              </div>
              <div className={styles.consideringStory}>
                <p
                  className={`${styles.consideringThought} ${lineIndex >= 0 ? styles.consideringThoughtActive : ""} ${
                    lineIndex >= 2 ? styles.consideringThoughtRecede : ""
                  }`}
                >
                  Every room asks differently.
                </p>
                <p className={`${styles.consideringWhisper} ${lineIndex >= 1 ? styles.consideringWhisperActive : ""}`}>
                  The room decides the shape of it.
                </p>
                <p className={`${styles.consideringVerdict} ${lineIndex >= 2 ? styles.consideringVerdictActive : ""}`}>
                  I would begin with {consideringRecommendation.primary.name}.
                </p>
              </div>
            </div>
            <p className={styles.consideringMeta}>{eventSummary}</p>
          </div>
        </section>
      ) : null}

      {step === "recommendation" && result ? (
        <section className={styles.recommendationShell}>
          <div className={styles.recommendationFrame}>
            <div className={styles.recommendationIntro}>
              <p className={styles.eyebrow}>Recommendation</p>
              <h1 className={styles.title}>Your event, thoughtfully considered.</h1>
              <p className={styles.subtext}>Based on what you shared, this is where I would begin.</p>
              <div className={styles.eventSummaryGroup}>
                <p className={styles.eventSummary}>{eventSummary}</p>
                <button type="button" className={styles.detailAction} onClick={handleAdjustDetails}>
                  Edit Details
                </button>
              </div>
            </div>

            <article className={styles.primaryRecommendation}>
              <p className={styles.cardEyebrow}>{recommendationLabel}</p>
              <h2>{result.primary.name}</h2>
              <p className={styles.primaryStatement}>{result.primary.feeling}</p>
              <div className={styles.recommendationNotes}>
                <p>
                  <span>Why this direction</span>
                  {result.reason}
                </p>
              </div>
              <Link href={experienceHref(result.primary.slug)} className={styles.primaryAction}>
                Explore {result.primary.name}
              </Link>
            </article>
          </div>

          <aside className={styles.alternateEditorial}>
            <p className={styles.cardEyebrow}>Other Directions</p>
            {result.alternatives.map((experience) => (
              <article key={experience.slug} className={styles.alternateRow}>
                <div>
                  <h3>{experience.name}</h3>
                  <p>{experience.why}</p>
                </div>
                <Link href={experienceHref(experience.slug)} className={styles.secondaryAction}>
                  Explore
                </Link>
              </article>
            ))}
          </aside>

          <div className={styles.customPrompt}>
            <div>
              <p className={styles.customPromptLabel}>Need something more specific?</p>
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
