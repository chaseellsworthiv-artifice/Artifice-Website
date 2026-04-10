import Link from "next/link";

import { durationSupportLine } from "./experience-data";
import styles from "./experience.module.css";

function inquiryHref({ experience, selectedDepth }) {
  const params = new URLSearchParams({
    experience: experience.name,
    experienceSlug: experience.slug,
  });

  if (selectedDepth) {
    params.set("depth", selectedDepth.name);
    params.set("depthId", selectedDepth.id);
    params.set("duration", selectedDepth.duration);
    params.set("price", selectedDepth.price);
  }

  return `/design/custom-inquiry?${params.toString()}`;
}

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
                <Link href={inquiryHref({ experience })} className={styles.primaryAction}>
                  Custom Inquiry
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

                <Link href={inquiryHref({ experience, selectedDepth })} className={styles.primaryAction}>
                  Request This Experience
                </Link>
                <p className={styles.placeholderNote}>
                  I’ll review the details first. If the date and fit are right, I’ll send the deposit link personally.
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href={basePath} className={styles.secondaryAction}>
            Back to Recommendation Flow
          </Link>
        </div>
      </section>
    </main>
  );
}
