import Link from "next/link";

import styles from "./experience.module.css";

export default function ExperienceDetail({ experience }) {
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
            <p className={styles.sectionLabel}>Why It Works</p>
            <h2>{experience.why}</h2>
            <p>{experience.feeling}</p>
            {isDesigned ? (
              <div className={styles.detailNotes}>
                <p>
                  This is not a standard performance selection. It is a considered structure for the evening — designed
                  around timing, guest flow, and the moments that matter most.
                </p>
                <p>{experience.depthIntro}</p>
              </div>
            ) : (
              <div className={styles.detailNotes}>
                <p>{experience.depthIntro}</p>
                <p>
                  Duration determines how deeply the experience can unfold — whether through shorter, high-impact moments
                  across the room or longer, more personal interactions with each group.
                </p>
              </div>
            )}
          </div>

          <div className={styles.detailCard}>
            {isDesigned ? (
              <>
                <p className={styles.cardEyebrow}>Inquiry Path</p>
                <h3>Designed around the evening, not added onto it.</h3>
                <p>
                  Rather than separate performance blocks, this path allows the experience to shape the rhythm of the
                  event itself.
                </p>
                <Link href="/#booking" className={styles.primaryAction}>
                  Design Your Experience
                </Link>
              </>
            ) : (
              <>
                <p className={styles.cardEyebrow}>Depth Options</p>
                <div className={styles.depthList}>
                  {experience.depths.map((depth) => (
                    <article key={depth.name} className={styles.depthItem}>
                      <div>
                        <h3>{depth.name}</h3>
                        <p>{depth.descriptor}</p>
                      </div>
                      <div className={styles.depthMeta}>
                        <span>{depth.duration}</span>
                        <strong>{depth.price}</strong>
                      </div>
                    </article>
                  ))}
                </div>
                <button type="button" className={styles.primaryAction} disabled>
                  Secure Your Date
                </button>
                <p className={styles.placeholderNote}>Phase 1 prototype. Booking unlocks in the next phase.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.detailFooter}>
          <Link href="/experience" className={styles.secondaryAction}>
            Back to Recommendation Flow
          </Link>
          <Link href="/#booking" className={styles.secondaryAction}>
            Prefer a Custom Inquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
