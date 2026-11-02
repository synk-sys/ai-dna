import { ARCHETYPE_IDS, ARCHETYPES, type ArchetypeId } from "./archetypes";
import { OPTION_INDEX, QUESTIONS } from "./questions";

/**
 * Deterministic AI DNA scoring. No randomness and no LLM involvement:
 * the same answers always produce the same personality.
 *
 * Bump SCORING_VERSION whenever weights, question content or tie-breaking
 * change. It is stored with every result.
 *
 * Points: the chosen option gives PRIMARY_POINTS to its primary archetype
 * and RELATED_POINTS to its related archetype.
 *
 * Ranking (highest first), applied in order until archetypes differ:
 *   1. Total points.
 *   2. Direct picks: points from primary choices. With equal totals this is
 *      the same as preferring the archetype with fewer related ("secondary")
 *      points, so an archetype you chose directly beats one you only
 *      brushed against.
 *   3. Most recent direct pick: the archetype you chose directly in the
 *      latest question wins (later questions are more reflective).
 *   4. Fallback: canonical order in ARCHETYPE_IDS. Only reachable with
 *      partial answers, which submission validation rejects.
 */

export const SCORING_VERSION = "2026.1";
export const PRIMARY_POINTS = 3;
export const RELATED_POINTS = 1;

/** Map of question id to chosen option id. */
export type Answers = Record<string, string>;

export interface ArchetypeScore {
  total: number;
  direct: number;
  related: number;
  /** Index of the latest question where this archetype was picked directly, or -1. */
  lastDirectPick: number;
}

export type TieBreak = "none" | "directPicks" | "mostRecentPick" | "canonicalOrder";

export interface ScoreResult {
  scoringVersion: string;
  scores: Record<ArchetypeId, ArchetypeScore>;
  ranking: ArchetypeId[];
  primary: ArchetypeId;
  secondary: ArchetypeId;
  /** Which rule decided first place. */
  tieBreak: TieBreak;
}

export class InvalidAnswersError extends Error {}

/** Throws InvalidAnswersError unless every question has exactly one valid answer. */
export function assertCompleteAnswers(answers: Answers): void {
  const keys = Object.keys(answers);
  if (keys.length !== QUESTIONS.length) {
    throw new InvalidAnswersError(`Expected ${QUESTIONS.length} answers, got ${keys.length}`);
  }
  for (const q of QUESTIONS) {
    const optionId = answers[q.id];
    const option = optionId === undefined ? undefined : OPTION_INDEX.get(optionId);
    if (!option || option.questionId !== q.id) {
      throw new InvalidAnswersError(`Invalid answer for ${q.id}`);
    }
  }
}

function emptyScores(): Record<ArchetypeId, ArchetypeScore> {
  return Object.fromEntries(
    ARCHETYPE_IDS.map((id) => [id, { total: 0, direct: 0, related: 0, lastDirectPick: -1 }]),
  ) as Record<ArchetypeId, ArchetypeScore>;
}

export function tallyScores(answers: Answers): Record<ArchetypeId, ArchetypeScore> {
  const scores = emptyScores();
  for (const optionId of Object.values(answers)) {
    const option = OPTION_INDEX.get(optionId);
    if (!option) continue;
    const p = scores[option.primary];
    p.total += PRIMARY_POINTS;
    p.direct += PRIMARY_POINTS;
    p.lastDirectPick = Math.max(p.lastDirectPick, option.questionIndex);
    const r = scores[option.related];
    r.total += RELATED_POINTS;
    r.related += RELATED_POINTS;
  }
  return scores;
}

function compare(
  a: ArchetypeId,
  b: ArchetypeId,
  scores: Record<ArchetypeId, ArchetypeScore>,
): { order: number; rule: TieBreak } {
  const sa = scores[a];
  const sb = scores[b];
  if (sa.total !== sb.total) return { order: sb.total - sa.total, rule: "none" };
  if (sa.direct !== sb.direct) return { order: sb.direct - sa.direct, rule: "directPicks" };
  if (sa.lastDirectPick !== sb.lastDirectPick) {
    return { order: sb.lastDirectPick - sa.lastDirectPick, rule: "mostRecentPick" };
  }
  return { order: ARCHETYPE_IDS.indexOf(a) - ARCHETYPE_IDS.indexOf(b), rule: "canonicalOrder" };
}

export function rankArchetypes(scores: Record<ArchetypeId, ArchetypeScore>): ArchetypeId[] {
  return [...ARCHETYPE_IDS].sort((a, b) => compare(a, b, scores).order);
}

/** Score a complete answer set. Throws InvalidAnswersError for incomplete or invalid answers. */
export function scoreAnswers(answers: Answers): ScoreResult {
  assertCompleteAnswers(answers);
  const scores = tallyScores(answers);
  const ranking = rankArchetypes(scores);
  const [primary, secondary] = ranking as [ArchetypeId, ArchetypeId, ...ArchetypeId[]];
  return {
    scoringVersion: SCORING_VERSION,
    scores,
    ranking,
    primary,
    secondary,
    tieBreak: compare(primary, secondary, scores).rule,
  };
}

/**
 * Predefined description used when AI personalization is off or fails.
 * Mixes the primary description with a nod to the runner-up archetype.
 */
export function fallbackDescription(primary: ArchetypeId, secondary: ArchetypeId): string {
  const p = ARCHETYPES[primary];
  const s = ARCHETYPES[secondary];
  const secondaryName = s.name.replace(/^The /, "");
  return `${p.description} Comes with a ${secondaryName} streak: ${s.blendTrait}.`;
}
