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
        const baseDuration = 0.98 + index * 0.04;
        const lineOffset = index * 0.16;
        const washRef = washRefs.current[index];

        timeline.fromTo(
          line,
          {
            autoAlpha: 0,
            x: -18,
            y: 10,
            clipPath: "inset(0 100% 0 0)",
            filter: "blur(10px)",
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            filter: "blur(0px)",
            duration: baseDuration,
            ease: "power3.out",
          },
          lineOffset
        );

        timeline.fromTo(
          washRef,
          {
            autoAlpha: 0.88,
            xPercent: -62,
            filter: "blur(14px)",
          },
          {
            autoAlpha: 0,
            xPercent: 84,
            filter: "blur(6px)",
            duration: 0.92 + index * 0.05,
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
          />
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
