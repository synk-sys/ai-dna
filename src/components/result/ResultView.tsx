"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { RotateCcw, Users } from "lucide-react";
import { ArchetypeArt } from "@/components/art/ArchetypeArt";
import { CARD_SIZE, PersonalityCard, type CardLayout } from "@/components/card/PersonalityCard";
import { ScaledCard } from "@/components/card/ScaledCard";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { CardReveal } from "./CardReveal";
import { ShareActions } from "./ShareActions";
import { clearProgress } from "@/lib/client/progress";
import { EVENT } from "@/lib/config/event";
import { clearResult, loadResult, type StoredResult } from "@/lib/client/results";
import { ARCHETYPES, COMPLEMENTS } from "@/lib/quiz/archetypes";
import { rankArchetypes } from "@/lib/quiz/scoring";
import { cn } from "@/lib/utils";

export function ResultView() {
  const router = useRouter();
  const [result, setResult] = useState<StoredResult | null | undefined>(undefined);
  const [layout, setLayout] = useState<CardLayout>("portrait");

  useEffect(() => {
    setResult(loadResult());
  }, []);

  if (result === undefined) {
    return <PageShell className="items-center justify-center text-muted-foreground">Loading…</PageShell>;
  }

  if (result === null) {
    return (
      <PageShell className="items-center justify-center gap-4 text-center">
        <p className="font-display text-2xl font-bold">No AI DNA on this device yet</p>
        <p className="max-w-xs text-muted-foreground">Take the six-question quiz to discover your personality.</p>
        <Button asChild size="lg">
          <Link href="/">
            Discover my AI DNA
          </Link>
        </Button>
      </PageShell>
    );
  }

  const a = ARCHETYPES[result.primary];
  const second = ARCHETYPES[result.secondary];
  const complement = ARCHETYPES[COMPLEMENTS[result.primary]];
  const size = CARD_SIZE[layout];
  const ranking = rankArchetypes(result.scores);
  const maxTotal = Math.max(...ranking.map((id) => result.scores[id].total), 1);

  function retake() {
    clearResult();
    clearProgress();
    router.push("/");
  }

  return (
    <PageShell tint={a.colors.primary} className="gap-8 pb-10">
      <section className="pt-2 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">Your AI DNA is</p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="mt-1 font-display text-4xl font-bold"
          style={{ color: a.colors.primary }}
        >
          <span aria-hidden="true">{a.emoji} </span>
          {a.name}
        </motion.h1>
      </section>

      <section aria-label="Your collectible card" className="flex flex-col items-center gap-4">
        <div role="tablist" aria-label="Card format" className="glass inline-flex rounded-full p-1 text-sm">
          {(["portrait", "square"] as const).map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={layout === l}
              onClick={() => setLayout(l)}
              className={cn(
                "rounded-full px-4 py-1.5 font-medium transition-colors",
                layout === l ? "bg-white text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l === "portrait" ? "Story" : "Square"}
            </button>
          ))}
        </div>
        <ScaledCard width={size.width} height={size.height}>
          <CardReveal key={layout} archetypeId={result.primary} width={size.width} height={size.height}>
            <PersonalityCard
              archetypeId={result.primary}
              nickname={result.nickname}
              description={result.personalizedDescription}
              layout={layout}
            />
          </CardReveal>
        </ScaledCard>
        <ShareActions result={result} layout={layout} />
      </section>

      <section className="glass space-y-4 rounded-3xl p-5">
        <div>
          <h2 className="font-display text-xl font-bold">{a.identity}</h2>
          <p className="mt-1 text-muted-foreground">{result.personalizedDescription}</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Strengths">
          {a.strengths.map((s) => (
            <li
              key={s}
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{ background: `${a.colors.primary}22`, color: a.colors.primary, border: `1px solid ${a.colors.primary}55` }}
            >
              {s}
            </li>
          ))}
        </ul>
        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="font-semibold">⚡ Superpower</dt>
            <dd className="text-muted-foreground">{a.superpower}</dd>
          </div>
          <div>
            <dt className="font-semibold">😅 Plot twist</dt>
            <dd className="text-muted-foreground">{a.weakness}</dd>
          </div>
        </dl>
      </section>

      <section className="glass rounded-3xl p-5" aria-labelledby="mix-heading">
        <h2 id="mix-heading" className="font-display text-lg font-bold">
          Your DNA mix
        </h2>
        <p className="text-sm text-muted-foreground">
          Mostly {a.name.replace("The ", "")}, with a {second.name.replace("The ", "")} streak.
        </p>
        <ul className="mt-4 space-y-2.5">
          {ranking.map((id, i) => {
            const arch = ARCHETYPES[id];
            const pct = Math.round((result.scores[id].total / maxTotal) * 100);
            return (
              <li key={id} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate">
                  <span aria-hidden="true">{arch.emoji} </span>
                  {arch.name.replace("The ", "")}
                </span>
                <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${arch.colors.primary}, ${arch.colors.secondary})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 1 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                  />
                </span>
                <span className="sr-only">{result.scores[id].total} points</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="glass flex items-center gap-4 rounded-3xl p-5" aria-labelledby="complement-heading">
        <div className="size-20 shrink-0 overflow-hidden rounded-2xl" style={{ boxShadow: `0 0 0 1px ${complement.colors.primary}88` }}>
          <ArchetypeArt id={complement.id} className="size-full" />
        </div>
        <div>
          <h2 id="complement-heading" className="flex items-center gap-1.5 font-display font-bold">
            <Users className="size-4" /> Find your complement
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {a.name} and {complement.name} make a great team. Find {complement.emoji} {complement.name.replace("The ", "")}{" "}
            cards around {EVENT.shortName} and say hi!
          </p>
        </div>
      </section>

      <div className="space-y-3 text-center">
        <Button variant="ghost" onClick={retake}>
          <RotateCcw /> Retake the quiz
        </Button>
        <p className="text-xs text-muted-foreground">
          Just for fun: a reflection of your quiz answers, not a scientific psychological assessment.
        </p>
      </div>
    </PageShell>
  );
}
