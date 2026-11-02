import { isArchetypeId, type ArchetypeId } from "@/lib/quiz/archetypes";
import { fallbackDescription, scoreAnswers, type ArchetypeScore } from "@/lib/quiz/scoring";
import { submissionSchema, type Submission } from "@/lib/quiz/schema";
import { isRecord, readJson, removeKey, writeJson } from "./storage";

/** What the attendee's device keeps about their own result. */
export interface StoredResult {
  v: 1;
  submissionId: string;
  nickname: string;
  primary: ArchetypeId;
  secondary: ArchetypeId;
  scores: Record<ArchetypeId, ArchetypeScore>;
  personalizedDescription: string;
  scoringVersion: string;
  completedAt: number;
  /** True once the server has confirmed the result. Always false in local mock mode. */
  synced: boolean;
}

const KEY = "aidna:result";

function isStoredResult(value: unknown): value is StoredResult {
  return (
    isRecord(value) &&
    value.v === 1 &&
    typeof value.submissionId === "string" &&
    typeof value.nickname === "string" &&
    isArchetypeId(value.primary) &&
    isArchetypeId(value.secondary) &&
    isRecord(value.scores) &&
    typeof value.personalizedDescription === "string" &&
    typeof value.completedAt === "number"
  );
}

export function loadResult(): StoredResult | null {
  return readJson(KEY, isStoredResult);
}

export function clearResult(): void {
  removeKey(KEY);
}

/**
 * Submits a finished quiz. Phase 1 scores locally and stores the result on
 * the device; Phase 2 replaces `submitter` with a server call that rescores
 * authoritatively and persists to Firestore.
 *
 * Idempotent: resubmitting the same submissionId returns the stored result.
 */
export interface ResultSubmitter {
  submit(submission: Submission): Promise<StoredResult>;
}

export const localSubmitter: ResultSubmitter = {
  async submit(input) {
    const submission = submissionSchema.parse(input);
    const existing = loadResult();
    if (existing?.submissionId === submission.submissionId) return existing;

    const scored = scoreAnswers(submission.answers);
    const result: StoredResult = {
      v: 1,
      submissionId: submission.submissionId,
      nickname: submission.nickname,
      primary: scored.primary,
      secondary: scored.secondary,
      scores: scored.scores,
      personalizedDescription: fallbackDescription(scored.primary, scored.secondary),
      scoringVersion: scored.scoringVersion,
      completedAt: Date.now(),
      synced: false,
    };
    writeJson(KEY, result);
    return result;
  },
};
