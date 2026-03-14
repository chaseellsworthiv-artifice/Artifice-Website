"use client";

import { useEffect, useRef } from "react";
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

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.sceneShell}>
          <HeroScene />
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
