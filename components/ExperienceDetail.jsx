import Link from "next/link";

import { durationSupportLine, getPublicSlug } from "./experience-data";
import styles from "./experience.module.css";

function appendEventContext(params, eventContext = {}) {
  Object.entries(eventContext).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
}

function inquiryHref({ experience, selectedDepth, eventContext }) {
  const params = new URLSearchParams({
    experience: experience.name,
    experienceSlug: experience.slug,
  });

  appendEventContext(params, eventContext);

  if (selectedDepth) {
    params.set("depth", selectedDepth.name);
    params.set("depthId", selectedDepth.id);
    params.set("duration", selectedDepth.duration);
    params.set("price", selectedDepth.price);
  }

  return `/design/custom-inquiry?${params.toString()}`;
}

function detailHref({ basePath, experience, depth, eventContext }) {
  const params = new URLSearchParams();
  appendEventContext(params, eventContext);
  if (depth) params.set("depth", depth.id);

  const slug = getPublicSlug(experience.slug);
  const query = params.toString();

  return `${basePath}/${slug}${query ? `?${query}` : ""}`;
}

export default function ExperienceDetail({ experience, selectedDepth, basePath = "/experience", eventContext = {} }) {
  const isDesigned = experience.slug === "designed";

  return (
    <main className={styles.page}>
      <section className={styles.detailHero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>{experience.eyebrow}</p>
          <h1 className={styles.title}>{experience.name}</h1>
          <p className={styles.intro}>{experience.summary}</p>
          <div className={styles.heroActions}>
            <Link href={inquiryHref({ experience, selectedDepth, eventContext })} className={styles.primaryAction}>
              Request This Experience
            </Link>
          </div>
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
                <Link href={inquiryHref({ experience, eventContext })} className={styles.primaryAction}>
                  Custom Inquiry
                </Link>
              </>
            ) : (
              <>
                <p className={styles.cardEyebrow}>Depth</p>
                <h3>Choose how deeply it should unfold.</h3>
                <div className={styles.depthList}>
                  {experience.depths.map((depth) => {
                    const isActive = selectedDepth?.id === depth.id;
                    return (
                      <Link
                        key={depth.id}
                        href={detailHref({ basePath, experience, depth, eventContext })}
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
                    <p className={styles.selectionLabel}>Current Selection</p>
                    <h3>
                      {selectedDepth.name} <span>{selectedDepth.price}</span>
                    </h3>
                    <p>{selectedDepth.note} {selectedDepth.duration}.</p>
                  </div>
                ) : (
                  <p className={styles.selectionPrompt}>
                    Select a depth to carry that preference into the request.
                  </p>
                )}

                <Link href={inquiryHref({ experience, selectedDepth, eventContext })} className={styles.primaryAction}>
                  Request This Experience
                </Link>
                <p className={styles.placeholderNote}>
                  I’ll review the event first. If the date is available, I’ll send the next step personally.
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href={basePath} className={styles.secondaryAction}>
            Back to Recommendation
          </Link>
        </div>
      </section>
    </main>
  );
}
