"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import styles from "./morph-reveal-text.module.css";

gsap.registerPlugin(ScrollTrigger);

const lineProfiles = [
  {
    y: [0.52, 0.34, 0.72, 0.48, 0.62],
    radius: [0.18, 0.13, 0.14, 0.1, 0.08],
    duration: [1.24, 1.36, 1.44, 1.54, 1.62],
    delay: [0, 0.08, 0.14, 0.22, 0.3],
    start: [-0.18, -0.14, -0.1, -0.08, -0.04],
    end: [0.94, 1.04, 1.1, 1.16, 1.22],
  },
  {
    y: [0.46, 0.66, 0.36, 0.58, 0.74],
    radius: [0.17, 0.12, 0.13, 0.11, 0.07],
    duration: [1.28, 1.4, 1.5, 1.58, 1.68],
    delay: [0, 0.1, 0.16, 0.24, 0.32],
    start: [-0.2, -0.16, -0.12, -0.08, -0.04],
    end: [0.92, 1.02, 1.1, 1.18, 1.24],
  },
  {
    y: [0.56, 0.3, 0.68, 0.44, 0.78],
    radius: [0.18, 0.12, 0.14, 0.1, 0.07],
    duration: [1.26, 1.38, 1.48, 1.58, 1.68],
    delay: [0, 0.08, 0.14, 0.22, 0.3],
    start: [-0.16, -0.12, -0.08, -0.06, -0.02],
    end: [0.96, 1.06, 1.12, 1.18, 1.26],
  },
  {
    y: [0.44, 0.72, 0.34, 0.56, 0.66],
    radius: [0.17, 0.12, 0.13, 0.1, 0.08],
    duration: [1.28, 1.38, 1.48, 1.56, 1.66],
    delay: [0, 0.08, 0.14, 0.22, 0.3],
    start: [-0.18, -0.14, -0.1, -0.06, -0.02],
    end: [0.94, 1.04, 1.1, 1.16, 1.22],
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
        gsap.set(entry.washText, { opacity: 0.96 });

        const profile = lineProfiles[index % lineProfiles.length];
        entry.blobs.forEach((blob, blobIndex) => {
          if (!blob || !entry.washBlobs[blobIndex]) return;
          const width = metrics[index].width;
          const startX = width * profile.start[blobIndex];
          const radius = width * profile.radius[blobIndex];
          gsap.set(blob, { attr: { cx: startX, rx: radius } });
          gsap.set(entry.washBlobs[blobIndex], { attr: { cx: startX, rx: radius * 0.72 } });
        });
      });

      const timeline = gsap.timeline({ paused: true });

      lineAnimRefs.current.forEach((entry, index) => {
        if (!entry?.fillRect || !entry.washText) return;
        const width = metrics[index].width;
        const profile = lineProfiles[index % lineProfiles.length];
        const lineOffset = index * 0.22;

        timeline.to(
          entry.fillRect,
          {
            attr: { width: width * 1.28 },
            duration: 2.1,
            ease: "power1.out",
          },
          lineOffset + 0.3
        );

        entry.blobs.forEach((blob, blobIndex) => {
          if (!blob || !entry.washBlobs[blobIndex]) return;
          const endX = width * profile.end[blobIndex];
          timeline.to(
            blob,
            {
              attr: { cx: endX },
              duration: profile.duration[blobIndex],
              ease: "power2.out",
            },
            lineOffset + profile.delay[blobIndex]
          );

          timeline.to(
            entry.washBlobs[blobIndex],
            {
              attr: { cx: endX + width * 0.012 },
              duration: profile.duration[blobIndex] * 0.9,
              ease: "power2.out",
            },
            lineOffset + profile.delay[blobIndex]
          );
        });

        timeline.to(
          entry.washText,
          {
            opacity: 0,
            duration: 0.56,
            ease: "power2.out",
          },
          lineOffset + 1.34
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
                    <feGaussianBlur stdDeviation={metric.height * 0.11} />
                  </filter>
                  <filter id={washBlurId} x="-40%" y="-120%" width="200%" height="360%">
                    <feGaussianBlur stdDeviation={metric.height * 0.065} />
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
                          ry={metric.height * (0.44 - blobIndex * 0.035)}
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
                          rx={metric.width * profile.radius[blobIndex] * 0.72}
                          ry={metric.height * (0.34 - blobIndex * 0.028)}
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
