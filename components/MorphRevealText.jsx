"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

const lineProfiles = [
  {
    x1: "-18%",
    y1: "48%",
    x2: "-4%",
    y2: "30%",
    x3: "10%",
    y3: "72%",
    x4: "22%",
    y4: "52%",
  },
  {
    x1: "-20%",
    y1: "44%",
    x2: "-2%",
    y2: "66%",
    x3: "12%",
    y3: "34%",
    x4: "24%",
    y4: "58%",
  },
  {
    x1: "-16%",
    y1: "54%",
    x2: "0%",
    y2: "28%",
    x3: "14%",
    y3: "68%",
    x4: "26%",
    y4: "46%",
  },
  {
    x1: "-18%",
    y1: "42%",
    x2: "2%",
    y2: "70%",
    x3: "14%",
    y3: "32%",
    x4: "28%",
    y4: "56%",
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
      gsap.set(lineRefs.current, { "--reveal-front": "-42%" });

      const timeline = gsap.timeline({ paused: true });

      lineRefs.current.forEach((lineMask, index) => {
        timeline.fromTo(
          lineMask,
          {
            "--reveal-front": "-42%",
          },
          {
            "--reveal-front": "124%",
            duration: 1.58 + index * 0.06,
            ease: "power2.out",
          },
          index * 0.16
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
              "--reveal-x-1": profile.x1,
              "--reveal-y-1": profile.y1,
              "--reveal-x-2": profile.x2,
              "--reveal-y-2": profile.y2,
              "--reveal-x-3": profile.x3,
              "--reveal-y-3": profile.y3,
              "--reveal-x-4": profile.x4,
              "--reveal-y-4": profile.y4,
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
