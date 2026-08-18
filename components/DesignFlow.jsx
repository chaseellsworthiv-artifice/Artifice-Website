"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { buildRecommendation, getPublicSlug } from "./experience-data";
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
  const [selectedExperienceSlug, setSelectedExperienceSlug] = useState("");
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
        const restoredResult = buildRecommendation(restoredForm);
        const availableSlugs = [restoredResult.primary, ...restoredResult.alternatives].map(
          (experience) => experience.slug
        );
        setResult(restoredResult);
        setSelectedExperienceSlug(
          availableSlugs.includes(draft.selectedExperienceSlug)
            ? draft.selectedExperienceSlug
            : restoredResult.primary.slug
        );
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
      setSelectedExperienceSlug(recommendation.primary.slug);
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
            selectedExperienceSlug: recommendation.primary.slug,
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
    return "My Recommendation";
  }, [result]);

  const inquiryHref = useMemo(() => {
    const params = buildEventParams(form, selectedType);

    return `/design/custom-inquiry?${params.toString()}`;
  }, [form, selectedType]);

  const eventParams = useMemo(() => buildEventParams(form, selectedType), [form, selectedType]);
  const selectedExperience = useMemo(() => {
    if (!result) return null;

    return (
      [result.primary, ...result.alternatives].find(
        (experience) => experience.slug === selectedExperienceSlug
      ) || result.primary
    );
  }, [result, selectedExperienceSlug]);
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

  function handleSelectExperience(slug) {
    setSelectedExperienceSlug(slug);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "artifice-design-draft",
        JSON.stringify({
          date: form.date,
          guestCount: form.guestCount,
          eventType: selectedType || form.eventType,
          performanceFlow: form.performanceFlow,
          details: form.details,
          selectedExperienceSlug: slug,
          step: "recommendation",
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

              <label className={`${styles.field} ${styles.fullWidth}`}>
                <span>A Few Details</span>
                <textarea
                  name="details"
                  rows="5"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Anything I should know about the room, pacing, venue, or atmosphere you want to create?"
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

            <div className={styles.recommendationSelection} role="radiogroup" aria-label="Choose an experience">
              <button
                type="button"
                role="radio"
                aria-checked={selectedExperience?.slug === result.primary.slug}
                className={`${styles.primaryRecommendation} ${
                  selectedExperience?.slug === result.primary.slug ? styles.experienceChoiceActive : ""
                }`}
                onClick={() => handleSelectExperience(result.primary.slug)}
              >
                <span className={styles.choiceKicker}>
                  <span className={styles.experienceMarker} aria-hidden="true" />
                  <span className={styles.cardEyebrow}>{recommendationLabel}</span>
                  <span className={styles.choiceState}>
                    {selectedExperience?.slug === result.primary.slug ? "Selected" : "Select"}
                  </span>
                </span>
                <span className={styles.primaryChoiceTitle}>{result.primary.name}</span>
                <span className={styles.primaryStatement}>{result.primary.feeling}</span>
                <span className={styles.recommendationNotes}>
                  <span>
                    <span>Why this direction</span>
                    {result.reason}
                  </span>
                </span>
              </button>

              {selectedExperience?.slug === result.primary.slug ? (
                <div className={`${styles.selectionContinue} ${styles.primaryChoiceContinue}`}>
                  <span className={styles.selectionConfirmation}>
                    <span>Selected Experience</span>
                    <strong>{result.primary.name}</strong>
                  </span>
                  <Link href={experienceHref(result.primary.slug)} className={styles.primaryAction}>
                    Continue with {result.primary.name}
                  </Link>
                </div>
              ) : null}

              <div className={styles.alternateEditorial}>
                <p className={styles.cardEyebrow}>Other Directions</p>
                {result.alternatives.map((experience) => {
                  const isSelected = selectedExperience?.slug === experience.slug;

                  return (
                    <div key={experience.slug} className={styles.alternateChoice}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${styles.alternateRow} ${isSelected ? styles.experienceChoiceActive : ""}`}
                        onClick={() => handleSelectExperience(experience.slug)}
                      >
                        <span className={styles.experienceMarker} aria-hidden="true" />
                        <span className={styles.alternateCopy}>
                          <span className={styles.alternateTitle}>{experience.name}</span>
                          <span className={styles.alternateDescription}>{experience.why}</span>
                        </span>
                        <span className={styles.choiceState}>{isSelected ? "Selected" : "Select"}</span>
                      </button>
                      {isSelected ? (
                        <div className={`${styles.selectionContinue} ${styles.alternateChoiceContinue}`}>
                          <span className={styles.selectionConfirmation}>
                            <span>Selected Experience</span>
                            <strong>{experience.name}</strong>
                          </span>
                          <Link href={experienceHref(experience.slug)} className={styles.primaryAction}>
                            Continue with {experience.name}
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.customPrompt}>
            <div>
              <p className={styles.customPromptLabel}>Need something more specific?</p>
              <p className={styles.customPromptCopy}>
                Your event details will carry forward. You will not need to start over.
              </p>
            </div>
            <Link href={inquiryHref} className={styles.secondaryAction}>
              Custom Request
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
