import { describe, expect, it } from "vitest";
import { ARCHETYPE_IDS, type ArchetypeId } from "./archetypes";
import { QUESTIONS } from "./questions";
import {
  InvalidAnswersError,
  SCORING_VERSION,
  fallbackDescription,
  scoreAnswers,
  type Answers,
} from "./scoring";

/** Build answers by picking, for each question, the option whose primary is given. */
function pick(...primaries: ArchetypeId[]): Answers {
  return Object.fromEntries(
    QUESTIONS.map((q, i) => {
      const option = q.options.find((o) => o.primary === primaries[i]);
      if (!option) throw new Error(`no option for ${primaries[i]}`);
      return [q.id, option.id];
    }),
  );
}

describe("question balance", () => {
  it("has six questions with six options each", () => {
    expect(QUESTIONS).toHaveLength(6);
    for (const q of QUESTIONS) expect(q.options).toHaveLength(6);
  });

  it("gives every archetype exactly one primary option per question", () => {
    for (const q of QUESTIONS) {
      expect(q.options.map((o) => o.primary).sort()).toEqual([...ARCHETYPE_IDS].sort());
    }
  });

  it("makes related targets a self-free permutation in every question", () => {
    for (const q of QUESTIONS) {
      expect(q.options.map((o) => o.related).sort()).toEqual([...ARCHETYPE_IDS].sort());
      for (const o of q.options) expect(o.related).not.toBe(o.primary);
    }
  });

  it("uses unique option ids", () => {
    const ids = QUESTIONS.flatMap((q) => q.options.map((o) => o.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("scoreAnswers", () => {
  it.each(ARCHETYPE_IDS)("returns %s when it is picked every time", (id) => {
    const result = scoreAnswers(pick(id, id, id, id, id, id));
    expect(result.primary).toBe(id);
    expect(result.scores[id].total).toBe(18);
    expect(result.tieBreak).toBe("none");
    expect(result.scoringVersion).toBe(SCORING_VERSION);
  });

  it("awards 3 points to the primary and 1 to the related archetype", () => {
    const result = scoreAnswers(pick("visionary", "builder", "explorer", "creator", "strategist", "connector"));
    const totals = ARCHETYPE_IDS.map((id) => result.scores[id].total);
    expect(totals.reduce((a, b) => a + b, 0)).toBe(6 * 4);
    for (const id of ARCHETYPE_IDS) expect(result.scores[id].direct).toBe(3);
  });

  it("ignores the order answers are stored in", () => {
    const answers = pick("creator", "builder", "creator", "explorer", "strategist", "creator");
    const reversed = Object.fromEntries(Object.entries(answers).reverse());
    expect(scoreAnswers(reversed)).toEqual(scoreAnswers(answers));
  });

  it("returns a secondary archetype different from the primary", () => {
    const result = scoreAnswers(pick("builder", "builder", "builder", "explorer", "explorer", "builder"));
    expect(result.primary).toBe("builder");
    expect(result.secondary).not.toBe("builder");
  });

  it("rejects incomplete answers", () => {
    const answers = pick("visionary", "visionary", "visionary", "visionary", "visionary", "visionary");
    delete answers.q6;
    expect(() => scoreAnswers(answers)).toThrow(InvalidAnswersError);
  });

  it("rejects an option from the wrong question", () => {
    const answers = pick("visionary", "visionary", "visionary", "visionary", "visionary", "visionary");
    answers.q1 = "q2-visionary";
    expect(() => scoreAnswers(answers)).toThrow(InvalidAnswersError);
  });

  it("rejects unknown option ids", () => {
    const answers = pick("visionary", "visionary", "visionary", "visionary", "visionary", "visionary");
    answers.q3 = "q3-wizard";
    expect(() => scoreAnswers(answers)).toThrow(InvalidAnswersError);
  });
});

describe("tie-breaking", () => {
  it("prefers direct picks when totals tie", () => {
    // Visionary: 3 direct picks = 9.
    // Creator: 2 direct picks (q4, q6) = 6, plus related from q1/q2 visionary and q5 builder = 9.
    const r = scoreAnswers(pick("visionary", "visionary", "visionary", "creator", "builder", "creator"));
    expect(r.scores.visionary.total).toBe(9);
    expect(r.scores.creator.total).toBe(9);
    expect(r.primary).toBe("visionary");
    expect(r.secondary).toBe("creator");
    expect(r.tieBreak).toBe("directPicks");
  });

  it("falls back to the most recent direct pick for an exact tie", () => {
    // Builder picked q1, q2, q3 and Strategist picked q4, q5, q6: both get 9 direct.
    // Related: q1/q4 builder→strategist, q5 strategist→builder, q2/q3 builder→explorer/connector, q6 strategist→explorer.
    const answers = pick("builder", "strategist", "strategist", "builder", "builder", "strategist");
    const r = scoreAnswers(answers);
    expect(r.scores.builder.total).toBe(r.scores.strategist.total);
    expect(r.scores.builder.direct).toBe(r.scores.strategist.direct);
    expect(r.primary).toBe("strategist"); // strategist picked at q6, the latest question
    expect(r.secondary).toBe("builder");
    expect(r.tieBreak).toBe("mostRecentPick");
  });

  it("swaps the winner when the latest pick swaps", () => {
    const answers = pick("strategist", "builder", "builder", "strategist", "strategist", "builder");
    const r = scoreAnswers(answers);
    expect(r.scores.builder.total).toBe(r.scores.strategist.total);
    expect(r.primary).toBe("builder");
  });
});

describe("exhaustive permutations", () => {
  // 6^6 = 46,656 possible answer sets. Cheap enough to check them all.
  const all: ArchetypeId[][] = [];
  const walk = (prefix: ArchetypeId[]) => {
    if (prefix.length === 6) return void all.push(prefix);
    for (const id of ARCHETYPE_IDS) walk([...prefix, id]);
  };
  walk([]);

  const counts = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0])) as Record<ArchetypeId, number>;
  const tieRules = new Set<string>();
  for (const combo of all) {
    const r = scoreAnswers(pick(...combo));
    counts[r.primary]++;
    tieRules.add(r.tieBreak);
  }

  it("covers every possible answer set", () => {
    expect(all).toHaveLength(46656);
  });

  it("produces every archetype as a primary result", () => {
    for (const id of ARCHETYPE_IDS) expect(counts[id]).toBeGreaterThan(0);
  });

  it("gives every archetype an equal share of possible answer sets", () => {
    // Each related mapping is a permutation, so the structure is close to
    // symmetric. Require every archetype to be within 2% of the mean.
    const mean = all.length / ARCHETYPE_IDS.length;
    for (const id of ARCHETYPE_IDS) {
      expect(Math.abs(counts[id] - mean) / mean).toBeLessThan(0.02);
    }
  });

  it("exercises each tie-break rule but never needs the canonical fallback", () => {
    expect(tieRules).toContain("directPicks");
    expect(tieRules).toContain("mostRecentPick");
    expect(tieRules.has("canonicalOrder")).toBe(false);
  });

  it("is deterministic", () => {
    const sample = all[12345]!;
    expect(scoreAnswers(pick(...sample))).toEqual(scoreAnswers(pick(...sample)));
  });
});

describe("fallbackDescription", () => {
  it("mentions the secondary archetype", () => {
    const text = fallbackDescription("builder", "creator");
    expect(text).toContain("Creator streak");
    expect(text.split(/\s+/).length).toBeLessThanOrEqual(40);
  });

  it("stays under 40 words for every pair", () => {
    for (const p of ARCHETYPE_IDS) {
      for (const s of ARCHETYPE_IDS) {
        if (p === s) continue;
        expect(fallbackDescription(p, s).split(/\s+/).length).toBeLessThanOrEqual(40);
      }
    }
  });
});
