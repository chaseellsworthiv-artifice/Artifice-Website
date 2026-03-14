"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import HeroScene from "./HeroScene";
import styles from "./hero-experience.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function HeroExperience() {
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const veilRef = useRef(null);
  const sectionsRef = useRef(null);
  const curtainShellRef = useRef(null);
  const sliceRefs = useRef([]);
  const imageMetricsRef = useRef({ ready: false, width: 0, height: 0 });
  const sliceCount = 40;
  const sliceItems = useMemo(
    () =>
      Array.from({ length: sliceCount }, (_, index) => ({
        index,
        ratio: index / sliceCount,
      })),
    [sliceCount]
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

      gsap.to(heroRef.current, {
        yPercent: isReduced ? -8 : -18,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: isReduced ? 0.8 : 1.2,
        },
      });

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

    let rafId = 0;
    let resizeRaf = 0;
    const state = { x: 0, y: 0 };
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

      shell.style.backgroundSize = `${backgroundWidth}px ${backgroundHeight}px`;
      shell.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

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
      state.x += (target.x - state.x) * 0.08;
      state.y += (target.y - state.y) * 0.08;

      hero.style.setProperty("--curtain-glow-x", `${(50 + state.x * 0.8).toFixed(2)}%`);
      hero.style.setProperty("--curtain-glow-y", `${(18 + state.y * 0.4).toFixed(2)}%`);

      const pointerCenter = target.x / (isReduced ? 4 : 8);
      const pointerDepth = target.y / (isReduced ? 2 : 4);

      sliceRefs.current.forEach((slice, index) => {
        if (!slice) return;

        const center = ((index + 0.5) / sliceCount - 0.5) * 2;
        const delta = center - pointerCenter;
        const distance = Math.abs(delta);
        const primaryRadius = isReduced ? 0.1 : 0.055;
        const secondaryRadius = isReduced ? 0.2 : 0.12;
        const primaryInfluence = Math.exp(-Math.pow(distance / primaryRadius, 2));
        const secondaryInfluence = Math.exp(-Math.pow(distance / secondaryRadius, 2));
        const direction = delta === 0 ? 0 : delta > 0 ? 1 : -1;
        const dragX = state.x * primaryInfluence * (isReduced ? 1.1 : 1.85);
        const pinchX = direction * primaryInfluence * Math.abs(state.x) * (isReduced ? 0.55 : 0.9);
        const depthY =
          state.y * primaryInfluence * (isReduced ? 0.45 : 0.8) +
          pointerDepth * secondaryInfluence * (isReduced ? 0.18 : 0.32);
        const desiredX = dragX - pinchX;
        const desiredY = depthY;
        const desiredGlow = primaryInfluence * (isReduced ? 0.08 : 0.14);
        const sliceState = sliceStates[index];

        sliceState.x += (desiredX - sliceState.x) * 0.14;
        sliceState.y += (desiredY - sliceState.y) * 0.13;
        sliceState.glow += (desiredGlow - sliceState.glow) * 0.12;

        const rotate = sliceState.x * 0.9;
        const skew = sliceState.x * 0.16;
        const scaleX = 1.02 + primaryInfluence * 0.02;
        const scaleY = 1 + primaryInfluence * 0.01;
        const brightness = 1 + sliceState.glow;
        const contrast = 1 + sliceState.glow * 0.3;

        slice.style.transform = `translate3d(${sliceState.x.toFixed(3)}px, ${sliceState.y.toFixed(
          3
        )}px, 0) rotateY(${rotate.toFixed(3)}deg) skewY(${skew.toFixed(3)}deg) scaleX(${scaleX.toFixed(
          4
        )}) scaleY(${scaleY.toFixed(4)})`;
        slice.style.filter = `brightness(${brightness.toFixed(3)}) contrast(${contrast.toFixed(3)})`;
      });

      const moving = Math.abs(target.x - state.x) > 0.05 || Math.abs(target.y - state.y) > 0.05;
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
      target.x = x * (isReduced ? 4 : 8);
      target.y = y * (isReduced ? 2 : 4);
      requestRender();
    }

    function onPointerMove(event) {
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerLeave() {
      target.x = 0;
      target.y = 0;
      requestRender();
    }

    function onResize() {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(applySliceLayout);
    }

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
    };
  }, []);

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.sceneShell}>
          <HeroScene />
        </div>
        <div ref={curtainShellRef} className={styles.curtainShell} aria-hidden="true">
          {sliceItems.map(({ index, ratio }) => (
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
