import type { ArchetypeId } from "./archetypes";

/**
 * Quiz content. Option ids are stable scoring identifiers: the display order
 * is shuffled per attendee, but scoring only ever looks at `id`.
 *
 * Each option awards 3 points to `primary` and 1 point to `related`.
 * For every question the `related` targets form a permutation of all six
 * archetypes with no archetype related to itself, so every archetype can earn
 * exactly 6 primary-picks worth of points and 6 related points across the
 * quiz. `questions.test.ts` enforces this balance.
 */

export interface QuizOption {
  id: string;
  text: string;
  primary: ArchetypeId;
  related: ArchetypeId;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

function opt(q: string, text: string, primary: ArchetypeId, related: ArchetypeId): QuizOption {
  return { id: `${q}-${primary}`, text, primary, related };
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "You have an AI assistant for an entire day. What sounds most exciting?",
    options: [
      opt("q1", "Imagine a future that does not exist yet.", "visionary", "creator"),
      opt("q1", "Build something useful from scratch.", "builder", "strategist"),
      opt("q1", "Explore a topic I know nothing about.", "explorer", "visionary"),
      opt("q1", "Create a story, image, or experience.", "creator", "explorer"),
      opt("q1", "Solve a difficult real-world problem.", "strategist", "connector"),
      opt("q1", "Help a group of people achieve a shared goal.", "connector", "builder"),
    ],
  },
  {
    id: "q2",
    prompt: "Your team faces a challenge nobody has solved. What is your first move?",
    options: [
      opt("q2", "Rethink what is possible.", "visionary", "creator"),
      opt("q2", "Make a small prototype.", "builder", "explorer"),
      opt("q2", "Ask questions and investigate.", "explorer", "connector"),
      opt("q2", "Find an unconventional creative approach.", "creator", "visionary"),
      opt("q2", "Break the problem into smaller parts.", "strategist", "builder"),
      opt("q2", "Bring different perspectives together.", "connector", "strategist"),
    ],
  },
  {
    id: "q3",
    prompt: "Which AI-powered project would you most enjoy?",
    options: [
      opt("q3", "Imagining a better future city.", "visionary", "strategist"),
      opt("q3", "Making an everyday task easier.", "builder", "connector"),
      opt("q3", "Discovering something surprising.", "explorer", "visionary"),
      opt("q3", "Creating an interactive story.", "creator", "explorer"),
      opt("q3", "Helping people make better decisions.", "strategist", "builder"),
      opt("q3", "Making learning accessible to everyone.", "connector", "creator"),
    ],
  },
  {
    id: "q4",
    prompt: "Your friends would most likely describe you as...",
    options: [
      opt("q4", "Someone who dreams big.", "visionary", "creator"),
      opt("q4", "Someone who gets things done.", "builder", "strategist"),
      opt("q4", "Someone who asks great questions.", "explorer", "visionary"),
      opt("q4", "Someone with original ideas.", "creator", "connector"),
      opt("q4", "Someone who thinks things through.", "strategist", "explorer"),
      opt("q4", "Someone who brings people together.", "connector", "builder"),
    ],
  },
  {
    id: "q5",
    prompt: "You are learning a completely new AI tool. What do you do first?",
    options: [
      opt("q5", "Imagine its biggest possibilities.", "visionary", "connector"),
      opt("q5", "Try making something immediately.", "builder", "creator"),
      opt("q5", "Explore every feature.", "explorer", "strategist"),
      opt("q5", "Experiment with creative outputs.", "creator", "visionary"),
      opt("q5", "Compare its capabilities and limitations.", "strategist", "builder"),
      opt("q5", "Find ways to use it with others.", "connector", "explorer"),
    ],
  },
  {
    id: "q6",
    prompt: "What would make you proudest of something you created with AI?",
    options: [
      opt("q6", "It inspired people to think bigger.", "visionary", "creator"),
      opt("q6", "It solved a practical problem.", "builder", "strategist"),
      opt("q6", "It revealed something new.", "explorer", "visionary"),
      opt("q6", "It made people feel something.", "creator", "connector"),
      opt("q6", "It helped someone make a better choice.", "strategist", "explorer"),
      opt("q6", "It brought people closer together.", "connector", "builder"),
    ],
  },
];

export const OPTION_INDEX: ReadonlyMap<string, QuizOption & { questionId: string; questionIndex: number }> =
  new Map(
    QUESTIONS.flatMap((q, questionIndex) =>
      q.options.map((o) => [o.id, { ...o, questionId: q.id, questionIndex }] as const),
    ),
  );
