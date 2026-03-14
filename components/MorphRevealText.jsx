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
  start = "top bottom-=6%",
  end = "top 64%",
  scrub = 0.7,
}) {
  const rootRef = useRef(null);
  const baseRefs = useRef([]);
  const washRefs = useRef([]);

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      gsap.set(baseRefs.current, {
        autoAlpha: 0.08,
        xPercent: -3.4,
        yPercent: 7,
        clipPath: "inset(0 100% 0 0)",
        filter: "blur(12px)",
      });

      gsap.set(washRefs.current, {
        autoAlpha: 0.85,
        xPercent: -140,
        yPercent: 0,
        filter: "blur(18px)",
      });

      const timeline = gsap.timeline({ paused: true });

      baseRefs.current.forEach((line, index) => {
        const baseDuration = 0.72 + index * 0.04;
        const washDuration = 0.86 + index * 0.06;
        const lineOffset = index * 0.12;
        const washRef = washRefs.current[index];

        timeline.to(
          line,
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            clipPath: "inset(0 0% 0 0)",
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
            xPercent: 120 + index * 12,
            yPercent: 0,
            filter: "blur(8px)",
            duration: washDuration,
            ease: "power2.out",
          },
          lineOffset
        );
      });

      timeline.pause(0);

      ScrollTrigger.create({
        trigger,
        start,
        end,
        scrub,
        onUpdate: (self) => {
          timeline.progress(self.progress);
        },
      });
    }, rootRef);

    return () => context.revert();
  }, [end, lines, scrub, start, triggerRef]);

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
