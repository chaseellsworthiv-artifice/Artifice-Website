"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildRecommendation } from "./experience-data";
import styles from "./experience.module.css";

const initialForm = {
  date: "",
  guestCount: "",
  eventType: "",
  details: "",
};

export default function ExperienceFlow() {
  const [started, setStarted] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);

  const dominantLabel = useMemo(() => {
    if (!result) return "";
    return result.primary.slug === "roaming" ? "Recommended For Your Event" : "Where I Would Begin";
  }, [result]);

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setResult(buildRecommendation(form));
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Design Your Experience</p>
          <h1 className={styles.title}>A guided recommendation for the shape of your event.</h1>
          <p className={styles.intro}>
            This is not a package grid. Share a few details, and the site will return where I would begin.
          </p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryAction} onClick={() => setStarted(true)}>
              Design Your Experience
            </button>
            <Link href="/#booking" className={styles.secondaryAction}>
              Custom Inquiry
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.stage}>
        <div className={styles.intakeWrap}>
          <div className={styles.intakeCopy}>
            <p className={styles.sectionLabel}>Consultation</p>
            <h2>Tell me just enough to recommend the strongest direction.</h2>
            <p>
              The goal is not to make you sort through packages. It is to place the right format in front of you first.
            </p>
          </div>

          <form className={`${styles.intakeCard} ${started ? styles.intakeCardActive : ""}`} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Event Date</span>
              <input type="text" name="date" value={form.date} onChange={handleChange} placeholder="August 30, 2026" />
            </label>
            <label className={styles.field}>
              <span>Guest Count</span>
              <input type="number" min="1" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="80" required />
            </label>
            <label className={styles.field}>
              <span>Event Type</span>
              <input type="text" name="eventType" value={form.eventType} onChange={handleChange} placeholder="Cocktail reception" />
            </label>
            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Event Details</span>
              <textarea name="details" rows="5" value={form.details} onChange={handleChange} placeholder="Briefly describe the room, flow, or atmosphere you want to create." />
            </label>
            <button type="submit" className={styles.primaryAction}>
              Continue
            </button>
          </form>
        </div>
      </section>

      {result ? (
        <section className={styles.results}>
          <div className={styles.resultsHeading}>
            <p className={styles.sectionLabel}>Recommendation</p>
            <h2>Your Event, Thoughtfully Considered</h2>
            <p>Based on what you shared, here is where I would begin.</p>
          </div>

          <div className={styles.recommendationGrid}>
            <article className={`${styles.recommendationCard} ${styles.primaryCard}`}>
              <p className={styles.cardEyebrow}>{dominantLabel}</p>
              <h3>{result.primary.name}</h3>
              <div className={styles.cardBody}>
                <p>
                  <strong>Why this fits</strong>
                  <span>{result.reason}</span>
                </p>
                <p>
                  <strong>What it feels like</strong>
                  <span>{result.primary.feeling}</span>
                </p>
              </div>
              <Link href={`/experience/${result.primary.slug}`} className={styles.cardAction}>
                View Experience
              </Link>
            </article>

            <div className={styles.alternativeColumn}>
              {result.alternatives.map((experience) => (
                <article key={experience.slug} className={styles.recommendationCard}>
                  <h3>{experience.name}</h3>
                  <p className={styles.cardSummary}>{experience.why}</p>
                  <p className={styles.cardSummaryAlt}>{experience.feeling}</p>
                  <Link href={`/experience/${experience.slug}`} className={styles.cardAction}>
                    View Experience
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <article className={styles.designedCard}>
            <div>
              <p className={styles.cardEyebrow}>Custom Path</p>
              <h3>{result.designed.name}</h3>
              <p>{result.designed.summary}</p>
              <p>{result.designed.feeling}</p>
            </div>
            <Link href="/experience/designed" className={styles.secondaryAction}>
              Explore This Experience
            </Link>
          </article>
        </section>
      ) : null}
    </main>
  );
}
