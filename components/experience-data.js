export const experienceOrder = ["roaming", "table", "cabaret"];
export const legacyExperienceSlugs = {
  "close-up": "roaming",
  "designed-experience": "designed",
};

export const performanceFlowOptions = [
  {
    id: "throughout",
    label: "Throughout the room",
    summary: "For receptions, cocktail hours, and rooms where guests are naturally mingling.",
  },
  {
    id: "table",
    label: "From a single point",
    summary: "For intimate gatherings centered around one place, as well as trade shows, conventions, and activations.",
  },
  {
    id: "shared",
    label: "As one shared moment",
    summary: "For groups of 75 or fewer when everyone should experience it together.",
  },
  {
    id: "unsure",
    label: "I’m not sure yet",
    summary: "I’ll recommend the format that asks the least of the room.",
  },
];

export const experiencePricing = {
  roaming: {
    focused: "$1,000",
    extended: "$1,500",
    full: "$2,000",
  },
  table: {
    focused: "$1,000",
    extended: "$1,500",
    full: "$2,000",
  },
  cabaret: {
    cabaret: "$1,500",
  },
};

export const durationSupportLine =
  "Duration determines how deeply the experience can unfold — whether through shorter, high-impact moments across the room or longer, more personal interactions with each group.";

export const experienceContent = {
  roaming: {
    slug: "roaming",
    name: "Roaming",
    eyebrow: "Guided Experience",
    summary:
      "A close-up performance that moves with the event rather than interrupting it, creating moments of astonishment directly inside the room's natural rhythm.",
    detailHeadline: "Designed to move with the room.",
    opening:
      "Roaming is designed for evenings where the experience should move through the room naturally rather than gather everyone into a formal point of attention.",
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
        descriptor: "A shorter-format presence with precise coverage.",
        duration: "60 minutes",
        price: experiencePricing.roaming.focused,
        note: "A concentrated presence built for pace and impact.",
      },
      {
        id: "extended",
        name: "Extended",
        descriptor: "Balanced coverage with deeper guest interaction.",
        duration: "90 minutes",
        price: experiencePricing.roaming.extended,
        note: "More time for the work to travel and settle into the room.",
      },
      {
        id: "full",
        name: "Full",
        descriptor: "Maximum immersion and more time for meaningful moments.",
        duration: "120 minutes",
        price: experiencePricing.roaming.full,
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
    detailHeadline: "A point of gravity inside the event.",
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
        descriptor: "A shorter-format table presence with precise coverage.",
        duration: "60 minutes",
        price: experiencePricing.table.focused,
        note: "A concise table set for rooms that only need a single refined destination.",
      },
      {
        id: "extended",
        name: "Extended",
        descriptor: "Balanced time for a steady rhythm of deeper interactions.",
        duration: "90 minutes",
        price: experiencePricing.table.extended,
        note: "Enough time for the table to become part of the event's internal rhythm.",
      },
      {
        id: "full",
        name: "Full",
        descriptor: "A fuller table presence for sustained depth and repeat engagement.",
        duration: "120 minutes",
        price: experiencePricing.table.full,
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
    detailHeadline: "One focused moment for the room.",
    opening:
      "Cabaret is for moments when the room should gather and turn together — not for long, but decisively.",
    why:
      "Best when the event needs a planned room-wide performance for everyone at once.",
    feeling:
      "The room gathers. Attention sharpens. For a few minutes, everyone is inside the same moment.",
    depthIntro:
      "Cabaret is priced as a self-contained room-wide performance rather than a depth ladder.",
    ctaLabel: "Secure Your Date",
    audienceNote: "Recommended for 75 guests or fewer when you want one shared performance for the room.",
    depths: [
      {
        id: "cabaret",
        name: "Cabaret",
        descriptor: "A 30-minute interactive performance for the full room.",
        duration: "30 minutes",
        price: experiencePricing.cabaret.cabaret,
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
    detailHeadline: "Designed around the evening, not added onto it.",
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

export const recommendationReasons = {
  "explicit-cabaret": "Because this sounds like a moment where the room can gather around one shared focus, I would begin with Cabaret.",
  "cabaret-too-large": "Because a shared performance for this guest count would need more structure, I would begin with Roaming unless you want to plan a more tailored room-wide moment.",
  "table-commercial": "Because this sounds like an environment where guests will already be moving between points of interest, I would begin with Table. A fixed point gives the experience gravity without competing with the room.",
  "table-intimate": "Because this sounds centered around one close point of attention, I would begin with Table. It gives the experience a quiet point of gravity without needing the room to change shape.",
  "roaming-multiple-tables": "Because guests will be spread across multiple tables or a reception-style room, I would begin with Roaming so the experience can move naturally without asking the room to shift focus.",
  "roaming-social-flow": "Because this sounds social and fluid, I would begin with Roaming. It lets the experience move naturally through the room without asking the event to stop.",
  "roaming-default": "Because this format is the most versatile and asks the least of the room, I would begin with Roaming and let the experience adapt to the event as it unfolds.",
};

const detailSignals = {
  tableCommercial: [
    "trade show",
    "convention",
    "expo",
    "booth",
    "vendor table",
    "exhibit",
    "brand activation",
    "product activation",
    "activation",
    "hosted station",
    "demo station",
    "fixed station",
  ],
  tableIntimate: [
    "single dinner table",
    "one dinner table",
    "around one table",
    "around the table",
    "family dinner",
    "private dinner",
    "intimate dinner",
    "dinner party",
    "small dinner",
    "small group around a table",
    "coffee table",
    "dining room table",
  ],
  roamingMultipleTables: [
    "multiple dinner tables",
    "dinner tables",
    "banquet tables",
    "seated at multiple tables",
  ],
  roamingSocialFlow: [
    "cocktail hour",
    "cocktail reception",
    "reception",
    "mingling",
    "networking",
    "mixer",
    "lounge",
    "lounge areas",
    "guests spread out",
    "open room",
    "moving through the room",
  ],
  cabaretShared: [
    "perform for everyone",
    "performance for everyone",
    "everyone watching",
    "everyone gathered",
    "everyone together",
    "everyone at once",
    "all at once",
    "one shared moment",
    "shared moment",
    "shared performance",
    "featured performance",
    "room-wide performance",
    "room wide performance",
    "short show",
    "brief show",
    "after dinner show",
    "after dinner performance",
    "after dinner moment",
    "seated audience",
    "audience seating",
    "gather everyone",
    "gather the room",
    "bring everyone together",
    "introduce you",
    "make an announcement",
    "announcement before",
    "formal performance",
  ],
  tableSoft: [
    "guests come to one place",
    "fixed point",
    "focal point",
    "dedicated table",
    "performance table",
  ],
  cabaretSoft: [
    "one focused moment",
    "room-wide moment",
    "room wide moment",
    "gathered attention",
    "seated audience",
    "audience seating",
  ],
  cabaretPairedAfterDinner: [
    "after dinner performance",
    "after dinner show",
    "after dinner moment",
  ],
  tablePairedStation: [
    "hosted station",
    "demo station",
    "brand station",
    "activation station",
    "vendor station",
  ],
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSlug(slug) {
  return legacyExperienceSlugs[slug] || slug;
}

function includesAny(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function scoreSignals(text, phrases) {
  return phrases.reduce((score, phrase) => score + (text.includes(phrase) ? 1 : 0), 0);
}

function getPerformanceFlow(value) {
  const normalized = normalizeText(value);
  return performanceFlowOptions.some((option) => option.id === normalized) ? normalized : "";
}

function pickRecommendation(input) {
  const guestCount = Number.parseInt(String(input.guestCount || ""), 10) || 0;
  const eventType = normalizeText(input.eventType);
  const details = normalizeText(input.details);
  const performanceFlow = getPerformanceFlow(input.performanceFlow);
  const combined = `${eventType} ${details}`;

  const hasCabaretSignal = includesAny(combined, detailSignals.cabaretShared);
  const hasTableCommercialSignal = includesAny(combined, detailSignals.tableCommercial);
  const hasTableIntimateSignal = includesAny(combined, detailSignals.tableIntimate);
  const hasRoamingTableSignal = includesAny(combined, detailSignals.roamingMultipleTables);
  const hasRoamingSocialSignal = includesAny(combined, detailSignals.roamingSocialFlow);
  const isSmallEnoughForTable = guestCount > 0 && guestCount <= 25;
  const isSmallEnoughForCabaret = guestCount > 0 && guestCount <= 75;

  if (hasTableCommercialSignal) {
    return { slug: "table", reasonCode: "table-commercial" };
  }

  if (hasCabaretSignal && !isSmallEnoughForCabaret) {
    return { slug: "roaming", reasonCode: "cabaret-too-large" };
  }

  if (hasCabaretSignal && isSmallEnoughForCabaret) {
    return { slug: "cabaret", reasonCode: "explicit-cabaret" };
  }

  if (hasTableIntimateSignal && isSmallEnoughForTable) {
    return { slug: "table", reasonCode: "table-intimate" };
  }

  if (hasRoamingTableSignal) {
    return { slug: "roaming", reasonCode: "roaming-multiple-tables" };
  }

  if (hasRoamingSocialSignal) {
    return { slug: "roaming", reasonCode: "roaming-social-flow" };
  }

  const scores = {
    roaming: scoreSignals(combined, [...detailSignals.roamingSocialFlow, ...detailSignals.roamingMultipleTables]),
    table: scoreSignals(combined, [...detailSignals.tableSoft, ...detailSignals.tablePairedStation]),
    cabaret: isSmallEnoughForCabaret
      ? scoreSignals(combined, [...detailSignals.cabaretSoft, ...detailSignals.cabaretPairedAfterDinner])
      : 0,
  };

  if (performanceFlow === "throughout") scores.roaming += 1;
  if (performanceFlow === "table") scores.table += 1;
  if (performanceFlow === "shared" && isSmallEnoughForCabaret) scores.cabaret += 1;

  const highScore = Math.max(scores.roaming, scores.table, scores.cabaret);

  if (highScore > 0) {
    const winners = Object.entries(scores)
      .filter(([, score]) => score === highScore)
      .map(([slug]) => slug);

    if (winners.length === 1) {
      const [winner] = winners;
      if (winner === "table") return { slug: "table", reasonCode: "table-intimate" };
      if (winner === "cabaret") return { slug: "cabaret", reasonCode: "explicit-cabaret" };
      return { slug: "roaming", reasonCode: "roaming-social-flow" };
    }
  }

  return { slug: "roaming", reasonCode: "roaming-default" };
}

export function buildRecommendation(input) {
  const { slug, reasonCode } = pickRecommendation(input);
  const orderedStandard = [slug, ...experienceOrder.filter((item) => item !== slug)];

  return {
    primary: experienceContent[slug],
    alternatives: orderedStandard.slice(1).map((item) => experienceContent[item]),
    designed: experienceContent.designed,
    reasonCode,
    reason: recommendationReasons[reasonCode] || recommendationReasons["roaming-default"],
  };
}

export function getExperienceBySlug(slug) {
  return experienceContent[normalizeSlug(slug)] ?? null;
}

export function getDepthById(experience, depthId) {
  if (!experience?.depths?.length) return null;
  return experience.depths.find((depth) => depth.id === depthId) ?? experience.depths[0];
}

export function getPublicSlug(slug) {
  const normalized = normalizeSlug(slug);
  return normalized === "designed" ? "designed-experience" : normalized;
}
