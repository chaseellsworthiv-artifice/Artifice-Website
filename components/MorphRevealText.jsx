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
  const baseRefs = useRef([]);
  const washRefs = useRef([]);

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true });

      baseRefs.current.forEach((line, index) => {
        const baseDuration = 1.18 + index * 0.06;
        const washDuration = 1.08 + index * 0.08;
        const lineOffset = index * 0.18;
        const washRef = washRefs.current[index];

        timeline.fromTo(
          line,
          {
            x: -10,
            y: 6,
            clipPath: "inset(0 100% 0 0)",
            filter: "blur(2px)",
          },
          {
            x: 0,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            filter: "blur(0px)",
            duration: baseDuration,
            ease: "power2.out",
          },
          lineOffset
        );

        timeline.fromTo(
          washRef,
          {
            autoAlpha: 0.94,
            clipPath: "inset(0 72% 0 -8%)",
            x: -6,
            filter: "blur(8px)",
          },
          {
            autoAlpha: 0,
            clipPath: "inset(0 -8% 0 72%)",
            x: 8,
            filter: "blur(4px)",
            duration: washDuration,
            ease: "power2.out",
          },
          lineOffset + 0.02
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
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className={styles.lineMask}>
          <span
            ref={(node) => {
              washRefs.current[index] = node;
            }}
            className={styles.lineWash}
            aria-hidden="true"
          >
            {line}
          </span>
          <span
            ref={(node) => {
              baseRefs.current[index] = node;
            }}
            className={lineClassName ? `${styles.lineBase} ${lineClassName}` : styles.lineBase}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
