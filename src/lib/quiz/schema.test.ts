import { describe, expect, it } from "vitest";
import { NICKNAME_MAX, nicknameSchema, sanitizeNickname, submissionSchema } from "./schema";

describe("sanitizeNickname", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeNickname("   Ada    Lovelace  ")).toBe("Ada Lovelace");
  });

  it("strips markup and control characters", () => {
    expect(sanitizeNickname("<script>alert(1)</script>")).toBe("scriptalert(1)/script");
    expect(sanitizeNickname("Ada\u0000‮Z")).toBe("AdaZ");
  });

  it("caps length without splitting emoji", () => {
    const long = "👩‍💻".repeat(30);
    const out = sanitizeNickname(long);
    expect(out).toBe("👩‍💻".repeat(NICKNAME_MAX));
  });

  it("caps plain text at the limit", () => {
    expect(Array.from(sanitizeNickname("x".repeat(100)))).toHaveLength(NICKNAME_MAX);
  });
});

describe("nicknameSchema", () => {
  it("allows an empty nickname", () => {
    expect(nicknameSchema.parse("   ")).toBe("");
  });

  it("rejects punctuation-only nicknames", () => {
    expect(nicknameSchema.safeParse("!!!").success).toBe(false);
  });

  it("accepts unicode names", () => {
    expect(nicknameSchema.parse("Zoë 🚀")).toBe("Zoë 🚀");
  });
});

describe("submissionSchema", () => {
  const valid = {
    submissionId: "abcdefghijklmnop1234",
    nickname: "Sam",
    consentVersion: "2026-11",
    answers: {
      q1: "q1-builder",
      q2: "q2-builder",
      q3: "q3-builder",
      q4: "q4-builder",
      q5: "q5-builder",
      q6: "q6-builder",
    },
  };

  it("accepts a valid submission", () => {
    expect(submissionSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects extra fields", () => {
    expect(submissionSchema.safeParse({ ...valid, isAdmin: true }).success).toBe(false);
  });

  it("rejects options from the wrong question", () => {
    expect(submissionSchema.safeParse({ ...valid, answers: { ...valid.answers, q2: "q1-builder" } }).success).toBe(
      false,
    );
  });

  it("rejects missing answers", () => {
    const { q6: _q6, ...rest } = valid.answers;
    expect(submissionSchema.safeParse({ ...valid, answers: rest }).success).toBe(false);
  });
});
