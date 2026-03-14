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
  start = "top 82%",
}) {
  const rootRef = useRef(null);
  const baseRefs = useRef([]);
  const washRefs = useRef([]);

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      gsap.set(baseRefs.current, {
        autoAlpha: 0.12,
        xPercent: -4,
        yPercent: 10,
        scaleX: 0.988,
        filter: "blur(18px)",
      });

      gsap.set(washRefs.current, {
        autoAlpha: 0.92,
        xPercent: -14,
        yPercent: 2,
        filter: "blur(16px)",
        clipPath: "inset(0 100% 0 0)",
      });

      const timeline = gsap.timeline({ paused: true });

      baseRefs.current.forEach((line, index) => {
        const baseDuration = 1.22 + index * 0.06;
        const washDuration = 1.1 + index * 0.08;
        const lineOffset = index * 0.17;
        const washRef = washRefs.current[index];

        timeline.to(
          line,
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            scaleX: 1,
            filter: "blur(0px)",
            duration: baseDuration,
            ease: "power3.out",
          },
          lineOffset
        );

        timeline.to(
          washRef,
          {
            autoAlpha: 0,
            xPercent: 9 + index * 1.4,
            yPercent: 0,
            filter: "blur(6px)",
            clipPath: "inset(0 -18% 0 0)",
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
