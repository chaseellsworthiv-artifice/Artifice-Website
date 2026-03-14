"use client";

import styles from "./hero-experience.module.css";

export default function HeroScene() {
  return (
    <div className={styles.canvasWrap}>
      <div className={styles.stageBackdrop} />
      <video
        className={styles.heroVideo}
        src="/assets/video/hero-loop.mov"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className={styles.heroVideoScrim} />
      <div className={styles.stageGlow} />
      <div className={styles.stageFloor} />
    </div>
  );
}
