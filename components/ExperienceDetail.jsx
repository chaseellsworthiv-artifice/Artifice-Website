import Link from "next/link";

import { durationSupportLine } from "./experience-data";
import styles from "./experience.module.css";

export default function ExperienceDetail({ experience, selectedDepth, basePath = "/experience" }) {
  const isDesigned = experience.slug === "designed";

  return (
    <main className={styles.page}>
      <section className={styles.detailHero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{experience.eyebrow}</p>
          <h1 className={styles.title}>{experience.name}</h1>
          <p className={styles.intro}>{experience.summary}</p>
        </div>
      </section>

      <section className={styles.detailStage}>
        <div className={styles.detailGrid}>
          <div className={styles.detailCopy}>
            <p className={styles.sectionLabel}>Experience</p>
            <h2>{experience.opening}</h2>
            <div className={styles.detailNotes}>
              <p>{experience.why}</p>
              <p>{experience.feeling}</p>
            </div>
            {isDesigned ? (
              <div className={styles.detailSupport}>
                <p>{experience.depthIntro}</p>
                <p>
                  Standard experiences are self-contained performance formats. Designed Experience is event structure.
                </p>
              </div>
            ) : (
              <div className={styles.detailSupport}>
                <p>{experience.depthIntro}</p>
                <p>{durationSupportLine}</p>
                {experience.audienceNote ? <p>{experience.audienceNote}</p> : null}
              </div>
            )}
          </div>

          <div className={styles.detailCard}>
            {isDesigned ? (
              <>
                <p className={styles.cardEyebrow}>Custom Inquiry</p>
                <h3>Designed around the evening, not added onto it.</h3>
                <p>
                  This path is for events where the experience should help shape the evening itself, rather than simply
                  take place inside it.
                </p>
                <p className={styles.selectionNote}>{experience.depthIntro}</p>
                <Link href="/#booking" className={styles.primaryAction}>
                  {experience.ctaLabel}
                </Link>
              </>
            ) : (
              <>
                <p className={styles.cardEyebrow}>Depth & Pricing</p>
                <div className={styles.depthList}>
                  {experience.depths.map((depth) => {
                    const isActive = selectedDepth?.id === depth.id;
                    return (
                      <Link
                        key={depth.id}
                        href={`${basePath}/${experience.slug === "designed" ? "designed-experience" : experience.slug}?depth=${depth.id}`}
                        className={`${styles.depthItem} ${isActive ? styles.depthItemActive : ""}`}
                      >
                        <div>
                          <h3>{depth.name}</h3>
                          <p>{depth.descriptor}</p>
                        </div>
                        <div className={styles.depthMeta}>
                          <span>{depth.duration}</span>
                          <strong>{depth.price}</strong>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {selectedDepth ? (
                  <div className={styles.selectionPanel}>
                    <p className={styles.selectionLabel}>Selected Depth</p>
                    <h3>
                      {selectedDepth.name} <span>{selectedDepth.price}</span>
                    </h3>
                    <p>{selectedDepth.note}</p>
                    <p>{selectedDepth.duration}</p>
                  </div>
                ) : null}

                <Link href={`${basePath}/${experience.slug === "designed" ? "designed-experience" : experience.slug}/secure?depth=${selectedDepth.id}`} className={styles.primaryAction}>
                  {experience.ctaLabel}
                </Link>
                <p className={styles.placeholderNote}>The next step confirms the event details before deposit.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href={basePath} className={styles.secondaryAction}>
            Back to Recommendation Flow
          </Link>
          <Link href="/#booking" className={styles.secondaryAction}>
            Custom Inquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
