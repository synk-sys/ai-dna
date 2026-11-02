import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { scoreAnswers } from "./scoring";
import { hashString, seededShuffle } from "./shuffle";

describe("seededShuffle", () => {
  const options = QUESTIONS[0]!.options;

  it("returns the same order for the same seed", () => {
    expect(seededShuffle(options, "abc:q1")).toEqual(seededShuffle(options, "abc:q1"));
  });

  it("keeps every option exactly once", () => {
    const shuffled = seededShuffle(options, "seed-1");
    expect(shuffled.map((o) => o.id).sort()).toEqual(options.map((o) => o.id).sort());
  });

  it("does not mutate its input", () => {
    const before = options.map((o) => o.id);
    seededShuffle(options, "seed-2");
    expect(options.map((o) => o.id)).toEqual(before);
  });

  it("produces different orders across seeds", () => {
    const orders = new Set(
      Array.from({ length: 50 }, (_, i) => seededShuffle(options, `s${i}`).map((o) => o.primary).join()),
    );
    expect(orders.size).toBeGreaterThan(30);
  });

  it("puts each archetype first roughly equally often", () => {
    const firsts: Record<string, number> = {};
    const n = 6000;
    for (let i = 0; i < n; i++) {
      const first = seededShuffle(options, `seed-${i}`)[0]!.primary;
      firsts[first] = (firsts[first] ?? 0) + 1;
    }
    for (const count of Object.values(firsts)) expect(Math.abs(count - n / 6)).toBeLessThan(n / 6 * 0.15);
  });

  it("does not change scoring: same choices score identically whatever the display order", () => {
    const pickIndex = 2;
    const answersFor = (seed: string) =>
      Object.fromEntries(
        QUESTIONS.map((q) => {
          // Choose the option with a fixed primary, wherever it was displayed.
          const shuffled = seededShuffle(q.options, `${seed}:${q.id}`);
          const chosen = shuffled.find((o) => o.primary === q.options[pickIndex]!.primary)!;
          return [q.id, chosen.id];
        }),
      );
    expect(scoreAnswers(answersFor("one"))).toEqual(scoreAnswers(answersFor("two")));
  });
});

describe("hashString", () => {
  it("is stable", () => {
    expect(hashString("ai-dna")).toBe(hashString("ai-dna"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});
