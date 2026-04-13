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
  const shimmerRefs = useRef([]);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!rootRef.current || !lines?.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;

    const context = gsap.context(() => {
      const lineNodes = lineRefs.current.filter(Boolean);
      const shimmerNodes = shimmerRefs.current.filter(Boolean);

      if (hasPlayedRef.current) {
        gsap.set(lineNodes, { autoAlpha: 1, y: 0, filter: "blur(0px)", letterSpacing: "0em" });
        gsap.set(shimmerNodes, { autoAlpha: 0 });
        return;
      }

      gsap.set(lineNodes, {
        autoAlpha: 0,
        y: 10,
        filter: "blur(9px)",
        letterSpacing: "0.018em",
      });
      gsap.set(shimmerNodes, {
        autoAlpha: 0,
        xPercent: -18,
        scaleX: 0.72,
      });

      const timeline = gsap.timeline({ paused: true });

      timeline.to(
        shimmerNodes,
        {
          autoAlpha: 0.38,
          xPercent: 18,
          scaleX: 1.16,
          duration: 1.45,
          ease: "sine.inOut",
          stagger: 0.08,
        },
        0
      );

      timeline.to(
        lineNodes,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          letterSpacing: "0em",
          duration: 2.15,
          ease: "power2.out",
          stagger: 0.08,
        },
        0.12
      );

      timeline.to(
        shimmerNodes,
        {
          autoAlpha: 0,
          duration: 0.95,
          ease: "sine.out",
          stagger: 0.04,
        },
        1.1
      );

      timeline.set(lineNodes, { autoAlpha: 1, y: 0, filter: "blur(0px)", letterSpacing: "0em" }, 2.25);
      timeline.set(shimmerNodes, { autoAlpha: 0 }, 2.3);

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
        <span key={`${line}-${index}`} className={styles.lineMask}>
          <span
            ref={(node) => {
              lineRefs.current[index] = node;
            }}
            className={lineClassName ? `${styles.lineText} ${lineClassName}` : styles.lineText}
          >
            {line}
          </span>
          <span
            ref={(node) => {
              shimmerRefs.current[index] = node;
            }}
            className={styles.lineShimmer}
            aria-hidden="true"
          />
        </span>
      ))}
    </Tag>
  );
}
