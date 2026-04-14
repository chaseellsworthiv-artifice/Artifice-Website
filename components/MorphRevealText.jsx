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
      const lineNodes = lineRefs.current.filter(Boolean);

      if (hasPlayedRef.current) {
        gsap.set(lineNodes, {
          "--reveal-x": "118%",
          "--ghost-x": "122%",
          "--ghost-opacity": 0,
          "--final-opacity": 1,
          "--line-y": "0px",
        });
        return;
      }

      gsap.set(lineNodes, {
        "--reveal-x": "-20%",
        "--ghost-x": "-12%",
        "--ghost-opacity": 0,
        "--final-opacity": 0,
        "--line-y": "4px",
      });

      const timeline = gsap.timeline({ paused: true });

      timeline.to(
        lineNodes,
        {
          "--ghost-opacity": 0.32,
          duration: 0.24,
          ease: "sine.out",
          stagger: 0.045,
        },
        0
      );

      timeline.to(
        lineNodes,
        {
          "--ghost-x": "120%",
          duration: 1.38,
          ease: "power2.inOut",
          stagger: 0.045,
        },
        0.02
      );

      timeline.to(
        lineNodes,
        {
          "--reveal-x": "118%",
          "--line-y": "0px",
          duration: 1.36,
          ease: "power2.inOut",
          stagger: 0.045,
        },
        0.1
      );

      timeline.to(
        lineNodes,
        {
          "--final-opacity": 1,
          duration: 0.78,
          ease: "sine.out",
          stagger: 0.035,
        },
        0.52
      );

      timeline.to(
        lineNodes,
        {
          "--ghost-opacity": 0,
          duration: 0.62,
          ease: "sine.out",
          stagger: 0.025,
        },
        1.02
      );

      timeline.set(
        lineNodes,
        {
          "--reveal-x": "118%",
          "--ghost-x": "122%",
          "--ghost-opacity": 0,
          "--final-opacity": 1,
          "--line-y": "0px",
        },
        1.72
      );

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
      {lines.map((line, index) => (
        <span
          key={`${line}-${index}`}
          ref={(node) => {
            lineRefs.current[index] = node;
          }}
          className={styles.lineMask}
          style={{
            "--reveal-x": "-20%",
            "--ghost-x": "-12%",
            "--ghost-opacity": 0,
            "--final-opacity": 0,
            "--line-y": "4px",
          }}
        >
          <span className={lineClassName ? `${styles.lineMeasure} ${lineClassName}` : styles.lineMeasure}>{line}</span>
          <span className={lineClassName ? `${styles.lineGhost} ${lineClassName}` : styles.lineGhost} aria-hidden="true">
            {line}
          </span>
          <span className={lineClassName ? `${styles.lineReveal} ${lineClassName}` : styles.lineReveal} aria-hidden="true">
            {line}
          </span>
          <span className={lineClassName ? `${styles.lineFinal} ${lineClassName}` : styles.lineFinal} aria-hidden="true">
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
