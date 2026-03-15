"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

const lineProfiles = [
  {
    y: [0.52, 0.3, 0.72, 0.46, 0.62, 0.38, 0.58],
    radius: [0.16, 0.1, 0.12, 0.09, 0.08, 0.07, 0.06],
    start: [0.06, -0.14, 0.34, 0.18, 0.5, 0.26, 0.64],
    end: [0.44, 0.52, 0.78, 0.72, 1.02, 0.9, 1.14],
    duration: [1.06, 1.18, 1.2, 1.12, 1.3, 1.08, 1.22],
    delay: [0, 0.05, 0.09, 0.12, 0.16, 0.2, 0.24],
  },
  {
    y: [0.46, 0.66, 0.34, 0.58, 0.74, 0.42, 0.54],
    radius: [0.15, 0.1, 0.11, 0.09, 0.07, 0.07, 0.06],
    start: [0.02, 0.22, -0.12, 0.42, 0.58, 0.18, 0.7],
    end: [0.46, 0.76, 0.54, 0.88, 1.1, 0.82, 1.18],
    duration: [1.08, 1.2, 1.16, 1.24, 1.34, 1.1, 1.26],
    delay: [0, 0.04, 0.1, 0.13, 0.17, 0.21, 0.26],
  },
  {
    y: [0.56, 0.28, 0.68, 0.44, 0.78, 0.36, 0.6],
    radius: [0.16, 0.1, 0.12, 0.09, 0.07, 0.07, 0.06],
    start: [0.08, -0.08, 0.3, 0.14, 0.54, 0.24, 0.68],
    end: [0.5, 0.56, 0.8, 0.72, 1.08, 0.88, 1.2],
    duration: [1.1, 1.18, 1.22, 1.14, 1.34, 1.1, 1.28],
    delay: [0, 0.05, 0.08, 0.12, 0.16, 0.21, 0.26],
  },
  {
    y: [0.44, 0.72, 0.32, 0.56, 0.66, 0.4, 0.5],
    radius: [0.15, 0.1, 0.11, 0.09, 0.08, 0.07, 0.06],
    start: [0.04, 0.2, -0.1, 0.38, 0.52, 0.16, 0.66],
    end: [0.46, 0.76, 0.56, 0.86, 1.04, 0.8, 1.16],
    duration: [1.08, 1.2, 1.18, 1.24, 1.3, 1.1, 1.24],
    delay: [0, 0.05, 0.1, 0.14, 0.18, 0.22, 0.26],
  },
];

function measureLine(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const computed = window.getComputedStyle(node);
  const extraWidth = Math.max(28, Math.ceil(parseFloat(computed.fontSize) * 0.42));
  return {
    width: Math.ceil(rect.width) + extraWidth,
    height: Math.ceil(rect.height),
    fontFamily: computed.fontFamily,
    fontSize: parseFloat(computed.fontSize),
    fontWeight: computed.fontWeight,
    letterSpacing: computed.letterSpacing,
  };
}

function ensureEntry(entries, index) {
  const existing = entries.current[index];
  if (existing) return existing;
  const created = { blobs: [], washBlobs: [], fillRect: null, washText: null };
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
        if (!entry?.fillRect || !entry.washText) return;

        gsap.set(entry.fillRect, { attr: { width: 0 } });
        gsap.set(entry.washText, { opacity: 0.9 });

        const profile = lineProfiles[index % lineProfiles.length];
        entry.blobs.forEach((blob, blobIndex) => {
          if (!blob || !entry.washBlobs[blobIndex]) return;
          const width = metrics[index].width;
          const startX = width * profile.start[blobIndex];
          const radius = width * profile.radius[blobIndex];
          gsap.set(blob, { attr: { cx: startX, rx: radius } });
          gsap.set(entry.washBlobs[blobIndex], { attr: { cx: startX, rx: radius * 0.58 } });
        });
      });

      const timeline = gsap.timeline({ paused: true });

      lineAnimRefs.current.forEach((entry, index) => {
        if (!entry?.fillRect || !entry.washText) return;
        const width = metrics[index].width;
        const profile = lineProfiles[index % lineProfiles.length];
        const lineOffset = index * 0.2;

        timeline.to(
          entry.fillRect,
          {
            attr: { width: width * 1.26 },
            duration: 1.24,
            ease: "power1.out",
          },
          lineOffset + 0.96
        );

        entry.blobs.forEach((blob, blobIndex) => {
          if (!blob || !entry.washBlobs[blobIndex]) return;
          const endX = width * profile.end[blobIndex];
          const radius = width * profile.radius[blobIndex];
          timeline.to(
            blob,
            {
              attr: {
                cx: endX,
                rx: radius * (1.18 - blobIndex * 0.04),
              },
              duration: profile.duration[blobIndex],
              ease: "power2.out",
            },
            lineOffset + profile.delay[blobIndex]
          );

          timeline.to(
            entry.washBlobs[blobIndex],
            {
              attr: {
                cx: endX + width * 0.008,
                rx: radius * (0.72 - blobIndex * 0.03),
              },
              duration: profile.duration[blobIndex] * 0.84,
              ease: "power2.out",
            },
            lineOffset + profile.delay[blobIndex]
          );
        });

        timeline.to(
          entry.washText,
          {
            opacity: 0,
            duration: 0.36,
            ease: "power2.out",
          },
          lineOffset + 1.04
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
        const profile = lineProfiles[index % lineProfiles.length];

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
                className={styles.lineSvg}
                viewBox={`0 0 ${metric.width} ${metric.height}`}
                width={metric.width}
                height={metric.height}
                aria-hidden="true"
                preserveAspectRatio="xMinYMin meet"
              >
                <defs>
                  <filter id={blurId} x="-40%" y="-120%" width="180%" height="340%">
                    <feGaussianBlur stdDeviation={metric.height * 0.1} />
                  </filter>
                  <filter id={washBlurId} x="-40%" y="-120%" width="200%" height="360%">
                    <feGaussianBlur stdDeviation={metric.height * 0.055} />
                  </filter>
                  <mask id={maskId}>
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <rect
                      ref={(node) => {
                        ensureEntry(lineAnimRefs, index).fillRect = node;
                      }}
                      x="0"
                      y="0"
                      width="0"
                      height={metric.height}
                      fill="white"
                    />
                    <g filter={`url(#${blurId})`}>
                      {profile.y.map((value, blobIndex) => (
                        <ellipse
                          key={`blob-${blobIndex}`}
                          ref={(node) => {
                            ensureEntry(lineAnimRefs, index).blobs[blobIndex] = node;
                          }}
                          cx="0"
                          cy={metric.height * value}
                          rx={metric.width * profile.radius[blobIndex]}
                          ry={metric.height * (0.4 - blobIndex * 0.028)}
                          fill="white"
                        />
                      ))}
                    </g>
                  </mask>
                  <mask id={washMaskId}>
                    <rect width={metric.width} height={metric.height} fill="black" />
                    <g filter={`url(#${washBlurId})`}>
                      {profile.y.map((value, blobIndex) => (
                        <ellipse
                          key={`wash-blob-${blobIndex}`}
                          ref={(node) => {
                            ensureEntry(lineAnimRefs, index).washBlobs[blobIndex] = node;
                          }}
                          cx="0"
                          cy={metric.height * value}
                          rx={metric.width * profile.radius[blobIndex] * 0.58}
                          ry={metric.height * (0.28 - blobIndex * 0.02)}
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
              </svg>
            ) : null}
          </span>
        );
      })}
    </Tag>
  );
}
