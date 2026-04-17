"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createProfile(lineIndex) {
  const rand = seeded(4219 + lineIndex * 193);

  return {
    lineOffset: lineIndex * 0.34,
    maskCenter: {
      x: 0.18 + rand() * 0.18,
      y: 0.18 + rand() * 0.16,
    },
    fadeCenter: {
      x: -0.06 + rand() * 0.12,
      y: 0.58 + rand() * 0.16,
    },
    thicknessCenter: {
      x: -0.02 + rand() * 0.1,
      y: 0.42 + rand() * 0.16,
    },
    atmosphereDelay: 0.08 + rand() * 0.08,
    finalDelay: 1.18 + rand() * 0.08,
  };
}

function measureLine(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const computed = window.getComputedStyle(node);
  const fontSize = parseFloat(computed.fontSize);
  const extraWidth = Math.max(92, Math.ceil(fontSize * 1.18));
  const extraHeight = Math.max(16, Math.ceil(fontSize * 0.18));

  return {
    width: Math.ceil(rect.width) + extraWidth,
    height: Math.ceil(rect.height) + extraHeight,
    fontFamily: computed.fontFamily,
    fontSize,
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
  };
}

function ensureEntry(entries, index) {
  const existing = entries.current[index];
  if (existing) return existing;
  const created = {
    svgRoot: null,
    finalText: null,
    atmosphereText: null,
    softText: null,
    maskGate: null,
    maskFade: null,
    maskWeight: null,
    displacement: null,
    softBlur: null,
  };
  entries.current[index] = created;
  return created;
}

export default function MorphRevealText({
  as: Tag = "h1",
  lines,
  className = "",
  lineClassName = "",
  triggerRef,
  start = "top 76%",
  revealDelay = 0,
}) {
  const rootRef = useRef(null);
  const measureRefs = useRef([]);
  const lineAnimRefs = useRef([]);
  const hasPlayedRef = useRef(false);
  const [metrics, setMetrics] = useState([]);
  const idPrefix = useId().replace(/:/g, "");

  useEffect(() => {
    if (!lines?.length) return undefined;

    const updateMetrics = () => {
      if (hasPlayedRef.current) return;
      setMetrics(measureRefs.current.map((node) => measureLine(node)).filter(Boolean));
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    measureRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    window.addEventListener("resize", updateMetrics, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [lines]);

  useEffect(() => {
    if (!rootRef.current || !lines?.length || metrics.length !== lines.length) return undefined;

    const trigger = triggerRef?.current || rootRef.current;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      lineAnimRefs.current.forEach((entry) => {
        if (!entry?.svgRoot || !entry?.finalText) return;

        if (hasPlayedRef.current || prefersReduced) {
          gsap.set(entry.svgRoot, { opacity: 1 });
          gsap.set(entry.finalText, { opacity: 1, filter: "blur(0px)" });
          gsap.set([entry.atmosphereText, entry.softText], { opacity: 0 });
          return;
        }

        gsap.set(entry.svgRoot, { opacity: 0 });
        gsap.set(entry.finalText, { opacity: 0, filter: "blur(1.4px)" });
        gsap.set(entry.atmosphereText, { opacity: 0, filter: "blur(1.8px)" });
        gsap.set(entry.softText, { opacity: 0, filter: "blur(4px)" });
      });

      const timeline = gsap.timeline({ paused: true });

      lineAnimRefs.current.forEach((entry, index) => {
        if (!entry?.svgRoot || !entry?.finalText || !entry?.maskGate) return;

        const metric = metrics[index];
        const profile = createProfile(index);
        const gateMax = Math.max(metric.width, metric.height) * 1.28;
        const fadeMax = Math.max(metric.width, metric.height) * 1.7;
        const weightMax = Math.max(metric.width, metric.height) * 1.08;
        const base = profile.lineOffset;

        gsap.set(entry.maskGate, {
          attr: {
            cx: metric.width * profile.maskCenter.x,
            cy: metric.height * profile.maskCenter.y,
            rx: metric.width * 0.015,
            ry: metric.height * 0.035,
          },
        });
        gsap.set(entry.maskFade, {
          attr: {
            cx: metric.width * profile.fadeCenter.x,
            cy: metric.height * profile.fadeCenter.y,
            rx: metric.width * 0.02,
            ry: metric.height * 0.08,
          },
        });
        gsap.set(entry.maskWeight, {
          attr: {
            cx: metric.width * profile.thicknessCenter.x,
            cy: metric.height * profile.thicknessCenter.y,
            rx: metric.width * 0.01,
            ry: metric.height * 0.05,
          },
        });
        gsap.set(entry.displacement, { attr: { scale: metric.fontSize * 0.08 } });
        gsap.set(entry.softBlur, { attr: { stdDeviation: metric.fontSize * 0.095 } });

        timeline.set(entry.svgRoot, { opacity: 1 }, base);

        timeline.to(
          entry.maskGate,
          {
            attr: { rx: gateMax, ry: gateMax * 0.55 },
            duration: 3.45,
            ease: "power3.out",
          },
          base
        );

        timeline.to(
          entry.maskFade,
          {
            attr: { rx: fadeMax, ry: fadeMax * 0.42 },
            duration: 3.9,
            ease: "power2.out",
          },
          base + 0.06
        );

        timeline.to(
          entry.maskWeight,
          {
            attr: { rx: weightMax, ry: weightMax * 0.5 },
            duration: 3.15,
            ease: "power2.out",
          },
          base + 0.1
        );

        timeline.to(
          entry.atmosphereText,
          {
            opacity: 0.4,
            filter: "blur(0.9px)",
            duration: 1.35,
            ease: "sine.out",
          },
          base + profile.atmosphereDelay
        );

        timeline.to(
          entry.softText,
          {
            opacity: 0.18,
            filter: "blur(1.6px)",
            duration: 1.7,
            ease: "sine.out",
          },
          base + 0.22
        );

        timeline.to(
          entry.displacement,
          {
            attr: { scale: 0 },
            duration: 2.6,
            ease: "power2.out",
          },
          base + 0.28
        );

        timeline.to(
          entry.softBlur,
          {
            attr: { stdDeviation: metric.fontSize * 0.015 },
            duration: 2.25,
            ease: "sine.out",
          },
          base + 0.36
        );

        timeline.to(
          entry.finalText,
          {
            opacity: 1,
            filter: "blur(0px)",
            duration: 2.2,
            ease: "sine.out",
          },
          base + profile.finalDelay
        );

        timeline.to(
          [entry.atmosphereText, entry.softText],
          {
            opacity: 0,
            duration: 0.95,
            ease: "sine.inOut",
          },
          base + 2.72
        );
      });

      ScrollTrigger.create({
        trigger,
        start,
        once: true,
        onEnter: () => {
          if (hasPlayedRef.current) return;
          hasPlayedRef.current = true;
          if (prefersReduced) return;
          timeline.delay(revealDelay).play(0);
        },
      });
    }, rootRef);

    return () => context.revert();
  }, [lines, metrics, revealDelay, start, triggerRef]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <Tag ref={rootRef} className={rootClassName}>
      {lines.map((line, index) => {
        const metric = metrics[index];
        const profile = createProfile(index);
        const clipId = `${idPrefix}-clip-${index}`;
        const softMaskId = `${idPrefix}-soft-mask-${index}`;
        const weightMaskId = `${idPrefix}-weight-mask-${index}`;
        const noiseId = `${idPrefix}-noise-${index}`;
        const blurId = `${idPrefix}-soft-blur-${index}`;
        const entry = ensureEntry(lineAnimRefs, index);

        return (
          <span key={`${line}-${index}`} className={styles.lineMask}>
            <span
              ref={(node) => {
                measureRefs.current[index] = node;
              }}
              className={lineClassName ? `${styles.lineMeasure} ${lineClassName}` : styles.lineMeasure}
              aria-hidden="true"
            >
              {line}
            </span>
            {metric ? (
              <svg
                ref={(node) => {
                  entry.svgRoot = node;
                }}
                className={styles.lineSvg}
                viewBox={`0 0 ${metric.width} ${metric.height}`}
                width={metric.width}
                height={metric.height}
                aria-hidden="true"
                preserveAspectRatio="xMinYMin meet"
              >
                <defs>
                  <filter id={noiseId} x="-20%" y="-60%" width="150%" height="240%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.018 0.045" numOctaves="3" seed={13 + index * 17} result="noise" />
                    <feDisplacementMap
                      ref={(node) => {
                        entry.displacement = node;
                      }}
                      in="SourceGraphic"
                      in2="noise"
                      scale="0"
                      xChannelSelector="R"
                      yChannelSelector="G"
                    />
                  </filter>
                  <filter id={blurId} x="-28%" y="-90%" width="180%" height="300%">
                    <feGaussianBlur
                      ref={(node) => {
                        entry.softBlur = node;
                      }}
                      stdDeviation="0"
                    />
                  </filter>
                  <mask id={softMaskId} maskUnits="userSpaceOnUse">
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <ellipse
                      ref={(node) => {
                        entry.maskFade = node;
                      }}
                      cx={metric.width * profile.fadeCenter.x}
                      cy={metric.height * profile.fadeCenter.y}
                      rx="0"
                      ry="0"
                      fill="white"
                      filter={`url(#${blurId})`}
                    />
                  </mask>
                  <mask id={weightMaskId} maskUnits="userSpaceOnUse">
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <ellipse
                      ref={(node) => {
                        entry.maskWeight = node;
                      }}
                      cx={metric.width * profile.thicknessCenter.x}
                      cy={metric.height * profile.thicknessCenter.y}
                      rx="0"
                      ry="0"
                      fill="white"
                      filter={`url(#${blurId})`}
                    />
                  </mask>
                  <clipPath id={clipId}>
                    <ellipse
                      ref={(node) => {
                        entry.maskGate = node;
                      }}
                      cx={metric.width * profile.maskCenter.x}
                      cy={metric.height * profile.maskCenter.y}
                      rx="0"
                      ry="0"
                    />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId})`}>
                  <text
                    ref={(node) => {
                      entry.softText = node;
                    }}
                    className={styles.svgTextSoft}
                    x="0"
                    y={metric.fontSize * 0.08}
                    dominantBaseline="hanging"
                    fontFamily={metric.fontFamily}
                    fontSize={metric.fontSize}
                    fontWeight={metric.fontWeight}
                    letterSpacing={metric.letterSpacing}
                    mask={`url(#${softMaskId})`}
                    filter={`url(#${noiseId})`}
                  >
                    {line}
                  </text>
                  <text
                    ref={(node) => {
                      entry.atmosphereText = node;
                    }}
                    className={styles.svgTextAtmosphere}
                    x="0"
                    y={metric.fontSize * 0.08}
                    dominantBaseline="hanging"
                    fontFamily={metric.fontFamily}
                    fontSize={metric.fontSize}
                    fontWeight={metric.fontWeight}
                    letterSpacing={metric.letterSpacing}
                    mask={`url(#${weightMaskId})`}
                    filter={`url(#${noiseId})`}
                  >
                    {line}
                  </text>
                  <text
                    ref={(node) => {
                      entry.finalText = node;
                    }}
                    className={styles.svgTextFinal}
                    x="0"
                    y={metric.fontSize * 0.08}
                    dominantBaseline="hanging"
                    fontFamily={metric.fontFamily}
                    fontSize={metric.fontSize}
                    fontWeight={metric.fontWeight}
                    letterSpacing={metric.letterSpacing}
                  >
                    {line}
                  </text>
                </g>
              </svg>
            ) : null}
          </span>
        );
      })}
    </Tag>
  );
}
