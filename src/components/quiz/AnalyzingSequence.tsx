"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DnaHelix } from "@/components/brand/DnaHelix";
import { Button } from "@/components/ui/button";

const LINES = [
  "Sequencing your curiosity genes…",
  "Mapping your builder instincts…",
  "Decoding creative chromosomes…",
  "Measuring your big-picture radius…",
  "Aligning your AI DNA…",
];

const MIN_DURATION_MS = 2800;
const REDUCED_DURATION_MS = 700;

/**
 * Short celebratory "analysis". Purely cosmetic: the result is already
 * computed, and a Skip button appears as soon as it's ready so the sequence
 * never blocks anyone from their card.
 */
export function AnalyzingSequence({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const total = reduce ? REDUCED_DURATION_MS : MIN_DURATION_MS;
    const t = window.setTimeout(() => setElapsed(true), total);
    const i = window.setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), total / LINES.length);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(i);
    };
  }, [reduce]);

  useEffect(() => {
    if (ready && elapsed) onDone();
  }, [ready, elapsed, onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center" aria-live="polite">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle,rgb(138_180_248/0.35),transparent_65%)] blur-2xl" />
        <DnaHelix width={130} height={300} rungs={16} speed={1.6} />
      </div>
      <div className="h-16">
        <p className="font-display text-2xl font-bold">Analyzing your AI DNA</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            {LINES[line]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="h-11">
        {ready ? (
          <Button variant="ghost" size="sm" onClick={onDone}>
            Skip to my result
          </Button>
        ) : null}
      </div>
    </div>
  );
}
