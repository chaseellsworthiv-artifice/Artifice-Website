export const experienceOrder = ["close-up", "table", "cabaret"];

export const experienceContent = {
  "close-up": {
    slug: "close-up",
    name: "Close-Up",
    eyebrow: "Guided Experience",
    summary:
      "A close-up performance that moves with the event rather than interrupting it, creating moments of astonishment directly inside the room's natural rhythm.",
    why:
      "Best when the evening is social, fluid, and built around conversation rather than a single point of focus.",
    feeling:
      "Conversations open. Small groups form. Reactions travel. The room becomes more connected, more energized, and more alive.",
    depthIntro:
      "Choose the depth that matches how fully you want the experience to move through the room.",
    ctaLabel: "Secure Your Date",
    depths: [
      {
        name: "Focused",
        descriptor: "Best for larger or faster-moving events.",
        duration: "60 minutes",
        price: "$0.01",
      },
      {
        name: "Extended",
        descriptor: "Balanced coverage with deeper guest interaction.",
        duration: "90 minutes",
        price: "$0.03",
      },
      {
        name: "Full",
        descriptor: "Maximum immersion and more time for meaningful moments.",
        duration: "120 minutes",
        price: "$0.05",
      },
    ],
  },
  table: {
    slug: "table",
    name: "Table",
    eyebrow: "Guided Experience",
    summary:
      "A dedicated performance table that becomes a destination inside the event, giving guests a more focused and memorable encounter with the work.",
    why:
      "Best when the event can support a single point of invitation and the room benefits from a more deliberate pace.",
    feeling:
      "More deliberate. More personal. A slower, deeper kind of astonishment that gives guests a moment to fully enter the experience.",
    depthIntro:
      "Choose the level of coverage that suits how often guests should be drawn into the table.",
    ctaLabel: "Secure Your Date",
    depths: [
      {
        name: "Focused",
        descriptor: "A shorter table presence for selective guest flow.",
        duration: "60 minutes",
        price: "$0.01",
      },
      {
        name: "Extended",
        descriptor: "Balanced time for a steady rhythm of deeper interactions.",
        duration: "90 minutes",
        price: "$0.03",
      },
      {
        name: "Full",
        descriptor: "A fuller table presence for sustained depth and repeat engagement.",
        duration: "120 minutes",
        price: "$0.05",
      },
    ],
  },
  cabaret: {
    slug: "cabaret",
    name: "Cabaret",
    eyebrow: "Guided Experience",
    summary:
      "A shared, room-wide performance designed to bring everyone into the same moment at once without losing intimacy or control.",
    why:
      "Best when the event benefits from a collective point of focus and a single memorable turn in the evening's energy.",
    feeling:
      "The room gathers. Attention sharpens. For a few minutes, everyone is inside the same moment.",
    depthIntro:
      "Cabaret is priced as a self-contained room-wide performance rather than a depth ladder.",
    ctaLabel: "Secure Your Date",
    depths: [
      {
        name: "Cabaret",
        descriptor: "A 30-minute interactive performance for the full room.",
        duration: "30 minutes",
        price: "$0.07",
      },
    ],
  },
  designed: {
    slug: "designed",
    name: "Designed Experience",
    eyebrow: "Designed Path",
    summary:
      "A fully considered performance structure built around the rhythm of the evening rather than a single self-contained format.",
    why:
      "Best when the experience should shape how the event unfolds, not simply take place inside it.",
    feeling:
      "Rather than separate performance blocks, this is designed as a complete experience — shaping how guests engage, how the energy builds, and where the defining moments land.",
    depthIntro:
      "Designed experiences typically begin at $2,500 and scale with timing, structure, and level of integration.",
    ctaLabel: "Design Your Experience",
    depths: [],
  },
};

const keywordMap = {
  cabaret: ["cabaret", "stage", "speech", "seated", "audience", "presentation", "show", "toast"],
  table: ["table", "booth", "station", "stationary", "lounge", "vip", "suite", "corner"],
  "close-up": ["cocktail", "reception", "mixer", "mingling", "mixing", "party", "networking"],
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function buildRecommendation(input) {
  const guestCount = Number.parseInt(String(input.guestCount || ""), 10) || 0;
  const eventType = normalizeText(input.eventType);
  const details = normalizeText(input.details);
  const combined = `${eventType} ${details}`;

  let primary = "close-up";

  if (keywordMap.cabaret.some((term) => combined.includes(term))) {
    primary = "cabaret";
  } else if (keywordMap.table.some((term) => combined.includes(term))) {
    primary = "table";
  } else if (guestCount > 0 && guestCount <= 28) {
    primary = "table";
  } else if (guestCount >= 90) {
    primary = "close-up";
  } else if (keywordMap["close-up"].some((term) => combined.includes(term))) {
    primary = "close-up";
  }

  const orderedStandard = [
    primary,
    ...experienceOrder.filter((slug) => slug !== primary),
  ];

  return {
    primary: experienceContent[primary],
    alternatives: orderedStandard.slice(1).map((slug) => experienceContent[slug]),
    designed: experienceContent.designed,
  };
}

export function getExperienceBySlug(slug) {
  return experienceContent[slug] ?? null;
}
