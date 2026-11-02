import { CONSENT_VERSION } from "@/lib/config/event";
import { OPTION_INDEX, QUESTIONS } from "@/lib/quiz/questions";
import { SCORING_VERSION } from "@/lib/quiz/scoring";
import { newSeed } from "@/lib/quiz/shuffle";
import { isRecord, readJson, removeKey, writeJson } from "./storage";

/** In-progress quiz state, saved after every answer so a refresh resumes. */
export interface QuizProgress {
  v: 1;
  scoringVersion: string;
  /** Seed for answer shuffling; also used as the idempotent submission id. */
  seed: string;
  nickname: string;
  consentVersion: string;
  answers: Record<string, string>;
  startedAt: number;
}

const KEY = "aidna:progress";

function isProgress(value: unknown): value is QuizProgress {
  return (
    isRecord(value) &&
    value.v === 1 &&
    typeof value.seed === "string" &&
    typeof value.nickname === "string" &&
    typeof value.consentVersion === "string" &&
    typeof value.scoringVersion === "string" &&
    typeof value.startedAt === "number" &&
    isRecord(value.answers)
  );
}

/** Drop answers that no longer match the current question set. */
function cleanAnswers(answers: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [questionId, optionId] of Object.entries(answers)) {
    if (typeof optionId === "string" && OPTION_INDEX.get(optionId)?.questionId === questionId) {
      out[questionId] = optionId;
    }
  }
  return out;
}

export function loadProgress(): QuizProgress | null {
  const saved = readJson(KEY, isProgress);
  if (!saved || saved.scoringVersion !== SCORING_VERSION) return null;
  return { ...saved, answers: cleanAnswers(saved.answers) };
}

export function saveProgress(progress: QuizProgress): void {
  writeJson(KEY, progress);
}

export function clearProgress(): void {
  removeKey(KEY);
}

export function startProgress(nickname: string): QuizProgress {
  const progress: QuizProgress = {
    v: 1,
    scoringVersion: SCORING_VERSION,
    seed: newSeed() + newSeed(),
    nickname,
    consentVersion: CONSENT_VERSION,
    answers: {},
    startedAt: Date.now(),
  };
  saveProgress(progress);
  return progress;
}

/** Index of the first unanswered question, or QUESTIONS.length when complete. */
export function firstUnanswered(answers: Record<string, string>): number {
  const index = QUESTIONS.findIndex((q) => !answers[q.id]);
  return index === -1 ? QUESTIONS.length : index;
}
