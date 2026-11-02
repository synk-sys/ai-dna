import { describe, expect, it, vi } from "vitest";
import { firstUnanswered, loadProgress, saveProgress, startProgress } from "./progress";
import { loadResult, localSubmitter } from "./results";
import { CONSENT_VERSION } from "@/lib/config/event";

const answers = {
  q1: "q1-creator",
  q2: "q2-creator",
  q3: "q3-creator",
  q4: "q4-strategist",
  q5: "q5-creator",
  q6: "q6-builder",
};

describe("quiz progress", () => {
  it("round-trips through storage", () => {
    const p = startProgress("Ada");
    saveProgress({ ...p, answers: { q1: "q1-builder" } });
    const loaded = loadProgress();
    expect(loaded?.nickname).toBe("Ada");
    expect(loaded?.seed).toBe(p.seed);
    expect(loaded?.answers).toEqual({ q1: "q1-builder" });
    expect(firstUnanswered(loaded!.answers)).toBe(1);
  });

  it("drops answers that don't belong to their question", () => {
    const p = startProgress("");
    saveProgress({ ...p, answers: { q1: "q2-builder", q2: "q2-explorer", q9: "x" } });
    expect(loadProgress()?.answers).toEqual({ q2: "q2-explorer" });
  });

  it("ignores progress saved by another scoring version", () => {
    const p = startProgress("");
    saveProgress({ ...p, scoringVersion: "1999.0" });
    expect(loadProgress()).toBeNull();
  });

  it("ignores corrupted storage", () => {
    window.localStorage.setItem("aidna:progress", "{not json");
    expect(loadProgress()).toBeNull();
  });

  it("keeps working when storage throws", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    expect(() => startProgress("x")).not.toThrow();
    spy.mockRestore();
  });
});

describe("localSubmitter", () => {
  const submission = { submissionId: "abcdef0123456789abcd", nickname: " Ada ", answers, consentVersion: CONSENT_VERSION };

  it("scores and stores the result with the scoring version", async () => {
    const r = await localSubmitter.submit(submission);
    expect(r.primary).toBe("creator");
    expect(r.nickname).toBe("Ada");
    expect(r.scoringVersion).toBeTruthy();
    expect(loadResult()).toEqual(r);
  });

  it("is idempotent for duplicate submissions", async () => {
    const first = await localSubmitter.submit(submission);
    await new Promise((r) => setTimeout(r, 5));
    const second = await localSubmitter.submit({ ...submission, answers: { ...answers, q1: "q1-builder" } });
    expect(second).toEqual(first);
  });

  it("rejects invalid submissions", async () => {
    await expect(localSubmitter.submit({ ...submission, answers: { q1: "q1-builder" } } as never)).rejects.toThrow();
    expect(loadResult()).toBeNull();
  });
});
