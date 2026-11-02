"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyzingSequence } from "./AnalyzingSequence";
import { clearProgress, firstUnanswered, loadProgress, saveProgress, startProgress, type QuizProgress } from "@/lib/client/progress";
import { localSubmitter, type ResultSubmitter, type StoredResult } from "@/lib/client/results";
import { EVENT_ACCENTS } from "@/lib/config/event";
import { QUESTIONS } from "@/lib/quiz/questions";
import { seededShuffle } from "@/lib/quiz/shuffle";
import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const ADVANCE_DELAY_MS = 320;

type Status = "loading" | "question" | "submitting" | "error";

export function QuizFlow({ submitter = localSubmitter }: { submitter?: ResultSubmitter }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<StoredResult | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | undefined>(undefined);

  const submit = useCallback(
    async (p: QuizProgress) => {
      setStatus("submitting");
      setResult(null);
      try {
        const r = await submitter.submit({
          submissionId: p.seed,
          nickname: p.nickname,
          answers: p.answers,
          consentVersion: p.consentVersion,
        });
        setResult(r);
      } catch (err) {
        console.error("Submission failed", err);
        setStatus("error");
      }
    },
    [submitter],
  );

  useEffect(() => {
    const p = loadProgress() ?? startProgress("");
    setProgress(p);
    const next = firstUnanswered(p.answers);
    if (next >= QUESTIONS.length) {
      setIndex(QUESTIONS.length - 1);
      void submit(p);
    } else {
      setIndex(next);
      setStatus("question");
    }
    router.prefetch("/result");
    return () => window.clearTimeout(advanceTimer.current);
  }, [router, submit]);

  useEffect(() => {
    if (status === "question") headingRef.current?.focus({ preventScroll: true });
  }, [index, status]);

  const question = QUESTIONS[index]!;
  const options = useMemo(
    () => (progress ? seededShuffle(question.options, `${progress.seed}:${question.id}`) : question.options),
    [progress, question],
  );

  function choose(optionId: string) {
    if (!progress || pending) return;
    const updated: QuizProgress = { ...progress, answers: { ...progress.answers, [question.id]: optionId } };
    setProgress(updated);
    saveProgress(updated);
    setPending(optionId);
    advanceTimer.current = window.setTimeout(() => {
      setPending(null);
      if (index < QUESTIONS.length - 1) setIndex(index + 1);
      else void submit(updated);
    }, reduce ? 120 : ADVANCE_DELAY_MS);
  }

  function back() {
    if (index > 0 && !pending) setIndex(index - 1);
  }

  const finish = useCallback(() => {
    clearProgress();
    router.replace("/result");
  }, [router]);

  if (status === "loading" || !progress) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (status === "submitting") {
    return <AnalyzingSequence ready={!!result} onDone={finish} />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="font-display text-2xl font-bold">We couldn&apos;t sequence your DNA</p>
        <p className="max-w-xs text-muted-foreground">
          Your answers are saved on this device. Check your connection and try again.
        </p>
        <Button size="lg" onClick={() => void submit(progress)}>
          <RefreshCw /> Try again
        </Button>
      </div>
    );
  }

  const selected = pending ?? progress.answers[question.id];

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="flex items-center gap-3 pt-[max(1rem,env(safe-area-inset-top))]">
        {index > 0 ? (
          <Button variant="ghost" size="icon" onClick={back} aria-label="Previous question">
            <ArrowLeft />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back to start">
              <ArrowLeft />
            </Link>
          </Button>
        )}
        <ProgressStrand current={index} answered={Object.keys(progress.answers).length} />
        <span className="w-11 text-right text-sm font-medium text-muted-foreground tabular-nums">
          {index + 1}/{QUESTIONS.length}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-6 flex flex-1 flex-col"
          aria-labelledby={`${question.id}-heading`}
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Question {index + 1}
          </p>
          <h1
            id={`${question.id}-heading`}
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-[26px] leading-tight font-bold text-balance outline-none"
          >
            {question.prompt}
          </h1>

          <div role="radiogroup" aria-labelledby={`${question.id}-heading`} className="mt-6 flex flex-col gap-2.5">
            {options.map((o, i) => {
              const isSelected = selected === o.id;
              return (
                <motion.button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-option-id={o.id}
                  onClick={() => choose(o.id)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.2 }}
                  className={cn(
                    "group flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] leading-snug transition-[background-color,border-color,box-shadow,transform] active:scale-[0.99]",
                    isSelected
                      ? "border-white/60 bg-white/15 shadow-[0_0_0_1px_rgb(255_255_255/0.4),0_0_30px_-6px_rgb(138_180_248/0.8)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.08]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      isSelected ? "bg-white text-background" : "bg-white/10 text-white/80",
                    )}
                  >
                    {isSelected ? <Check className="size-4" /> : LETTERS[i]}
                  </span>
                  <span>{o.text}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </AnimatePresence>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        No wrong answers. Pick what feels most like you.
      </p>
    </div>
  );
}

/** Six-segment progress bar styled as DNA base pairs. */
function ProgressStrand({ current, answered }: { current: number; answered: number }) {
  return (
    <div
      className="flex flex-1 items-center gap-1.5"
      role="progressbar"
      aria-label="Quiz progress"
      aria-valuemin={0}
      aria-valuemax={QUESTIONS.length}
      aria-valuenow={answered}
    >
      {QUESTIONS.map((q, i) => {
        const done = i < answered || i < current;
        const color = EVENT_ACCENTS[i % EVENT_ACCENTS.length];
        return (
          <span key={q.id} className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color, originX: 0 }}
              initial={false}
              animate={{ scaleX: done ? 1 : i === current ? 0.35 : 0, opacity: done ? 1 : 0.7 }}
              transition={{ duration: 0.3 }}
            />
          </span>
        );
      })}
    </div>
  );
}
