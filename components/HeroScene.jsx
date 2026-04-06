"use client";

import { useEffect, useRef } from "react";

import styles from "./hero-experience.module.css";

export default function HeroScene() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hasStarted = false;
    const retryTimers = [];

    const tryPlay = () => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.controls = false;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
      video.setAttribute("disablepictureinpicture", "true");
      video.setAttribute("disableremoteplayback", "true");

      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            hasStarted = true;
          })
          .catch(() => {});
      }
    };

    const tryPlayIfNeeded = () => {
      if (hasStarted && !video.paused) return;
      tryPlay();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tryPlayIfNeeded();
      }
    };

    const recoverOnInteraction = () => {
      tryPlayIfNeeded();
    };

    video.load();
    tryPlay();

    [120, 320, 700, 1400, 2400].forEach((delay) => {
      retryTimers.push(window.setTimeout(tryPlayIfNeeded, delay));
    });

    video.addEventListener("loadedmetadata", tryPlayIfNeeded);
    video.addEventListener("loadeddata", tryPlayIfNeeded);
    video.addEventListener("canplay", tryPlayIfNeeded);
    video.addEventListener("canplaythrough", tryPlayIfNeeded);
    video.addEventListener("playing", () => {
      hasStarted = true;
    });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", tryPlayIfNeeded);
    window.addEventListener("pointerdown", recoverOnInteraction, { passive: true });
    window.addEventListener("touchstart", recoverOnInteraction, { passive: true });
    window.addEventListener("keydown", recoverOnInteraction);
    window.addEventListener("wheel", recoverOnInteraction, { passive: true });

    return () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      video.removeEventListener("loadedmetadata", tryPlayIfNeeded);
      video.removeEventListener("loadeddata", tryPlayIfNeeded);
      video.removeEventListener("canplay", tryPlayIfNeeded);
      video.removeEventListener("canplaythrough", tryPlayIfNeeded);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", tryPlayIfNeeded);
      window.removeEventListener("pointerdown", recoverOnInteraction);
      window.removeEventListener("touchstart", recoverOnInteraction);
      window.removeEventListener("keydown", recoverOnInteraction);
      window.removeEventListener("wheel", recoverOnInteraction);
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
        disableRemotePlayback
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        x-webkit-airplay="deny"
      >
        <source src="https://pub-7b17696b760543ecace3651030d99cd9.r2.dev/Artifice%20Website%20Hero%201080p.mp4" type="video/mp4" />
      </video>
      <div className={styles.heroVideoScrim} />
      <div className={styles.stageGlow} />
      <div className={styles.stageFloor} />
    </div>
  );
}
