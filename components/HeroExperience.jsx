"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import HeroScene from "./HeroScene";
import styles from "./hero-experience.module.css";

gsap.registerPlugin(ScrollTrigger);

const CURTAIN_BANDS = [
  { id: "top", start: 0.245, end: 0.42, delay: 0.66, curve: 0.18, drag: 0.16 },
  { id: "upper", start: 0.42, end: 0.58, delay: 0.42, curve: 0.42, drag: 0.3 },
  { id: "lower", start: 0.58, end: 0.78, delay: 0.16, curve: 0.72, drag: 0.56 },
  { id: "bottom", start: 0.78, end: 1, delay: 0, curve: 1, drag: 0.9 },
];

const COLUMNS_PER_SIDE = 24;

export default function HeroExperience() {
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const veilRef = useRef(null);
  const sectionsRef = useRef(null);
  const curtainShellRef = useRef(null);
  const segmentRefs = useRef([]);
  const imageMetricsRef = useRef({ ready: false, width: 0, height: 0 });
  const shellMetricsRef = useRef({ width: 0, height: 0 });
  const openTargetRef = useRef(0);

  const segmentItems = useMemo(
    () =>
      CURTAIN_BANDS.flatMap((band, bandIndex) =>
        ["left", "right"].flatMap((side) =>
          Array.from({ length: COLUMNS_PER_SIDE }, (_, columnIndex) => ({
            key: `${side}-${band.id}-${columnIndex}`,
            side,
            band,
            bandIndex,
            columnIndex,
          }))
        )
      ),
    []
  );

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
        scrub: 1,
        onUpdate: (self) => {
          openTargetRef.current = self.progress;
          heroRef.current?.dispatchEvent(new CustomEvent("curtain-open-update"));
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

    function applySegmentLayout() {
      if (!shell || !segmentRefs.current.length || !imageMetricsRef.current.ready) return;

      const rect = shell.getBoundingClientRect();
      const imgWidth = imageMetricsRef.current.width;
      const imgHeight = imageMetricsRef.current.height;
      const scale = Math.max(rect.width / imgWidth, rect.height / imgHeight);
      const backgroundWidth = imgWidth * scale;
      const backgroundHeight = imgHeight * scale;
      const offsetX = (rect.width - backgroundWidth) / 2;
      const offsetY = 0;
      const halfWidth = rect.width / 2;
      const columnWidth = halfWidth / COLUMNS_PER_SIDE;
      shellMetricsRef.current = { width: rect.width, height: rect.height };

      shell.style.setProperty("--curtain-bg-size", `${backgroundWidth}px ${backgroundHeight}px`);
      shell.style.setProperty("--curtain-bg-position", `${offsetX}px ${offsetY}px`);

      segmentRefs.current.forEach((segment, index) => {
        if (!segment) return;
        const item = segmentItems[index];
        const { band, side, columnIndex } = item;
        const left =
          side === "left"
            ? columnIndex * columnWidth
            : rect.width - (columnIndex + 1) * columnWidth;
        const top = rect.height * band.start;
        const height = rect.height * (band.end - band.start);

        segment.style.left = `${left - 1}px`;
        segment.style.top = `${top - 1}px`;
        segment.style.width = `${columnWidth + 2}px`;
        segment.style.height = `${height + 2}px`;
        segment.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;
        segment.style.backgroundPosition = `${offsetX - left}px ${offsetY - top}px`;
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
      applySegmentLayout();
      requestRender();
    };

    function render() {
      rafId = 0;
      const open = openTargetRef.current;
      hero.style.setProperty("--curtain-glow-x", "50%");
      hero.style.setProperty("--curtain-glow-y", "18%");
      hero.style.setProperty("--curtain-open-progress", `${open.toFixed(4)}`);
      const shellHeight = shellMetricsRef.current.height || hero.getBoundingClientRect().height;
      const riseAmount = -shellHeight * Math.pow(open, 0.98) * (isTouch ? 0.18 : isReduced ? 0.24 : 0.3);
      hero.style.setProperty("--curtain-rise-y", `${riseAmount.toFixed(3)}px`);

      const shellWidth = shellMetricsRef.current.width || hero.getBoundingClientRect().width;
      const bandDrops = isTouch ? [0, 0.5, 1.4, 3] : isReduced ? [0, 0.8, 2.2, 4.8] : [0, 1.2, 3.4, 7.2];

      segmentRefs.current.forEach((segment, index) => {
        if (!segment) return;
        const item = segmentItems[index];
        const { band, bandIndex, side, columnIndex } = item;
        const sideDir = side === "left" ? -1 : 1;
        const innerness = columnIndex / (COLUMNS_PER_SIDE - 1);
        const edgeWeight = 1 - innerness;
        const bandProgress = Math.max(0, Math.min(1, (open - band.delay) / Math.max(0.0001, 1 - band.delay)));
        const eased = 1 - Math.pow(1 - bandProgress, isTouch ? 1.08 : 1.18);

        const baseTravel = shellWidth * eased * band.drag * (0.018 + innerness * (isTouch ? 0.12 : isReduced ? 0.145 : 0.17));
        const bunchTravel = shellWidth * eased * edgeWeight * band.drag * (isTouch ? 0.008 : isReduced ? 0.01 : 0.012);
        const x = sideDir * (baseTravel + bunchTravel);
        const y = eased * bandDrops[bandIndex] * (0.34 + innerness * 0.66);
        const rotate = sideDir * eased * (0.55 + band.curve * 1.35 + innerness * 1.25);
        const skew = sideDir * eased * (0.05 + band.curve * 0.12);
        const scaleX = 1 - eased * edgeWeight * (isTouch ? 0.028 : isReduced ? 0.034 : 0.04);
        const shadowX = sideDir < 0 ? 7 : -7;
        const shadowY = 1 + eased * (1.1 + band.curve * 1.8);
        const shadowBlur = 8 + eased * (12 + band.curve * 10);
        const shadowAlpha = 0.1 + eased * (0.03 + edgeWeight * 0.05);
        const zIndex = 120 + bandIndex * 36 + (COLUMNS_PER_SIDE - columnIndex);

        segment.style.zIndex = String(zIndex);
        segment.style.transform = `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, 0) rotateY(${rotate.toFixed(
          3
        )}deg) skewY(${skew.toFixed(3)}deg) scaleX(${scaleX.toFixed(4)})`;
        segment.style.filter = `drop-shadow(${shadowX}px ${shadowY.toFixed(3)}px ${shadowBlur.toFixed(
          3
        )}px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)}))`;
      });
    }

    function requestRender() {
      if (!rafId) rafId = window.requestAnimationFrame(render);
    }

    function onResize() {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        applySegmentLayout();
        requestRender();
      });
    }

    function onOpenUpdate() {
      requestRender();
    }

    hero.addEventListener("curtain-open-update", onOpenUpdate);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      hero.removeEventListener("curtain-open-update", onOpenUpdate);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
    };
  }, [segmentItems]);

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.sceneShell}>
          <HeroScene />
        </div>
        <div ref={curtainShellRef} className={styles.curtainShell} aria-hidden="true">
          {segmentItems.map((item, index) => (
            <div
              key={item.key}
              ref={(node) => {
                segmentRefs.current[index] = node;
              }}
              className={`${styles.curtainSegment} ${
                item.side === "left" ? styles.segmentLeft : styles.segmentRight
              }`}
            />
          ))}
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
