export const experienceOrder = ["close-up", "table", "cabaret"];

export const testPricing = {
  closeUp: {
    focused: "$0.01",
    extended: "$0.03",
    full: "$0.05",
  },
  table: {
    focused: "$0.01",
    extended: "$0.03",
    full: "$0.05",
  },
  cabaret: {
    cabaret: "$0.07",
  },
};

export const durationSupportLine =
  "Duration determines how deeply the experience can unfold — whether through shorter, high-impact moments across the room or longer, more personal interactions with each group.";

export const experienceContent = {
  "close-up": {
    slug: "close-up",
    name: "Close-Up",
    eyebrow: "Guided Experience",
    summary:
      "A close-up performance that moves with the event rather than interrupting it, creating moments of astonishment directly inside the room's natural rhythm.",
    opening:
      "Close-Up is designed for evenings where the experience should move through the room naturally rather than gather everyone into a formal point of attention.",
    why:
      "Best when the evening is social, fluid, and built around conversation rather than a single point of focus.",
    feeling:
      "Conversations open. Small groups form. Reactions travel. The room becomes more connected, more energized, and more alive.",
    depthIntro:
      "Choose the depth that matches how fully you want the experience to move through the room.",
    ctaLabel: "Secure Your Date",
    depths: [
      {
        id: "focused",
        name: "Focused",
        descriptor: "Best for larger or faster-moving events.",
        duration: "60 minutes",
        price: testPricing.closeUp.focused,
        note: "A concentrated presence built for pace and impact.",
      },
      {
        id: "extended",
        name: "Extended",
        descriptor: "Balanced coverage with deeper guest interaction.",
        duration: "90 minutes",
        price: testPricing.closeUp.extended,
        note: "More time for the work to travel and settle into the room.",
      },
      {
        id: "full",
        name: "Full",
        descriptor: "Maximum immersion and more time for meaningful moments.",
        duration: "120 minutes",
        price: testPricing.closeUp.full,
        note: "The fullest version of the experience for the broadest and deepest coverage.",
      },
    ],
  },
  table: {
    slug: "table",
    name: "Table",
    eyebrow: "Guided Experience",
    summary:
      "A dedicated performance table that becomes a destination inside the event, giving guests a more focused and memorable encounter with the work.",
    opening:
      "Table creates a quieter point of gravity within the event — a place guests can choose to enter, rather than something imposed on the room.",
    why:
      "Best when the event can support a single point of invitation and the room benefits from a more deliberate pace.",
    feeling:
      "More deliberate. More personal. A slower, deeper kind of astonishment that gives guests a moment to fully enter the experience.",
    depthIntro:
      "Choose the level of coverage that suits how often guests should be drawn into the table.",
    ctaLabel: "Secure Your Date",
    depths: [
      {
        id: "focused",
        name: "Focused",
        descriptor: "A shorter table presence for selective guest flow.",
        duration: "60 minutes",
        price: testPricing.table.focused,
        note: "A concise table set for rooms that only need a single refined destination.",
      },
      {
        id: "extended",
        name: "Extended",
        descriptor: "Balanced time for a steady rhythm of deeper interactions.",
        duration: "90 minutes",
        price: testPricing.table.extended,
        note: "Enough time for the table to become part of the event's internal rhythm.",
      },
      {
        id: "full",
        name: "Full",
        descriptor: "A fuller table presence for sustained depth and repeat engagement.",
        duration: "120 minutes",
        price: testPricing.table.full,
        note: "The deepest version of the table experience across the evening.",
      },
    ],
  },
  cabaret: {
    slug: "cabaret",
    name: "Cabaret",
    eyebrow: "Guided Experience",
    summary:
      "A shared, room-wide performance designed to bring everyone into the same moment at once without losing intimacy or control.",
    opening:
      "Cabaret is for moments when the room should gather and turn together — not for long, but decisively.",
    why:
      "Best when the event benefits from a collective point of focus and a single memorable turn in the evening's energy.",
    feeling:
      "The room gathers. Attention sharpens. For a few minutes, everyone is inside the same moment.",
    depthIntro:
      "Cabaret is priced as a self-contained room-wide performance rather than a depth ladder.",
    ctaLabel: "Secure Your Date",
    audienceNote: "Recommended for gatherings where a shared room-wide moment is appropriate.",
    depths: [
      {
        id: "cabaret",
        name: "Cabaret",
        descriptor: "A 30-minute interactive performance for the full room.",
        duration: "30 minutes",
        price: testPricing.cabaret.cabaret,
        note: "A single concentrated turn in the evening's energy.",
      },
    ],
  },
  designed: {
    slug: "designed",
    name: "Designed Experience",
    eyebrow: "Designed Path",
    summary:
      "A fully considered performance structure built around the rhythm of the evening rather than a single self-contained format.",
    opening:
      "Designed Experience is not a standard performance selection. It is a considered structure for the evening — shaped around timing, guest flow, and the moments that matter most.",
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

  const orderedStandard = [primary, ...experienceOrder.filter((slug) => slug !== primary)];

  return {
    primary: experienceContent[primary],
    alternatives: orderedStandard.slice(1).map((slug) => experienceContent[slug]),
    designed: experienceContent.designed,
  };
}

export function getExperienceBySlug(slug) {
  return experienceContent[slug] ?? null;
}

export function getDepthById(experience, depthId) {
  if (!experience?.depths?.length) return null;
  return experience.depths.find((depth) => depth.id === depthId) ?? experience.depths[0];
}
