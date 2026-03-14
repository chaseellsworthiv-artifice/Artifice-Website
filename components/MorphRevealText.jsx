"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

const lineProfiles = [
  {
    aY: "48%",
    bY: "32%",
    cY: "70%",
    dY: "52%",
  },
  {
    aY: "44%",
    bY: "66%",
    cY: "36%",
    dY: "58%",
  },
  {
    aY: "54%",
    bY: "28%",
    cY: "68%",
    dY: "44%",
  },
  {
    aY: "42%",
    bY: "70%",
    cY: "34%",
    dY: "56%",
  },
];

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

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      gsap.set(lineRefs.current, {
        "--reveal-fill": "-36%",
        "--front-a": "-42%",
        "--front-b": "-36%",
        "--front-c": "-34%",
        "--front-d": "-30%",
      });

      const timeline = gsap.timeline({ paused: true });

      lineRefs.current.forEach((lineMask, index) => {
        const lineOffset = index * 0.22;

        timeline.to(
          lineMask,
          {
            "--reveal-fill": "146%",
            duration: 1.82,
            ease: "power1.out",
          },
          lineOffset
        );

        timeline.to(
          lineMask,
          {
            "--front-a": "132%",
            duration: 1.18,
            ease: "power2.out",
          },
          lineOffset
        );

        timeline.to(
          lineMask,
          {
            "--front-b": "144%",
            duration: 1.32,
            ease: "power2.out",
          },
          lineOffset + 0.06
        );

        timeline.to(
          lineMask,
          {
            "--front-c": "154%",
            duration: 1.42,
            ease: "power2.out",
          },
          lineOffset + 0.12
        );

        timeline.to(
          lineMask,
          {
            "--front-d": "164%",
            duration: 1.5,
            ease: "power2.out",
          },
          lineOffset + 0.18
        );
      });

      ScrollTrigger.create({
        trigger,
        start,
        once: true,
        onEnter: () => timeline.play(0),
      });
    }, rootRef);

    return () => context.revert();
  }, [lines, start, triggerRef]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <Tag ref={rootRef} className={rootClassName}>
      {lines.map((line, index) => {
        const profile = lineProfiles[index % lineProfiles.length];

        return (
          <span
            key={`${line}-${index}`}
            ref={(node) => {
              lineRefs.current[index] = node;
            }}
            className={styles.lineMask}
            style={{
              "--reveal-y-a": profile.aY,
              "--reveal-y-b": profile.bY,
              "--reveal-y-c": profile.cY,
              "--reveal-y-d": profile.dY,
            }}
          >
            <span
              className={lineClassName ? `${styles.lineWash} ${lineClassName}` : styles.lineWash}
              aria-hidden="true"
            >
              {line}
            </span>
            <span className={lineClassName ? `${styles.lineBase} ${lineClassName}` : styles.lineBase}>{line}</span>
          </span>
        );
      })}
    </Tag>
  );
}
