"use client";

import { useEffect, useRef } from "react";

import styles from "./hero-experience.module.css";

export default function HeroScene() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hasStarted = false;
    let hasBeenCued = false;

    const tryPlay = () => {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.autoplay = false;
      video.controls = false;
      video.setAttribute("muted", "");
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
      if (!hasBeenCued) return;
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

    const cueVideo = () => {
      hasBeenCued = true;
      try {
        video.currentTime = 0;
      } catch {
        // Some browsers can reject seeking before metadata is ready; playback recovery below still handles it.
      }
      tryPlay();
    };

    const resetToStart = () => {
      if (hasBeenCued) return;
      try {
        video.currentTime = 0;
      } catch {
        // The cue will reset again once the curtain reaches the reveal point.
      }
      video.pause();
    };

    const onPlaying = () => {
      hasStarted = true;
    };

    video.load();
    video.pause();

    window.addEventListener("artifice:hero-video-cue", cueVideo);
    video.addEventListener("loadedmetadata", resetToStart);
    video.addEventListener("loadeddata", resetToStart);
    video.addEventListener("canplay", resetToStart);
    video.addEventListener("canplaythrough", tryPlayIfNeeded);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", tryPlayIfNeeded);
    window.addEventListener("pointerdown", recoverOnInteraction, { passive: true });
    window.addEventListener("touchstart", recoverOnInteraction, { passive: true });
    window.addEventListener("keydown", recoverOnInteraction);
    window.addEventListener("wheel", recoverOnInteraction, { passive: true });

    return () => {
      window.removeEventListener("artifice:hero-video-cue", cueVideo);
      video.removeEventListener("loadedmetadata", resetToStart);
      video.removeEventListener("loadeddata", resetToStart);
      video.removeEventListener("canplay", resetToStart);
      video.removeEventListener("canplaythrough", tryPlayIfNeeded);
      video.removeEventListener("playing", onPlaying);
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
        muted
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
