import { z } from "zod";
import { OPTION_INDEX, QUESTIONS } from "./questions";

export const NICKNAME_MAX = 24;

/**
 * Normalize a nickname: NFKC, strip control/format characters and markup
 * characters, collapse whitespace, trim, and cap length by graphemes so
 * emoji are never split in half. Zero-width joiners are kept for emoji
 * sequences like 👩‍💻.
 */
export function sanitizeNickname(raw: string): string {
  const cleaned = raw
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Co}\p{Cn}]|(?!‍)\p{Cf}/gu, "")
    .replace(/[<>`{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const graphemes =
    typeof Intl.Segmenter === "function"
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(cleaned), (s) => s.segment)
      : Array.from(cleaned);
  return graphemes.slice(0, NICKNAME_MAX).join("").trim();
}

export const nicknameSchema = z
  .string()
  .max(200)
  .transform(sanitizeNickname)
  .refine((v) => v.length === 0 || /[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(v), {
    message: "Nickname needs at least one letter, number or emoji",
  });

const answersShape = Object.fromEntries(
  QUESTIONS.map((q) => [
    q.id,
    z.string().refine((id) => OPTION_INDEX.get(id)?.questionId === q.id, "Unknown option"),
  ]),
) as Record<string, z.ZodType<string>>;

export const answersSchema = z.strictObject(answersShape);

/** Shape of a quiz submission. Validated on the client now and on the server in Phase 2. */
export const submissionSchema = z.strictObject({
  /** Client-generated id that makes retries idempotent. */
  submissionId: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
  nickname: nicknameSchema,
  answers: answersSchema,
  consentVersion: z.string().min(1).max(32),
});

export type Submission = z.infer<typeof submissionSchema>;
