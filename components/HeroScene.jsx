"use client";

import { useEffect, useRef } from "react";

import styles from "./hero-experience.module.css";

export default function HeroScene() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);

    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <div className={styles.canvasWrap}>
      <div className={styles.stageBackdrop} />
      <video
        ref={videoRef}
        className={styles.heroVideo}
        autoPlay
        muted
        defaultMuted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src="/assets/video/hero-loop.mp4" type="video/mp4" />
        <source src="/assets/video/hero-loop.mov" type="video/quicktime" />
      </video>
      <div className={styles.heroVideoScrim} />
      <div className={styles.stageGlow} />
      <div className={styles.stageFloor} />
    </div>
  );
}
