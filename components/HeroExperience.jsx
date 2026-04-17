"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import HeroScene from "./HeroScene";
import MorphRevealText from "./MorphRevealText";
import styles from "./hero-experience.module.css";

gsap.registerPlugin(ScrollTrigger);

const clientLogos = [
  { name: "BlueCross BlueShield", src: "/assets/logos-clean/blue-cross-blue-shield.png", scale: 1.18 },
  { name: "Common House", src: "/assets/logos-clean/common-house.png", scale: 0.9 },
  { name: "DECA", src: "/assets/logos-clean/deca.png", scale: 1.08 },
  { name: "Delmonte Hotel Group", src: "/assets/logos-clean/delmonte.png", scale: 0.96 },
  { name: "Gardens in the Gorge", src: "/assets/logos-clean/gardens-in-the-gorge.png", scale: 1.18 },
  { name: "Hunter Museum of American Art", src: "/assets/logos-clean/hunter-museum.png", scale: 1.0 },
  { name: "Leo Events", src: "/assets/logos-clean/leo-events.png", scale: 0.72 },
  { name: "Literary Ink", src: "/assets/logos-clean/literary-ink.png", scale: 1.15 },
  { name: "McLemore", src: "/assets/logos-clean/mclemore.png", scale: 1.42 },
  { name: "The Dwell Hotel", src: "/assets/logos-clean/the-dwell-hotel.png", scale: 1.32 },
  { name: "The Rio", src: "/assets/logos-clean/the-rio.png", scale: 1.08 },
  { name: "TVA", src: "/assets/logos-clean/tva.png", scale: 0.94 },
  { name: "Pizza Bros", src: "/assets/logos-clean/pizza-bros.png", scale: 1.34 },
];

const clientNotes = [
  {
    quote: "I honestly underestimated how big the reactions would be. People were stopping me the rest of the night to talk about it.",
    name: "Margot H.",
  },
  {
    quote: "It gave the event a completely different energy. People loosened up, started talking more, and the whole room felt more alive.",
    name: "James R.",
  },
  {
    quote: "I’ve had entertainment at events before, but this felt different. It was elegant, personal, and people were genuinely blown away.",
    name: "Caroline S.",
  },
];

const pressItems = [
  {
    source: "Chattanooga Pulse",
    format: "Article",
    title: "Chase Ellsworth: Illusionist Extraordinaire",
    date: "Feature",
    href: "https://www.chattanoogapulse.com/citylife/news/chase-ellsworth-illusionist-extraordinaire/",
    action: "Read",
  },
  {
    source: "WUTC / NPR",
    format: "Radio Interview",
    title: "The Mind of Artifice, The Mentalist",
    date: "January 19, 2020",
    href: "https://www.wutc.org/news/2020-01-19/the-mind-of-artifice-the-mentalist",
    action: "Listen",
  },
  {
    source: "Inside Magic",
    format: "Industry Feature",
    title: "Magician Chase Ellsworth Featured",
    date: "October 16, 2019",
    href: "https://insidemagic.com/2019/10/16/magician-chase-ellsworth-featured/",
    action: "Read",
  },
  {
    source: "Local Television",
    format: "Interview & Performance",
    title: "A brief news appearance with close-up performance",
    date: "Broadcast Appearance",
    href: "https://youtu.be/Eyk0SKBYxHU?si=iWZgIDyvI1ZMXj5k",
    action: "Watch",
  },
];

export default function HeroExperience() {
  const [isMobileSeam, setIsMobileSeam] = useState(false);
  const [seamResolved, setSeamResolved] = useState(false);
  const [curtainReady, setCurtainReady] = useState(false);
  const [invitationState, setInvitationState] = useState("idle");
  const [invitationError, setInvitationError] = useState("");
  const heroRef = useRef(null);
  const wordmarkRef = useRef(null);
  const copyBodyRef = useRef(null);
  const veilRef = useRef(null);
  const curtainShellRef = useRef(null);
  const leftClipPathRef = useRef(null);
  const rightClipPathRef = useRef(null);
  const sectionRefs = useRef([]);
  const sliceRefs = useRef([]);
  const imageMetricsRef = useRef({ ready: false, width: 0, height: 0 });
  const shellMetricsRef = useRef({ width: 0, height: 0 });
  const openTargetRef = useRef(0);
  const requestRenderRef = useRef(() => {});
  const sliceCount = 64;
  const sliceItems = useMemo(
    () =>
      Array.from({ length: sliceCount }, (_, index) => ({
        index,
        ratio: index / sliceCount,
      })),
    [sliceCount]
  );

  const handleInvitationActivate = () => {
    if (invitationState !== "idle") return;
    setInvitationError("");
    setInvitationState("opening");
    window.setTimeout(() => setInvitationState("open"), 220);
  };

  const handleInvitationSubmit = async (event) => {
    event.preventDefault();
    if (invitationState !== "open") return;
    setInvitationError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      eventType: String(formData.get("eventType") ?? "").trim(),
      date: String(formData.get("date") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.eventType || !payload.message) {
      setInvitationError("Please complete the required fields.");
      return;
    }

    setInvitationState("submitting");
    try {
      const response = await fetch("/api/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      form.reset();
      window.setTimeout(() => setInvitationState("submitted"), 560);
    } catch (error) {
      console.error("Invitation submission failed", error);
      setInvitationState("open");
      setInvitationError("The request did not go through. Please try again.");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => {
      setIsMobileSeam(mediaQuery.matches);
      setSeamResolved(true);
    };
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
      duration: isReduced ? 0.9 : 0.82,
      smoothWheel: !isReduced,
      syncTouch: false,
      touchMultiplier: 1,
    });

    const localTriggers = [];

    const context = gsap.context(() => {
      const curtainScrollDistance = isReduced ? "+=200%" : "+=180%";

      const leadCopy = copyBodyRef.current?.querySelector("[data-hero-lead]");
      const heroActions = copyBodyRef.current?.querySelector("[data-hero-actions]");

      gsap.set(wordmarkRef.current, { autoAlpha: 0, y: 6, filter: "blur(5px)" });
      gsap.set(leadCopy, { autoAlpha: 0, y: 12, filter: "blur(2.5px)" });
      gsap.set(heroActions, { autoAlpha: 0, y: 0, filter: "blur(2px)" });
      heroActions?.classList.remove(styles.heroActionsRevealed);

      const copyReveal = gsap.timeline({
        scrollTrigger: {
          trigger: wordmarkRef.current,
          start: "top 76%",
          once: true,
        },
      });
      if (copyReveal.scrollTrigger) localTriggers.push(copyReveal.scrollTrigger);

      copyReveal
        .to(
          wordmarkRef.current,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.9,
            ease: "sine.out",
          },
          0
        );

      const bodyReveal = gsap.timeline({
        scrollTrigger: {
          trigger: wordmarkRef.current,
          start: "top 69%",
          once: true,
        },
      });
      if (bodyReveal.scrollTrigger) localTriggers.push(bodyReveal.scrollTrigger);

      bodyReveal
        .to(
          leadCopy,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "sine.out",
          },
          2.28
        )
        .to(
          heroActions,
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "sine.out",
            onComplete: () => {
              heroActions?.classList.add(styles.heroActionsRevealed);
            },
          },
          2.88
        );

      const veilTween = gsap.to(veilRef.current, {
        opacity: isReduced ? 0.78 : 0.92,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: isReduced ? 0.8 : 1.2,
        },
      });
      if (veilTween.scrollTrigger) localTriggers.push(veilTween.scrollTrigger);

      localTriggers.push(ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: curtainScrollDistance,
        scrub: isReduced ? 1 : 0.45,
        onUpdate: (self) => {
          openTargetRef.current = self.progress;
          requestRenderRef.current();
        },
      }));

      sectionRefs.current.forEach((section) => {
        if (!section) return;
        const targets = section.querySelectorAll("[data-section-reveal]");
        if (!targets.length) return;

        if (section.id === "booking") {
          const invitationLabel = section.querySelector("[data-invitation-label]");
          const invitationLine = section.querySelector("[data-invitation-special]");
          const invitationGoldLine = section.querySelector("[data-invitation-gold-line]");
          const invitationWords = section.querySelectorAll("[data-invitation-word]");
          const invitationContact = section.querySelector("[data-invitation-contact]");
          if (!invitationLabel || !invitationLine || !invitationGoldLine || !invitationWords.length || !invitationContact) return;

          gsap.set(invitationLabel, {
            autoAlpha: 0,
            y: isReduced ? 6 : 8,
            filter: "blur(2.2px)",
          });
          gsap.set(invitationGoldLine, {
            autoAlpha: 0,
            scaleX: 0,
            xPercent: -50,
            transformOrigin: "left center",
            filter: "blur(0.55px)",
          });
          gsap.set(invitationWords, {
            autoAlpha: 0,
            filter: "blur(0.34px)",
          });
          gsap.set(invitationContact, {
            autoAlpha: 0,
            y: isReduced ? 6 : 8,
            filter: "blur(2.2px)",
          });

          const bookingTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: isReduced ? "top 73%" : "top 69%",
              once: true,
            },
          });

          bookingTimeline
            .to(invitationLabel, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: isReduced ? 0.72 : 0.86,
              ease: "power2.out",
            }, 0)
            .to(invitationGoldLine, {
              autoAlpha: isReduced ? 0.64 : 0.58,
              scaleX: 1,
              filter: "blur(0.08px)",
              duration: isReduced ? 1.05 : 1.18,
              ease: "power1.out",
            }, isReduced ? 0.22 : 0.28)
            .set(invitationGoldLine, {
              transformOrigin: "right center",
            }, isReduced ? 1.3 : 1.46)
            .to(invitationGoldLine, {
              autoAlpha: 0,
              scaleX: 0,
              filter: "blur(0.5px)",
              duration: isReduced ? 0.92 : 1.02,
              ease: "sine.inOut",
            }, isReduced ? 1.46 : 1.62)
            .to(invitationWords, {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: isReduced ? 0.96 : 1.12,
              ease: "sine.inOut",
              stagger: {
                each: isReduced ? 0.09 : 0.105,
                from: "start",
              },
            }, isReduced ? 1.58 : 1.76)
            .to(invitationContact, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: isReduced ? 0.72 : 0.82,
              ease: "power2.out",
            }, isReduced ? 2.42 : 2.66);

          if (bookingTimeline.scrollTrigger) localTriggers.push(bookingTimeline.scrollTrigger);
          return;
        }

        gsap.set(targets, { autoAlpha: 0, y: isReduced ? 16 : 22, filter: "blur(6px)" });
        const revealTween = gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: isReduced ? 1.25 : 1.55,
          ease: "power2.out",
          stagger: isReduced ? 0.12 : 0.18,
          scrollTrigger: {
            trigger: section,
            start: isReduced ? "top 73%" : "top 69%",
            once: true,
          },
        });
        if (revealTween.scrollTrigger) localTriggers.push(revealTween.scrollTrigger);
      });
    }, heroRef);

    return () => {
      context.revert();
      localTriggers.forEach((trigger) => trigger?.kill());
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!heroRef.current) return undefined;

    const hero = heroRef.current;
    setCurtainReady(false);
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
    let isPointerInside = false;
    const state = { x: 0, y: 0, open: 0 };
    const target = { x: 0, y: 0 };
    const sliceStates = sliceRefs.current.map(() => ({
      lastTransform: "",
    }));

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
      setCurtainReady(true);
    };

    function render() {
      state.x += (target.x - state.x) * (isTouch ? 0.14 : 0.22);
      state.y += (target.y - state.y) * (isTouch ? 0.14 : 0.22);
      state.open = openTargetRef.current;

      hero.style.setProperty("--curtain-glow-x", `${(50 + state.x * 9).toFixed(2)}%`);
      hero.style.setProperty("--curtain-glow-y", `${(18 + state.y * 6).toFixed(2)}%`);
      const pointerXNorm = state.x * 0.5 + 0.5;
      const pointerYNorm = state.y * 0.5 + 0.5;
      hero.style.setProperty("--curtain-bubble-x", `${(pointerXNorm * 100).toFixed(2)}%`);
      hero.style.setProperty("--curtain-bubble-y", `${(pointerYNorm * 100).toFixed(2)}%`);
      const shellHeight = shellMetricsRef.current.height || hero.getBoundingClientRect().height;
      const riseAmount = -shellHeight * Math.pow(state.open, 0.98) * (isTouch ? 0.24 : isReduced ? 0.32 : 0.4);
      hero.style.setProperty("--curtain-rise-y", `${riseAmount.toFixed(3)}px`);
      const pointerPresence = isTouch ? (isTouchActive ? 1 : 0) : isPointerInside ? 1 : 0;
      const bubbleStrength = (1 - state.open * 0.78) * pointerPresence;
      hero.style.setProperty("--curtain-bubble-strength", `${bubbleStrength.toFixed(4)}`);

      const tensionWindow = isTouch ? 0.075 : isReduced ? 0.082 : 0.088;
      const tensionProgress = Math.min(1, state.open / tensionWindow);
      const openProgressRaw = state.open <= tensionWindow ? 0 : (state.open - tensionWindow) / (1 - tensionWindow);
      const openWeight = Math.pow(openProgressRaw, isTouch ? 1.16 : isReduced ? 1.22 : 1.28);

      sliceRefs.current.forEach((slice, index) => {
        if (!slice) return;

        const center = ((index + 0.5) / sliceCount - 0.5) * 2;
        const side = center < 0 ? -1 : 1;
        const halfT = side < 0 ? center + 1 : 1 - center;
        const sliceState = sliceStates[index];
        const shellWidth = shellMetricsRef.current.width || hero.getBoundingClientRect().width;
        const bottomBias = 0.26 + Math.pow(halfT, 0.82) * 0.74;
        const openingTravel = side * openWeight * bottomBias * shellWidth * (0.16 + halfT * 0.24);
        const gatheredTravel = side * openWeight * bottomBias * shellWidth * (0.022 + halfT * 0.035);
        const openOffsetX = openingTravel + gatheredTravel;
        const gatherScale = 1 - openWeight * bottomBias * (0.06 + (1 - halfT) * 0.08);
        const openRotate = side * openWeight * bottomBias * (1.8 + halfT * 2.4);
        const skew = side * openWeight * bottomBias * 0.22;
        const sliceCenterNorm = (index + 0.5) / sliceCount;
        const pointerDx = sliceCenterNorm - pointerXNorm;
        const influenceRadius = isTouch ? 0.1 : isReduced ? 0.078 : 0.068;
        const pointerField = Math.exp(-(pointerDx * pointerDx) / (2 * influenceRadius * influenceRadius));
        const verticalFocus = 1 - Math.min(1, Math.abs(pointerYNorm - 0.48) * 1.45);
        const tactileInfluence = pointerPresence * (1 - state.open * 0.84) * pointerField * (0.42 + verticalFocus * 0.58);
        const pointerLagX = target.x - state.x;
        const pointerLagY = target.y - state.y;
        const tactileShiftX = -pointerDx * tactileInfluence * shellWidth * (isTouch ? 0.018 : 0.015);
        const tactileShiftY = (pointerLagY * tactileInfluence * (isTouch ? 2.8 : 2.2)) + ((pointerYNorm - 0.5) * tactileInfluence * 0.8);
        const tactileRotate = -pointerDx * tactileInfluence * (isTouch ? 8.5 : 11.5);
        const tactileSkew = pointerLagX * tactileInfluence * 0.8;
        const centerWeight = Math.pow(Math.max(0, 1 - Math.abs(center)), 1.85);
        const upperBias = 1 - Math.min(1, halfT * 1.18);
        const tensionEase = Math.sin(tensionProgress * Math.PI * 0.5);
        const tensionCompress = centerWeight * tensionEase;
        const tensionShiftX = -side * shellWidth * tensionCompress * (isTouch ? 0.004 : 0.0032);
        const tensionShiftY = -tensionCompress * upperBias * (isTouch ? 4.5 : 3.6);
        const tensionRotate = -side * tensionCompress * (isTouch ? 1.35 : 1.05);
        const tensionSkew = -side * tensionCompress * upperBias * 0.085;
        const scaleX = gatherScale * (1 - tactileInfluence * (isTouch ? 0.03 : 0.042)) * (1 - tensionCompress * (isTouch ? 0.016 : 0.012));
        const transform = `translate3d(${(openOffsetX + tactileShiftX + tensionShiftX).toFixed(3)}px, ${(tactileShiftY + tensionShiftY).toFixed(3)}px, 0px) rotateY(${(openRotate + tactileRotate + tensionRotate).toFixed(
          3
        )}deg) skewY(${(skew + tactileSkew + tensionSkew).toFixed(3)}deg) scaleX(${scaleX.toFixed(4)}) scaleY(1)`;

        if (sliceState.lastTransform !== transform) {
          slice.style.transform = transform;
          sliceState.lastTransform = transform;
        }
      });

      if (shell) {
        const seamTension = Math.sin(tensionProgress * Math.PI * 0.5);
        const bottomProgress = Math.pow(openWeight, isTouch ? 0.8 : 0.74);
        const waistProgress = Math.pow(Math.max(0, (openWeight - 0.16) / 0.84), isTouch ? 1.05 : 1.12);
        const ribProgress = Math.pow(Math.max(0, (openWeight - 0.42) / 0.58), isTouch ? 1.45 : 1.6);
        const shoulderProgress = Math.pow(Math.max(0, (openWeight - 0.62) / 0.38), isTouch ? 2.0 : 2.25);
        const topProgress = Math.pow(Math.max(0, (openWeight - 0.8) / 0.2), isTouch ? 2.6 : 3.0);
        const topGap = Math.max(0, (isTouch ? 0.012 : isReduced ? 0.01 : 0.009) * topProgress - seamTension * 0.0022);
        const shoulderGap = Math.max(0, (isTouch ? 0.028 : isReduced ? 0.024 : 0.021) * shoulderProgress - seamTension * 0.0032);
        const ribGap = Math.max(0, (isTouch ? 0.08 : isReduced ? 0.07 : 0.062) * ribProgress - seamTension * 0.0042);
        const waistGap = Math.max(0, (isTouch ? 0.18 : isReduced ? 0.16 : 0.145) * waistProgress - seamTension * 0.0022);
        const bottomGap = Math.max(0, (isTouch ? 0.38 : isReduced ? 0.35 : 0.32) * bottomProgress - seamTension * 0.0006);
        const shellWidth = shellMetricsRef.current.width || hero.getBoundingClientRect().width;
        const groupShiftProgress = Math.pow(Math.max(0, (openWeight - 0.48) / 0.52), isTouch ? 1.3 : 1.45);
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

    requestRenderRef.current = requestRender;

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

    function onPointerEnter(event) {
      if (event.pointerType !== "touch") {
        isPointerInside = true;
      }
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerMove(event) {
      if (isTouch && !isTouchActive) return;
      if (event.pointerType !== "touch") {
        isPointerInside = true;
      }
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerDown(event) {
      if (event.pointerType === "touch" || isTouch) {
        isTouchActive = true;
      } else {
        isPointerInside = true;
      }
      updateTarget(event.clientX, event.clientY);
    }

    function onPointerLeave() {
      isPointerInside = false;
      target.x = 0;
      target.y = 0;
      requestRender();
    }

    function onPointerUp(event) {
      if (event.pointerType === "touch" || isTouch) {
        isTouchActive = false;
        target.x = 0;
        target.y = 0;
        requestRender();
      }
    }

    function onResize() {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(applySliceLayout);
    }

    hero.addEventListener("pointerenter", onPointerEnter, { passive: true });
    hero.addEventListener("pointerdown", onPointerDown, { passive: true });
    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave, { passive: true });
    hero.addEventListener("pointerup", onPointerUp, { passive: true });
    hero.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      hero.removeEventListener("pointerenter", onPointerEnter);
      hero.removeEventListener("pointerdown", onPointerDown);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
      hero.removeEventListener("pointerup", onPointerUp);
      hero.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      requestRenderRef.current = () => {};
    };
  }, []);

  return (
    <main className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <svg className={styles.curtainClipDefs} aria-hidden="true" width="0" height="0" focusable="false">
          <defs>
            <clipPath id="curtain-body-handoff" clipPathUnits="objectBoundingBox">
              <path d="M 0 0.134 C 0.042 0.17, 0.102 0.212, 0.19 0.204 C 0.258 0.195, 0.318 0.141, 0.35 0.086 Q 0.5 0.285, 0.65 0.086 C 0.682 0.141, 0.742 0.195, 0.81 0.204 C 0.898 0.212, 0.958 0.17, 1 0.134 L 1 1 L 0 1 Z" />
            </clipPath>
            <clipPath id="curtain-swells-cap" clipPathUnits="objectBoundingBox">
              <path d="M 0 0 L 1 0 L 1 0.134 C 0.958 0.17, 0.898 0.212, 0.81 0.204 C 0.742 0.195, 0.682 0.141, 0.65 0.086 Q 0.5 0.285, 0.35 0.086 C 0.318 0.141, 0.258 0.195, 0.19 0.204 C 0.102 0.212, 0.042 0.17, 0 0.134 Z" />
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
        <div className={`${styles.sceneShell} ${curtainReady ? styles.sceneShellReady : ""}`}>
          <HeroScene />
        </div>
        <div
          ref={curtainShellRef}
          className={`${styles.curtainShell} ${curtainReady && seamResolved ? styles.curtainShellReady : ""}`}
          aria-hidden="true"
        >
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
                .map(({ index }) => (
                  <div
                    key={index}
                    ref={(node) => {
                      sliceRefs.current[index] = node;
                    }}
                    className={styles.curtainSlice}
                  />
                ))}
            </div>
            <div
              className={`${styles.curtainGroup} ${styles.curtainGroupRight}`}
              style={{ clipPath: "url(#curtain-right-clip)" }}
            >
              {sliceItems
                .filter(({ ratio }) => ratio >= 0.5)
                .map(({ index }) => (
                  <div
                    key={index}
                    ref={(node) => {
                      sliceRefs.current[index] = node;
                    }}
                    className={styles.curtainSlice}
                  />
                ))}
            </div>
          </div>
        </div>
        <div className={styles.heroAtmosphere} />
        <div ref={veilRef} className={styles.scrollVeil} />

        <header className={styles.copy}>
          <div ref={wordmarkRef} className={styles.brandLockup} aria-label="Artifice by Chase Ellsworth">
            <img
              className={styles.wordmarkImage}
              src="/assets/brand/artifice-wordmark.png"
              alt=""
              aria-hidden="true"
            />
            <img
              className={styles.wordmarkBylineImage}
              src="/assets/brand/artifice-byline.png"
              alt=""
              aria-hidden="true"
            />
          </div>
          <MorphRevealText
            as="h1"
            lines={["Impossible close-up", "for rooms that", "expect more."]}
            className={styles.copyTitle}
            lineClassName={styles.copyTitleLine}
            start="top 69%"
            revealDelay={0.75}
          />
          <div ref={copyBodyRef} className={styles.copyBody}>
            <p className={styles.lead} data-hero-lead>
              Designed for private events, weddings, and exceptional gatherings where the atmosphere matters as much as the occasion itself.
            </p>
            <div className={styles.heroActions} data-hero-actions>
              <a href="/design" className={styles.primaryLink}>
                Explore Experiences
              </a>
              <a href="#booking" className={styles.secondaryLink}>
                Contact
              </a>
            </div>
          </div>
        </header>
      </section>

      <div className={styles.sections}>
        <section id="experience" ref={(node) => { sectionRefs.current[0] = node; }} className={`${styles.section} ${styles.splitSection}`}>
          <div className={styles.sectionCopy} data-section-reveal>
            <p className={styles.sectionLabel}>Experience</p>
            <h2>What makes it different</h2>
            <p>
              No props. No distance. No visible method.
            </p>
            <p>
              Everything happens in the hands, in the moment, and inside the conversation.
              What guests remember is not just what happened, but how the room felt while it was happening.
            </p>
            <div className={styles.sectionActions}>
              <a href="/design" className={styles.secondaryLink}>
                Explore Experiences
              </a>
              <a href="#booking" className={styles.secondaryLink}>
                Contact
              </a>
            </div>
          </div>
          <div className={`${styles.portraitFrame} ${styles.experienceFrame}`} data-section-reveal>
            <img
              src="/assets/images/experience-performance.jpg"
              alt="Chase Ellsworth handling cards during a close-up performance"
              className={`${styles.portrait} ${styles.experiencePhoto}`}
            />
          </div>
        </section>

        <section id="events" ref={(node) => { sectionRefs.current[1] = node; }} className={styles.section}>
          <div className={styles.sectionHeading} data-section-reveal>
            <p className={styles.sectionLabel}>Where It Belongs</p>
            <h2>For rooms where atmosphere is part of the occasion.</h2>
            <p>
              The work lands best in spaces where intimacy, tone, and attention matter as much as the event itself.
            </p>
          </div>
          <div className={styles.eventGrid} data-section-reveal>
            <article className={styles.eventCard}>
              <h3>Private Evenings</h3>
              <p>Private dinners, homes, and evenings where conversation matters as much as atmosphere.</p>
            </article>
            <article className={styles.eventCard}>
              <h3>Corporate Gatherings</h3>
              <p>For receptions and client events where the room should feel elevated, not interrupted.</p>
            </article>
            <article className={styles.eventCard}>
              <h3>Exceptional Venues</h3>
              <p>For hotels, lounges, and spaces where tone, discretion, and experience already matter.</p>
            </article>
          </div>
        </section>

        <section id="about" ref={(node) => { sectionRefs.current[2] = node; }} className={`${styles.section} ${styles.splitSection} ${styles.reverse}`}>
          <div className={styles.portraitFrame} data-section-reveal>
            <img src="/assets/images/chase-headshot.jpg" alt="Chase Ellsworth" className={styles.portrait} />
          </div>
          <div className={styles.sectionCopy} data-section-reveal>
            <p className={styles.sectionLabel}>About</p>
            <h2>Years of discipline, refined into something that feels effortless.</h2>
            <p>
              Based in Chattanooga, Chase Ellsworth performs close-up sleight of hand built from ordinary objects,
              exacting technique, and direct human contact. No gimmicks, no stooges, and nothing disposable — just
              craft designed to place the impossible in your guest’s own hands.
            </p>
          </div>
        </section>

        <section id="begin" ref={(node) => { sectionRefs.current[4] = node; }} className={`${styles.section} ${styles.beginSection}`}>
          <div className={styles.beginInner} data-section-reveal>
            <p className={styles.sectionLabel}>Begin</p>
            <h2>
              Start with the event.
              <span>I’ll guide the rest.</span>
            </h2>
            <p>
              Every room asks for something different. Share a few details, and I’ll recommend the experience I would begin with.
            </p>
            <div className={styles.beginActions}>
              <a href="/design" className={styles.primaryLink}>
                Explore Experiences
              </a>
            </div>
          </div>
        </section>

        <section id="press" ref={(node) => { sectionRefs.current[5] = node; }} className={`${styles.section} ${styles.pressSection}`}>
          <div className={styles.pressIntro} data-section-reveal>
            <p className={styles.sectionLabel}>Press</p>
            <h2>Recognized for work that feels impossible up close.</h2>
            <p>
              A small record of interviews, features, and appearances around Artifice and Chase Ellsworth.
            </p>
          </div>

          <div className={styles.pressList} data-section-reveal aria-label="Press features and appearances">
            {pressItems.map((item) => (
              <a
                className={styles.pressItem}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                key={`${item.source}-${item.title}`}
              >
                <span className={styles.pressMeta}>{item.format}</span>
                <span className={styles.pressMain}>
                  <span className={styles.pressSource}>{item.source}</span>
                  <span className={styles.pressTitle}>{item.title}</span>
                </span>
                <span className={styles.pressAside}>
                  <span>{item.date}</span>
                  <span>{item.action}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="clients" ref={(node) => { sectionRefs.current[6] = node; }} className={`${styles.section} ${styles.clientsSection}`}>
          <div className={styles.clientsHeader} data-section-reveal>
            <p className={styles.sectionLabel}>Selected Clients</p>
            <h2>Trusted in rooms where the standard is already high.</h2>
          </div>

          <div className={styles.clientLogoGrid} data-section-reveal aria-label="Selected Artifice clients">
            {clientLogos.map((logo) => (
              <figure className={styles.clientLogoTile} key={logo.name} style={{ "--logo-scale": logo.scale }}>
                <img src={logo.src} alt={`${logo.name} logo`} loading="lazy" />
              </figure>
            ))}
          </div>

          <div className={styles.clientNotes} data-section-reveal>
            {clientNotes.map((note) => (
              <blockquote className={styles.clientNote} key={note.quote}>
                <p>&ldquo;{note.quote}&rdquo;</p>
                <cite>- {note.name}</cite>
              </blockquote>
            ))}
          </div>
        </section>

        <section
          ref={(node) => { sectionRefs.current[3] = node; }}
          id="booking"
          className={`${styles.section} ${styles.bookingSection} ${styles[`bookingState${
            invitationState.charAt(0).toUpperCase() + invitationState.slice(1)
          }`]}`}
        >
          <div className={styles.invitationStage} data-section-reveal>
            <div className={styles.invitationPrelude}>
              <p className={styles.sectionLabel} data-invitation-label>Private Invitation</p>
              <p
                className={`${styles.invitationLine} ${styles.invitationSpecialLine}`}
                data-invitation-special
                aria-label="Private performances are limited."
              >
                <span className={styles.invitationGoldLine} data-invitation-gold-line aria-hidden="true" />
                <span className={styles.invitationWordWrap} aria-hidden="true">
                  {["Private", "performances", "are", "limited."].map((word, index) => (
                    <span className={styles.invitationWord} data-invitation-word key={word}>
                      {word}
                      {index < 3 ? "\u00A0" : ""}
                    </span>
                  ))}
                </span>
              </p>
              <button type="button" className={styles.invitationTrigger} data-invitation-contact onClick={handleInvitationActivate}>
                Contact
              </button>
            </div>

            <form className={styles.invitationForm} onSubmit={handleInvitationSubmit}>
              <label className={styles.invitationField}>
                <span>Name</span>
                <input type="text" name="name" autoComplete="name" required />
              </label>
              <label className={styles.invitationField}>
                <span>Email</span>
                <input type="email" name="email" autoComplete="email" required />
              </label>
              <label className={styles.invitationField}>
                <span>Event Type</span>
                <input type="text" name="eventType" required />
              </label>
              <label className={styles.invitationField}>
                <span>Date</span>
                <input type="text" name="date" />
              </label>
              <label className={`${styles.invitationField} ${styles.fullWidth}`}>
                <span>Location</span>
                <input type="text" name="location" />
              </label>
              <label className={`${styles.invitationField} ${styles.fullWidth}`}>
                <span>Message</span>
                <textarea name="message" rows="5" required />
              </label>
              <input
                type="text"
                name="website"
                tabIndex="-1"
                autoComplete="off"
                className={styles.invitationTrap}
                aria-hidden="true"
              />
              {invitationError ? <p className={styles.invitationError}>{invitationError}</p> : null}
              <button type="submit" className={styles.invitationSubmit}>
                Send invitation request
              </button>
            </form>

            <p className={styles.invitationConfirmation}>We’ll be in touch.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
