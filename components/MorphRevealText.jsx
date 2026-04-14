"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function MorphRevealText({
  as: Tag = "h1",
  lines,
  className = "",
  lineClassName = "",
  triggerRef,
  start = "top 76%",
}) {
  const rootRef = useRef(null);
  const lineRefs = useRef([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      const entries = lineRefs.current.filter(Boolean);

      entries.forEach((entry) => {
        const finalText = entry.querySelector(`.${styles.textFinal}`);
        const scanText = entry.querySelector(`.${styles.textScan}`);
        const auraText = entry.querySelector(`.${styles.textAura}`);

        if (hasPlayedRef.current) {
          gsap.set(entry, { "--scan-x": "145%", "--aura-x": "125%" });
          gsap.set([scanText, auraText], { opacity: 0 });
          gsap.set(finalText, { opacity: 1, filter: "blur(0px)", y: 0 });
          return;
        }

        gsap.set(entry, { "--scan-x": "-42%", "--aura-x": "-62%" });
        gsap.set(finalText, { opacity: 0, filter: "blur(5px)", y: 3 });
        gsap.set(scanText, { opacity: 0, filter: "blur(1.6px)" });
        gsap.set(auraText, { opacity: 0, filter: "blur(7px)" });
      });

      const timeline = gsap.timeline({ paused: true });

      entries.forEach((entry) => {
        const finalText = entry.querySelector(`.${styles.textFinal}`);
        const scanText = entry.querySelector(`.${styles.textScan}`);
        const auraText = entry.querySelector(`.${styles.textAura}`);

        timeline.to(
          finalText,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1.68,
            ease: "power1.out",
          },
          0.18
        );

        timeline.to(
          auraText,
          {
            opacity: 0.42,
            duration: 0.28,
            ease: "sine.out",
          },
          0
        );

        timeline.to(
          scanText,
          {
            opacity: 0.58,
            duration: 0.34,
            ease: "sine.out",
          },
          0.08
        );

        timeline.to(
          entry,
          {
            "--aura-x": "126%",
            duration: 1.72,
            ease: "sine.inOut",
          },
          0.02
        );

        timeline.to(
          entry,
          {
            "--scan-x": "142%",
            duration: 1.48,
            ease: "sine.inOut",
          },
          0.12
        );

        timeline.to(
          scanText,
          {
            opacity: 0,
            filter: "blur(4px)",
            duration: 0.72,
            ease: "sine.out",
          },
          1.08
        );

        timeline.to(
          auraText,
          {
            opacity: 0,
            duration: 0.84,
            ease: "sine.out",
          },
          1.14
        );

        timeline.set([scanText, auraText], { opacity: 0 }, 2.06);
        timeline.set(finalText, { opacity: 1, filter: "blur(0px)", y: 0 }, 2.06);
      });

      ScrollTrigger.create({
        trigger,
        start,
        once: true,
        onEnter: () => {
          if (hasPlayedRef.current) return;
          hasPlayedRef.current = true;
          timeline.play(0);
        },
      });
    }, rootRef);

    return () => context.revert();
  }, [lines, start, triggerRef]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <Tag ref={rootRef} className={rootClassName}>
      {lines.map((line, index) => {
        const layerClassName = lineClassName ? `${styles.textLayer} ${lineClassName}` : styles.textLayer;

        return (
          <span
            key={`${line}-${index}`}
            ref={(node) => {
              lineRefs.current[index] = node;
            }}
            className={styles.lineMask}
          >
            <span className={lineClassName ? `${styles.lineMeasure} ${lineClassName}` : styles.lineMeasure} aria-hidden="true">
              {line}
            </span>
            <span className={`${layerClassName} ${styles.textAura}`} aria-hidden="true">
              {line}
            </span>
            <span className={`${layerClassName} ${styles.textScan}`} aria-hidden="true">
              {line}
            </span>
            <span className={`${layerClassName} ${styles.textFinal}`}>{line}</span>
          </span>
        );
      })}
    </Tag>
  );
}
