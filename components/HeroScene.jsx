"use client";

import styles from "./hero-experience.module.css";

export default function HeroScene() {
  return (
    <div className={styles.canvasWrap}>
      <div className={styles.stageBackdrop} />
      <div className={styles.stageGlow} />
      <div className={styles.stageFloor} />
    </div>
  );
}
