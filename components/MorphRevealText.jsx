"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

const BLOB_COUNT = 24;

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createProfile(lineIndex) {
  const rand = seeded(9173 + lineIndex * 127);
  const blobs = Array.from({ length: BLOB_COUNT }, (_, blobIndex) => {
    const verticalBand = blobIndex % 3;
    const yBase = verticalBand === 0 ? 0.34 : verticalBand === 1 ? 0.52 : 0.68;
    const y = Math.min(0.82, Math.max(0.22, yBase + (rand() - 0.5) * 0.18));
    const radius = 0.024 + rand() * 0.034;
    const start = -0.1 + rand() * 1.2;
    const settle = Math.min(1.14, Math.max(0.02, start + (rand() - 0.5) * 0.18));
    const duration = 0.78 + rand() * 0.62;
    const delay = blobIndex * 0.016 + rand() * 0.22;
    const washLead = 0.01 + rand() * 0.05;
    return {
      y,
      radius,
      start,
      settle,
      duration,
      delay,
      washLead,
    };
  });

  return {
    blobs,
    washFadeStart: 0.82 + lineIndex * 0.06,
    lineOffset: lineIndex * 0.12,
  };
}

function measureLine(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const computed = window.getComputedStyle(node);
  const fontSize = parseFloat(computed.fontSize);
  const extraWidth = Math.max(88, Math.ceil(fontSize * 1.16));
  return {
    width: Math.ceil(rect.width) + extraWidth,
    height: Math.ceil(rect.height),
    fontFamily: computed.fontFamily,
    fontSize,
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
  };
}

function ensureEntry(entries, index) {
  const existing = entries.current[index];
  if (existing) return existing;
  const created = { blobs: [], washBlobs: [], washText: null, finalText: null, svgRoot: null };
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
}) {
  const rootRef = useRef(null);
  const measureRefs = useRef([]);
  const lineAnimRefs = useRef([]);
  const [metrics, setMetrics] = useState([]);
  const idPrefix = useId().replace(/:/g, "");

  useEffect(() => {
    if (!lines?.length) return undefined;

    const updateMetrics = () => {
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

    const context = gsap.context(() => {
      lineAnimRefs.current.forEach((entry, index) => {
        if (!entry?.washText || !entry?.svgRoot || !entry?.finalText) return;

        gsap.set(entry.svgRoot, { opacity: 0 });
        gsap.set(entry.washText, { opacity: 0.38 });
        gsap.set(entry.finalText, { opacity: 0 });

        const profile = createProfile(index);
        entry.blobs.forEach((blob, blobIndex) => {
          const descriptor = profile.blobs[blobIndex];
          if (!blob || !descriptor) return;
          const width = metrics[index].width;
          gsap.set(blob, {
            attr: {
              cx: width * descriptor.start,
              rx: width * descriptor.radius * 0.02,
            },
          });
        });

        entry.washBlobs.forEach((blob, blobIndex) => {
          const descriptor = profile.blobs[blobIndex];
          if (!blob || !descriptor) return;
          const width = metrics[index].width;
          gsap.set(blob, {
            attr: {
              cx: width * (descriptor.start - descriptor.washLead),
              rx: width * descriptor.radius * 0.04,
            },
          });
        });
      });

      const timeline = gsap.timeline({ paused: true });

      lineAnimRefs.current.forEach((entry, index) => {
        if (!entry?.washText || !entry?.svgRoot || !entry?.finalText) return;
        const width = metrics[index].width;
        const profile = createProfile(index);

        timeline.set(entry.svgRoot, { opacity: 1 }, profile.lineOffset);

        profile.blobs.forEach((descriptor, blobIndex) => {
          const blob = entry.blobs[blobIndex];
          const washBlob = entry.washBlobs[blobIndex];
          if (!blob || !washBlob) return;

          timeline.to(
            blob,
            {
              attr: {
                cx: width * descriptor.settle,
                rx: width * descriptor.radius * 3.4,
              },
              duration: descriptor.duration,
              ease: blobIndex % 3 === 0 ? "power1.out" : blobIndex % 3 === 1 ? "power2.out" : "sine.out",
            },
            profile.lineOffset + descriptor.delay
          );

          timeline.to(
            washBlob,
            {
              attr: {
                cx: width * (descriptor.settle + descriptor.washLead),
                rx: width * descriptor.radius * 0.84,
              },
              duration: descriptor.duration * (0.58 + (blobIndex % 4) * 0.05),
              ease: blobIndex % 3 === 0 ? "power1.out" : blobIndex % 3 === 1 ? "power2.out" : "sine.out",
            },
            profile.lineOffset + descriptor.delay + 0.02
          );
        });

        timeline.to(
          entry.washText,
          {
            opacity: 0,
            duration: 0.24,
            ease: "sine.out",
          },
          profile.lineOffset + profile.washFadeStart
        );

        timeline.to(
          entry.finalText,
          {
            opacity: 1,
            duration: 0.5,
            ease: "sine.out",
          },
          profile.lineOffset + profile.washFadeStart - 0.08
        );

        timeline.to(
          entry.svgRoot,
          {
            opacity: 0,
            duration: 0.2,
            ease: "sine.out",
          },
          profile.lineOffset + profile.washFadeStart + 0.08
        );

        timeline.set(entry.washText, { opacity: 0 }, profile.lineOffset + profile.washFadeStart + 0.24);
        timeline.set(entry.svgRoot, { opacity: 0 }, profile.lineOffset + profile.washFadeStart + 0.3);
      });

      ScrollTrigger.create({
        trigger,
        start,
        once: true,
        onEnter: () => timeline.play(0),
      });
    }, rootRef);

    return () => context.revert();
  }, [lines, metrics, start, triggerRef]);

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <Tag ref={rootRef} className={rootClassName}>
      {lines.map((line, index) => {
        const metric = metrics[index];
        const maskId = `${idPrefix}-reveal-${index}`;
        const washMaskId = `${idPrefix}-wash-${index}`;
        const blurId = `${idPrefix}-blur-${index}`;
        const washBlurId = `${idPrefix}-wash-blur-${index}`;
        const profile = createProfile(index);

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
                  ensureEntry(lineAnimRefs, index).svgRoot = node;
                }}
                className={styles.lineSvg}
                viewBox={`0 0 ${metric.width} ${metric.height}`}
                width={metric.width}
                height={metric.height}
                aria-hidden="true"
                preserveAspectRatio="xMinYMin meet"
              >
                <defs>
                  <filter id={blurId} x="-45%" y="-140%" width="220%" height="380%">
                    <feGaussianBlur stdDeviation={metric.height * 0.17} />
                  </filter>
                  <filter id={washBlurId} x="-45%" y="-140%" width="220%" height="380%">
                    <feGaussianBlur stdDeviation={metric.height * 0.12} />
                  </filter>
                  <mask id={maskId}>
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <g filter={`url(#${blurId})`}>
                      {profile.blobs.map((descriptor, blobIndex) => (
                        <ellipse
                          key={`blob-${blobIndex}`}
                          ref={(node) => {
                            ensureEntry(lineAnimRefs, index).blobs[blobIndex] = node;
                          }}
                          cx="0"
                          cy={metric.height * descriptor.y}
                          rx={metric.width * descriptor.radius * 0.2}
                          ry={metric.height * (0.18 + (blobIndex % 5) * 0.024)}
                          fill="white"
                        />
                      ))}
                    </g>
                  </mask>
                  <mask id={washMaskId}>
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <g filter={`url(#${washBlurId})`}>
                      {profile.blobs.map((descriptor, blobIndex) => (
                        <ellipse
                          key={`wash-blob-${blobIndex}`}
                          ref={(node) => {
                            ensureEntry(lineAnimRefs, index).washBlobs[blobIndex] = node;
                          }}
                          cx="0"
                          cy={metric.height * descriptor.y}
                          rx={metric.width * descriptor.radius * 0.34}
                          ry={metric.height * (0.14 + (blobIndex % 5) * 0.02)}
                          fill="white"
                        />
                      ))}
                    </g>
                  </mask>
                </defs>
                <text
                  className={styles.svgTextBase}
                  x="0"
                  y={metric.fontSize * 0.08}
                  dominantBaseline="hanging"
                  fontFamily={metric.fontFamily}
                  fontSize={metric.fontSize}
                  fontWeight={metric.fontWeight}
                  letterSpacing={metric.letterSpacing}
                  mask={`url(#${maskId})`}
                >
                  {line}
                </text>
                <text
                  ref={(node) => {
                    ensureEntry(lineAnimRefs, index).washText = node;
                  }}
                  className={styles.svgTextWash}
                  x="0"
                  y={metric.fontSize * 0.08}
                  dominantBaseline="hanging"
                  fontFamily={metric.fontFamily}
                  fontSize={metric.fontSize}
                  fontWeight={metric.fontWeight}
                  letterSpacing={metric.letterSpacing}
                  mask={`url(#${washMaskId})`}
                >
                  {line}
                </text>
                <text
                  ref={(node) => {
                    ensureEntry(lineAnimRefs, index).finalText = node;
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
              </svg>
            ) : null}
          </span>
        );
      })}
    </Tag>
  );
}
