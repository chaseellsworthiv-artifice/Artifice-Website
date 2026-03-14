const parallaxNodes = Array.from(document.querySelectorAll(".parallax"));
const heroCard = document.querySelector(".hero-card-main");
const heroCardFace = heroCard ? heroCard.querySelector(".hero-card-face") : null;

function setupParallax() {
  if (!parallaxNodes.length) return;
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const state = new Map(parallaxNodes.map((node) => [node, 0]));
  let ticking = false;

  function update() {
    const scrollY = window.scrollY || 0;

    parallaxNodes.forEach((node) => {
      const speed = Number(node.dataset.speed || "0");
      const target = Math.min(scrollY * speed, 120);
      const current = state.get(node) || 0;
      const next = current + (target - current) * 0.12;
      state.set(node, next);

      const baseRotation = node.classList.contains("hero-card-main") ? " rotate(10deg)" : "";
      node.style.transform = `translate3d(0, ${next.toFixed(2)}px, 0)${baseRotation}`;
    });

    const active = parallaxNodes.some((node) => {
      const speed = Number(node.dataset.speed || "0");
      const target = Math.min(scrollY * speed, 120);
      return Math.abs((state.get(node) || 0) - target) > 0.2;
    });

    if (active) {
      requestAnimationFrame(update);
    } else {
      ticking = false;
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();
}

function setupHeroCardInteraction() {
  if (!heroCard || !heroCardFace) return;
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const state = { rotateX: 0, rotateY: 0, glowX: -14, glowY: 0 };
  const target = { rotateX: 0, rotateY: 0, glowX: -14, glowY: 0 };
  let rafId = 0;

  function render() {
    state.rotateX += (target.rotateX - state.rotateX) * 0.1;
    state.rotateY += (target.rotateY - state.rotateY) * 0.1;
    state.glowX += (target.glowX - state.glowX) * 0.1;
    state.glowY += (target.glowY - state.glowY) * 0.1;

    heroCard.style.transform = `translate3d(0, 0, 0) rotate(10deg) rotateX(${state.rotateX.toFixed(2)}deg) rotateY(${state.rotateY.toFixed(2)}deg)`;
    heroCardFace.style.setProperty("--glow-x", `${state.glowX.toFixed(2)}%`);
    heroCardFace.style.setProperty("--glow-y", `${state.glowY.toFixed(2)}%`);

    const moving =
      Math.abs(target.rotateX - state.rotateX) > 0.05 ||
      Math.abs(target.rotateY - state.rotateY) > 0.05 ||
      Math.abs(target.glowX - state.glowX) > 0.1 ||
      Math.abs(target.glowY - state.glowY) > 0.1;

    if (moving) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = 0;
    }
  }

  function requestRender() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  heroCard.addEventListener("mousemove", (event) => {
    const rect = heroCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    target.rotateY = (x - 0.5) * 10;
    target.rotateX = (0.5 - y) * 10;
    target.glowX = -22 + x * 44;
    target.glowY = -8 + y * 16;
    requestRender();
  });

  heroCard.addEventListener("mouseleave", () => {
    target.rotateX = 0;
    target.rotateY = 0;
    target.glowX = -14;
    target.glowY = 0;
    requestRender();
  });
}

function setup() {
  setupParallax();
  setupHeroCardInteraction();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}
