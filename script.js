const parallaxNodes = Array.from(document.querySelectorAll(".parallax"));

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
      node.style.transform = `translate3d(0, ${next.toFixed(2)}px, 0)`;
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupParallax);
} else {
  setupParallax();
}
