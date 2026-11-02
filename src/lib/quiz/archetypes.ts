/**
 * The six AI DNA personalities. This file is the single source of truth for
 * archetype copy and palettes; Phase 2 seeds the `archetypes` Firestore
 * collection from it.
 *
 * Every archetype is written to be equally desirable. Keep copy parallel in
 * tone and length when editing.
 */

export const ARCHETYPE_IDS = [
  "visionary",
  "builder",
  "explorer",
  "creator",
  "strategist",
  "connector",
] as const;

export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export interface ArchetypePalette {
  /** Main accent used for headings, rings and glows. */
  primary: string;
  /** Second accent used in gradients. */
  secondary: string;
  /** Deep background tone for the card. */
  deep: string;
  /** Readable text color on top of `primary`. */
  onPrimary: string;
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  emoji: string;
  identity: string;
  description: string;
  strengths: [string, string, string];
  superpower: string;
  weakness: string;
  /** Short trait phrase used when blending with a primary archetype. */
  blendTrait: string;
  colors: ArchetypePalette;
  artworkPath: string;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  visionary: {
    id: "visionary",
    name: "The Visionary",
    emoji: "🔮",
    identity: "The big-picture thinker",
    description:
      "Imagines what AI could make possible and sees opportunities others miss.",
    strengths: ["Imagination", "Future thinking", "Spotting opportunities"],
    superpower: "Sees tomorrow before everyone else finishes today.",
    weakness: "Has 47 revolutionary ideas and no idea where to start.",
    blendTrait: "a habit of picturing what comes next",
    colors: { primary: "#A78BFA", secondary: "#E879F9", deep: "#1E0B4B", onPrimary: "#14062F" },
    artworkPath: "/art/visionary.svg",
  },
  builder: {
    id: "builder",
    name: "The Builder",
    emoji: "🛠️",
    identity: "The hands-on problem solver",
    description:
      "Turns ambitious ideas into useful things through experimentation.",
    strengths: ["Execution", "Resourcefulness", "Learning by doing"],
    superpower: 'Turns "what if" into "it works."',
    weakness: 'Says "just one more feature" at 2 AM.',
    blendTrait: "an itch to make ideas real",
    colors: { primary: "#60A5FA", secondary: "#22D3EE", deep: "#071D45", onPrimary: "#04122B" },
    artworkPath: "/art/builder.svg",
  },
  explorer: {
    id: "explorer",
    name: "The Explorer",
    emoji: "🔍",
    identity: "The endlessly curious mind",
    description:
      "Loves discovering new things and asking questions nobody else considers.",
    strengths: ["Curiosity", "Research", "Adaptability"],
    superpower: "Finds fascinating answers to questions nobody thought to ask.",
    weakness: "Opens one article and ends up with 83 browser tabs.",
    blendTrait: "a curiosity that never clocks out",
    colors: { primary: "#34D399", secondary: "#2DD4BF", deep: "#032E2A", onPrimary: "#021B18" },
    artworkPath: "/art/explorer.svg",
  },
  creator: {
    id: "creator",
    name: "The Creator",
    emoji: "🎨",
    identity: "The imaginative storyteller",
    description:
      "Uses AI to create stories, visuals, experiences, and original ideas.",
    strengths: ["Creativity", "Communication", "Originality"],
    superpower: "Turns ordinary ideas into extraordinary experiences.",
    weakness: "Spends 40 minutes choosing the exact shade of blue.",
    blendTrait: "a flair for making things memorable",
    colors: { primary: "#FB7185", secondary: "#E879F9", deep: "#3D0A2A", onPrimary: "#2A0519" },
    artworkPath: "/art/creator.svg",
  },
  strategist: {
    id: "strategist",
    name: "The Strategist",
    emoji: "🧠",
    identity: "The thoughtful decision maker",
    description:
      "Finds patterns, evaluates options, and uses AI to make smarter decisions.",
    strengths: ["Analysis", "Planning", "Critical thinking"],
    superpower: "Finds clarity where everyone else sees chaos.",
    weakness: "Creates a spreadsheet to decide which movie to watch.",
    blendTrait: "a knack for seeing the pattern",
    colors: { primary: "#818CF8", secondary: "#93C5FD", deep: "#12103D", onPrimary: "#0A0826" },
    artworkPath: "/art/strategist.svg",
  },
  connector: {
    id: "connector",
    name: "The Connector",
    emoji: "🤝",
    identity: "The people-first collaborator",
    description:
      "Brings people together and uses AI to help communities succeed.",
    strengths: ["Empathy", "Communication", "Collaboration"],
    superpower: "Turns strangers into collaborators.",
    weakness: "Starts a group chat for absolutely everything.",
    blendTrait: "an instinct for bringing people along",
    colors: { primary: "#FBBF24", secondary: "#FDE68A", deep: "#3A1C02", onPrimary: "#261200" },
    artworkPath: "/art/connector.svg",
  },
};

export function isArchetypeId(value: unknown): value is ArchetypeId {
  return typeof value === "string" && (ARCHETYPE_IDS as readonly string[]).includes(value);
}

/**
 * Pairs that complement each other well, used for the optional
 * "find your complementary attendees" prompt on the result page.
 */
export const COMPLEMENTS: Record<ArchetypeId, ArchetypeId> = {
  visionary: "builder",
  builder: "visionary",
  explorer: "strategist",
  strategist: "explorer",
  creator: "connector",
  connector: "creator",
};
