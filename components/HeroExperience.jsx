"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import HeroScene from "./HeroScene";
import styles from "./hero-experience.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HeroExperience() {
  const [isMobileSeam, setIsMobileSeam] = useState(false);
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const veilRef = useRef(null);
  const sectionsRef = useRef(null);
  const curtainShellRef = useRef(null);
  const leftClipPathRef = useRef(null);
  const rightClipPathRef = useRef(null);
  const sliceRefs = useRef([]);
  const imageMetricsRef = useRef({ ready: false, width: 0, height: 0 });
  const shellMetricsRef = useRef({ width: 0, height: 0 });
  const openTargetRef = useRef(0);
  const sliceCount = 96;
  const sliceItems = useMemo(
    () =>
      Array.from({ length: sliceCount }, (_, index) => ({
        index,
        ratio: index / sliceCount,
      })),
    [sliceCount]
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobileSeam(mediaQuery.matches);
    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  useEffect(() => {
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches;

    const lenis = new Lenis({
      autoRaf: true,
      duration: isReduced ? 0.9 : 1.2,
      smoothWheel: !isReduced,
      syncTouch: false,
      touchMultiplier: 1,
    });

    const context = gsap.context(() => {
      gsap.fromTo(
        introRef.current,
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 1.6, ease: "power3.out", delay: 0.45 }
      );

      gsap.to(veilRef.current, {
        opacity: isReduced ? 0.78 : 0.92,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: isReduced ? 0.8 : 1.2,
        },
      });

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: isReduced ? "+=92%" : "+=84%",
        scrub: isReduced ? 1.1 : 1.35,
        onUpdate: (self) => {
          openTargetRef.current = self.progress;
          if (heroRef.current) {
            heroRef.current.dispatchEvent(new CustomEvent("curtain-open-update"));
          }
        },
      });
    }, heroRef);

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!heroRef.current) return undefined;

    const hero = heroRef.current;
    const shell = curtainShellRef.current;
    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 900px), (hover: none), (pointer: coarse)").matches;
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none), (pointer: coarse)").matches;

    let rafId = 0;
    let resizeRaf = 0;
    let isTouchActive = false;
    const state = { x: 0, y: 0, open: 0 };
    const target = { x: 0, y: 0 };
    const sliceStates = sliceRefs.current.map(() => ({ x: 0, y: 0, glow: 0 }));

    function applySliceLayout() {
      if (!shell || !sliceRefs.current.length || !imageMetricsRef.current.ready) return;

      const rect = shell.getBoundingClientRect();
      const imgWidth = imageMetricsRef.current.width;
      const imgHeight = imageMetricsRef.current.height;
      const scale = Math.max(rect.width / imgWidth, rect.height / imgHeight);
      const backgroundWidth = imgWidth * scale;
      const backgroundHeight = imgHeight * scale;
      const offsetX = (rect.width - backgroundWidth) / 2;
      const offsetY = 0;
      const sliceWidth = rect.width / sliceCount;
      shellMetricsRef.current = { width: rect.width, height: rect.height };

      shell.style.setProperty("--curtain-bg-size", `${backgroundWidth}px ${backgroundHeight}px`);
      shell.style.setProperty("--curtain-bg-position", `${offsetX}px ${offsetY}px`);

      sliceRefs.current.forEach((slice, index) => {
        if (!slice) return;
        const left = index * sliceWidth;
        slice.style.left = `${left - 1}px`;
        slice.style.width = `${sliceWidth + 2}px`;
        slice.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;
        slice.style.backgroundPosition = `${offsetX - left}px ${offsetY}px`;
      });
    }

    const curtainImage = new window.Image();
    curtainImage.src = "/assets/curtain/final-curtain.png";
    curtainImage.onload = () => {
      imageMetricsRef.current = {
        ready: true,
        width: curtainImage.naturalWidth,
        height: curtainImage.naturalHeight,
      };
      applySliceLayout();
    };

    function render() {
      state.x += (target.x - state.x) * (isTouch ? 0.09 : 0.115);
      state.y += (target.y - state.y) * (isTouch ? 0.09 : 0.115);
      state.open += (openTargetRef.current - state.open) * (isReduced ? 0.16 : 0.14);

      hero.style.setProperty("--curtain-glow-x", `${(50 + state.x * 9).toFixed(2)}%`);
      hero.style.setProperty("--curtain-glow-y", `${(18 + state.y * 6).toFixed(2)}%`);
      hero.style.setProperty("--curtain-open-progress", `${state.open.toFixed(4)}`);
      const shellHeight = shellMetricsRef.current.height || hero.getBoundingClientRect().height;
      const riseAmount = -shellHeight * Math.pow(state.open, 0.98) * (isTouch ? 0.24 : isReduced ? 0.32 : 0.4);
      hero.style.setProperty("--curtain-rise-y", `${riseAmount.toFixed(3)}px`);

      const pointerCenter = target.x;
      const pointerDepth = target.y;
      const nearestIndex = Math.max(0, Math.min(sliceCount - 1, Math.round(((pointerCenter + 1) * 0.5) * (sliceCount - 1))));
      const nearestCenter = ((nearestIndex + 0.5) / sliceCount - 0.5) * 2;
      const hotspotCenter = nearestCenter * 0.25 + pointerCenter * 0.75;

      sliceRefs.current.forEach((slice, index) => {
        if (!slice) return;

        const center = ((index + 0.5) / sliceCount - 0.5) * 2;
        const side = center < 0 ? -1 : 1;
        const halfT = side < 0 ? center + 1 : 1 - center;
        const openWeight = state.open;
        const interactionWeight = 1 - openWeight * 0.62;
        const delta = center - hotspotCenter;
        const distance = Math.abs(delta);
        const primaryRadius = isTouch ? 0.1 : isReduced ? 0.072 : 0.038;
        const secondaryRadius = isTouch ? 0.17 : isReduced ? 0.12 : 0.068;
        const primaryInfluence = Math.exp(-Math.pow(distance / primaryRadius, 2));
        const secondaryInfluence = Math.exp(-Math.pow(distance / secondaryRadius, 2));
        const dragX =
          state.x * interactionWeight * primaryInfluence * (isTouch ? 1.12 : isReduced ? 0.84 : 1.16);
        const depthY =
          state.y * interactionWeight * primaryInfluence * (isTouch ? 0.2 : isReduced ? 0.34 : 0.56) +
          pointerDepth * interactionWeight * secondaryInfluence * (isTouch ? 0.04 : isReduced ? 0.08 : 0.13);
        const desiredX =
          dragX + state.x * interactionWeight * secondaryInfluence * (isTouch ? 0.05 : isReduced ? 0.04 : 0.07);
        const desiredY = depthY;
        const desiredGlow = interactionWeight * secondaryInfluence * (isTouch ? 0.09 : isReduced ? 0.06 : 0.1);
        const sliceState = sliceStates[index];

        sliceState.x += (desiredX - sliceState.x) * (isTouch ? 0.13 : 0.15);
        sliceState.y += (desiredY - sliceState.y) * (isTouch ? 0.12 : 0.14);
        sliceState.glow += (desiredGlow - sliceState.glow) * (isTouch ? 0.1 : 0.1);

        const hotspotBoost = Math.pow(primaryInfluence, 0.72);
        const shellWidth = shellMetricsRef.current.width || hero.getBoundingClientRect().width;
        const bottomBias = 0.26 + Math.pow(halfT, 0.82) * 0.74;
        const openingTravel = side * openWeight * bottomBias * shellWidth * (0.16 + halfT * 0.24);
        const gatheredTravel = side * openWeight * bottomBias * shellWidth * (0.022 + halfT * 0.035);
        const openOffsetX = openingTravel + gatheredTravel;
        const gatherScale = 1 - openWeight * bottomBias * (0.06 + (1 - halfT) * 0.08);
        const openRotate = side * openWeight * bottomBias * (1.8 + halfT * 2.4);
        const rotate = sliceState.x * (isTouch ? 1.34 : 1.12) + openRotate;
        const skew = sliceState.x * (isTouch ? 0.16 : 0.14) + side * openWeight * bottomBias * 0.22;
        const scaleX = (1.01 + secondaryInfluence * (isTouch ? 0.017 : 0.016)) * gatherScale;
        const scaleY = 1 + secondaryInfluence * (isTouch ? 0.006 : 0.011);
        const lift =
          secondaryInfluence * (isTouch ? 3.0 : isReduced ? 3 : 7) +
          hotspotBoost * (isTouch ? 1.35 : isReduced ? 1.4 : 2.8);
        const brightness = 1 + sliceState.glow * (isTouch ? 1.12 : 1.08) + hotspotBoost * 0.05;
        const contrast = 1 + sliceState.glow * (isTouch ? 0.46 : 0.42) + hotspotBoost * 0.05;
        const saturate = 1 + sliceState.glow * 0.14;
        const shadowX = (-sliceState.x * 0.42).toFixed(3);
        const shadowY = (1 + secondaryInfluence * (isTouch ? 2.8 : 4) + hotspotBoost * 1.5).toFixed(3);
        const shadowBlur = (2.8 + secondaryInfluence * (isTouch ? 7.4 : 9) + hotspotBoost * 3.8).toFixed(3);
        const shadowAlpha = (0.075 + secondaryInfluence * (isTouch ? 0.1 : 0.12) + hotspotBoost * 0.06).toFixed(3);
        const zIndex = 20 + Math.round(secondaryInfluence * 40 + hotspotBoost * 14);

        slice.style.zIndex = String(zIndex);
        slice.style.transform = `translate3d(${(sliceState.x + openOffsetX).toFixed(3)}px, ${sliceState.y.toFixed(
          3
        )}px, ${lift.toFixed(3)}px) rotateY(${rotate.toFixed(3)}deg) skewY(${skew.toFixed(3)}deg) scaleX(${scaleX.toFixed(
          4
        )}) scaleY(${scaleY.toFixed(4)})`;
        slice.style.filter = `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)}) saturate(${saturate.toFixed(
          3
        )}) drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha}))`;
      });

      if (shell) {
        const bottomProgress = Math.pow(state.open, isTouch ? 0.8 : 0.74);
        const waistProgress = Math.pow(Math.max(0, (state.open - 0.16) / 0.84), isTouch ? 1.05 : 1.12);
        const ribProgress = Math.pow(Math.max(0, (state.open - 0.42) / 0.58), isTouch ? 1.45 : 1.6);
        const shoulderProgress = Math.pow(Math.max(0, (state.open - 0.62) / 0.38), isTouch ? 2.0 : 2.25);
        const topProgress = Math.pow(Math.max(0, (state.open - 0.8) / 0.2), isTouch ? 2.6 : 3.0);
        const topGap = (isTouch ? 0.012 : isReduced ? 0.01 : 0.009) * topProgress;
        const shoulderGap = (isTouch ? 0.028 : isReduced ? 0.024 : 0.021) * shoulderProgress;
        const ribGap = (isTouch ? 0.08 : isReduced ? 0.07 : 0.062) * ribProgress;
        const waistGap = (isTouch ? 0.18 : isReduced ? 0.16 : 0.145) * waistProgress;
        const bottomGap = (isTouch ? 0.38 : isReduced ? 0.35 : 0.32) * bottomProgress;
        const shellWidth = shellMetricsRef.current.width || hero.getBoundingClientRect().width;
        const groupShiftProgress = Math.pow(Math.max(0, (state.open - 0.48) / 0.52), isTouch ? 1.3 : 1.45);
        const groupShift = shellWidth * groupShiftProgress * (isTouch ? 0.022 : isReduced ? 0.028 : 0.034);
        shell.style.setProperty("--curtain-left-shift", `${(-groupShift).toFixed(3)}px`);
        shell.style.setProperty("--curtain-right-shift", `${groupShift.toFixed(3)}px`);

        const leftPath = [
          "M 0 0",
          "L 0.5 0",
          "L 0.5 0.245",
          `C ${0.5 - topGap} 0.305, ${0.5 - shoulderGap} 0.395, ${0.5 - ribGap} 0.52`,
          `C ${0.5 - (ribGap * 1.05)} 0.64, ${0.5 - waistGap} 0.79, ${0.5 - bottomGap} 1`,
          "L 0 1",
          "Z",
        ].join(" ");

        const rightPath = [
          "M 0.5 0",
          "L 1 0",
          "L 1 1",
          `L ${0.5 + bottomGap} 1`,
          `C ${0.5 + waistGap} 0.79, ${0.5 + (ribGap * 1.05)} 0.64, ${0.5 + ribGap} 0.52`,
          `C ${0.5 + shoulderGap} 0.395, ${0.5 + topGap} 0.305, 0.5 0.245`,
          "Z",
        ].join(" ");

        leftClipPathRef.current?.setAttribute("d", leftPath);
        rightClipPathRef.current?.setAttribute("d", rightPath);
      }

      const moving =
        Math.abs(target.x - state.x) > 0.05 ||
        Math.abs(target.y - state.y) > 0.05 ||
        Math.abs(openTargetRef.current - state.open) > 0.002;
      if (moving) {
        rafId = window.requestAnimationFrame(render);
      } else {
        rafId = 0;
      }
    }

    function requestRender() {
      if (!rafId) rafId = window.requestAnimationFrame(render);
    }

    function updateTarget(clientX, clientY) {
      const rect = (shell ?? hero).getBoundingClientRect();
      const normalizedX = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const normalizedY = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
      const x = normalizedX - 0.5;
      const y = normalizedY - 0.5;
      target.x = x * 2;
      target.y = y * 2;
      requestRender();
    }

    function onPointerMove(event) {
      if (isTouch && !isTouchActive) return;
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerDown(event) {
      if (event.pointerType === "touch" || isTouch) {
        isTouchActive = true;
      }
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerLeave() {
      target.x = 0;
      target.y = 0;
      requestRender();
    }

    function onPointerUp() {
      isTouchActive = false;
      target.x = 0;
      target.y = 0;
      requestRender();
    }

    function onResize() {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(applySliceLayout);
    }

    function onOpenUpdate() {
      requestRender();
    }

    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    hero.addEventListener("pointerup", onPointerUp, { passive: true });
    hero.addEventListener("pointercancel", onPointerUp, { passive: true });
    hero.addEventListener("curtain-open-update", onOpenUpdate);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("pointerup", onPointerUp);
      hero.removeEventListener("pointercancel", onPointerUp);
      hero.removeEventListener("curtain-open-update", onOpenUpdate);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <svg className={styles.curtainClipDefs} aria-hidden="true" width="0" height="0" focusable="false">
          <defs>
            <clipPath id="curtain-body-handoff" clipPathUnits="objectBoundingBox">
              <path d="M 0 0.134 C 0.042 0.17, 0.102 0.212, 0.19 0.204 C 0.258 0.195, 0.318 0.141, 0.35 0.086 C 0.405 0.154, 0.45 0.202, 0.5 0.214 C 0.55 0.202, 0.595 0.154, 0.65 0.086 C 0.682 0.141, 0.742 0.195, 0.81 0.204 C 0.898 0.212, 0.958 0.17, 1 0.134 L 1 1 L 0 1 Z" />
            </clipPath>
            <clipPath id="curtain-swells-cap" clipPathUnits="objectBoundingBox">
              <path d="M 0 0 L 1 0 L 1 0.134 C 0.958 0.17, 0.898 0.212, 0.81 0.204 C 0.742 0.195, 0.682 0.141, 0.65 0.086 C 0.595 0.154, 0.55 0.202, 0.5 0.214 C 0.45 0.202, 0.405 0.154, 0.35 0.086 C 0.318 0.141, 0.258 0.195, 0.19 0.204 C 0.102 0.212, 0.042 0.17, 0 0.134 Z" />
            </clipPath>
            <clipPath id="curtain-body-handoff-mobile" clipPathUnits="objectBoundingBox">
              <path d="M 0 0.134 C 0.012 0.139, 0.024 0.142, 0.032 0.142 C 0.05 0.142, 0.072 0.126, 0.076 0.108 Q 0.5 0.272, 0.924 0.108 C 0.928 0.126, 0.95 0.142, 0.968 0.142 C 0.976 0.142, 0.988 0.139, 1 0.134 L 1 1 L 0 1 Z" />
            </clipPath>
            <clipPath id="curtain-swells-cap-mobile" clipPathUnits="objectBoundingBox">
              <path d="M 0 0 L 1 0 L 1 0.134 C 0.988 0.139, 0.976 0.142, 0.968 0.142 C 0.95 0.142, 0.928 0.126, 0.924 0.108 Q 0.5 0.272, 0.076 0.108 C 0.072 0.126, 0.05 0.142, 0.032 0.142 C 0.024 0.142, 0.012 0.139, 0 0.134 Z" />
            </clipPath>
            <clipPath id="curtain-left-clip" clipPathUnits="objectBoundingBox">
              <path ref={leftClipPathRef} d="M 0 0 L 0.5 0 L 0.5 0.245 C 0.5 0.305, 0.5 0.395, 0.5 0.52 C 0.5 0.64, 0.5 0.79, 0.5 1 L 0 1 Z" />
            </clipPath>
            <clipPath id="curtain-right-clip" clipPathUnits="objectBoundingBox">
              <path ref={rightClipPathRef} d="M 0.5 0 L 1 0 L 1 1 L 0.5 1 C 0.5 0.79, 0.5 0.64, 0.5 0.52 C 0.5 0.395, 0.5 0.305, 0.5 0.245 Z" />
            </clipPath>
          </defs>
        </svg>
        <div className={styles.sceneShell}>
          <HeroScene />
        </div>
        <div ref={curtainShellRef} className={styles.curtainShell} aria-hidden="true">
          <div
            className={styles.curtainSwells}
            style={{ clipPath: `url(#${isMobileSeam ? "curtain-swells-cap-mobile" : "curtain-swells-cap"})` }}
          />
          <div
            className={styles.curtainBodyMask}
            style={{ clipPath: `url(#${isMobileSeam ? "curtain-body-handoff-mobile" : "curtain-body-handoff"})` }}
          >
            <div
              className={`${styles.curtainGroup} ${styles.curtainGroupLeft}`}
              style={{ clipPath: "url(#curtain-left-clip)" }}
            >
              {sliceItems
                .filter(({ ratio }) => ratio < 0.5)
                .map(({ index, ratio }) => (
                  <div
                    key={index}
                    ref={(node) => {
                      sliceRefs.current[index] = node;
                    }}
                    className={styles.curtainSlice}
                    style={{ "--slice-index": index, "--slice-ratio": ratio }}
                  />
                ))}
            </div>
            <div
              className={`${styles.curtainGroup} ${styles.curtainGroupRight}`}
              style={{ clipPath: "url(#curtain-right-clip)" }}
            >
              {sliceItems
                .filter(({ ratio }) => ratio >= 0.5)
                .map(({ index, ratio }) => (
                  <div
                    key={index}
                    ref={(node) => {
                      sliceRefs.current[index] = node;
                    }}
                    className={styles.curtainSlice}
                    style={{ "--slice-index": index, "--slice-ratio": ratio }}
                  />
                ))}
            </div>
          </div>
        </div>
        <div className={styles.heroAtmosphere} />
        <div ref={veilRef} className={styles.scrollVeil} />

        <header ref={introRef} className={styles.copy}>
          <p className={styles.eyebrow}>ARTIFICE</p>
          <h1>A darker room. Familiar objects. Impossible outcomes.</h1>
          <p className={styles.lead}>
            Sleight of hand by Chase Ellsworth, framed as an atmosphere rather than a performance website.
          </p>
          <div className={styles.heroActions}>
            <a href="#booking" className={styles.primaryLink}>
              Begin Inquiry
            </a>
            <a href="#experience" className={styles.secondaryLink}>
              Scroll Further
            </a>
          </div>
        </header>
      </section>

      <div ref={sectionsRef} className={styles.sections}>
        <section id="experience" className={`${styles.section} ${styles.splitSection}`}>
          <div className={styles.sectionCopy}>
            <p className={styles.sectionLabel}>Experience</p>
            <h2>Close enough to feel impossible. Quiet enough to feel real.</h2>
            <p>
              The work happens in the same air as the conversation, with ordinary objects and no visible machinery.
              The effect is not spectacle. It is the sudden sense that the room has shifted.
            </p>
          </div>
          <div className={styles.materialPanel}>
            <div className={styles.panelInset} />
          </div>
        </section>

        <section id="events" className={styles.section}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Events</p>
            <h2>For rooms that are already expecting something exceptional.</h2>
          </div>
          <div className={styles.eventGrid}>
            <article className={`${styles.eventCard} ${styles.cardPrivate}`}>
              <h3>Private Events</h3>
              <p>Intimate dinners, private homes, and evenings where conversation matters as much as atmosphere.</p>
            </article>
            <article className={`${styles.eventCard} ${styles.cardCorporate}`}>
              <h3>Corporate Receptions</h3>
              <p>Work that elevates the room without pulling it into novelty or obvious performance cues.</p>
            </article>
            <article className={`${styles.eventCard} ${styles.cardHospitality}`}>
              <h3>Luxury Hospitality</h3>
              <p>Designed for hotels, lounges, and premium venues where the standard is already set high.</p>
            </article>
          </div>
        </section>

        <section id="about" className={`${styles.section} ${styles.splitSection} ${styles.reverse}`}>
          <div className={styles.portraitFrame}>
            <img src="/assets/images/chase-headshot.jpg" alt="Chase Ellsworth" className={styles.portrait} />
          </div>
          <div className={styles.sectionCopy}>
            <p className={styles.sectionLabel}>About</p>
            <h2>Years of discipline, reduced to something that looks effortless.</h2>
            <p>
              Chase Ellsworth performs close-up sleight of hand without gimmicks, staged helpers, or disposable props.
              The material is tactile, exacting, and built to leave guests with the feeling that the impossible happened
              in their own hands.
            </p>
          </div>
        </section>

        <section id="booking" className={`${styles.section} ${styles.bookingSection}`}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Booking</p>
            <h2>Bring Artifice into the room.</h2>
            <p className={styles.bookingLead}>Create an evening your guests will remember long after it ends.</p>
          </div>
          <form className={styles.bookingForm}>
            <label>
              <span>Name</span>
              <input type="text" name="name" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" />
            </label>
            <label>
              <span>Event Type</span>
              <input type="text" name="eventType" />
            </label>
            <label>
              <span>Date</span>
              <input type="text" name="date" />
            </label>
            <label className={styles.fullWidth}>
              <span>Location</span>
              <input type="text" name="location" />
            </label>
            <label className={styles.fullWidth}>
              <span>Message</span>
              <textarea name="message" rows="5" />
            </label>
            <button type="submit" className={styles.formButton}>
              Request Availability
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
