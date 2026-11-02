"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DnaHelix } from "@/components/brand/DnaHelix";
import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";

const FLIP_DELAY_MS = 650;

/**
 * Flips the card from a DNA-patterned back to its face, with a particle
 * burst. Tapping flips immediately; reduced motion shows the face at once.
 */
export function CardReveal({
  archetypeId,
  width,
  height,
  children,
}: {
  archetypeId: ArchetypeId;
  width: number;
  height: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const flipped = revealed || !!reduce;
  const { primary, secondary, deep } = ARCHETYPES[archetypeId].colors;

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setRevealed(true), FLIP_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <div className="relative" style={{ width, height, perspective: 1400 }} onClick={() => setRevealed(true)}>
      {flipped && !reduce ? <Burst colors={[primary, secondary, "#fff"]} /> : null}
      <motion.div
        className="relative size-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={reduce ? false : { rotateY: 180, scale: 0.92 }}
        animate={{ rotateY: flipped ? 0 : 180, scale: flipped ? 1 : 0.92 }}
        transition={{ type: "spring", stiffness: 70, damping: 14 }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          {children}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `radial-gradient(circle at 50% 40%, ${primary}55, ${deep} 70%)`,
            boxShadow: `0 0 0 1px ${primary}66`,
          }}
        >
          <DnaHelix width={110} height={Math.round(height * 0.5)} rungs={12} colors={[primary, secondary, "#ffffff"]} />
          <span className="font-display text-lg font-bold tracking-wide">AI DNA</span>
        </div>
      </motion.div>
    </div>
  );
}

function Burst({ colors }: { colors: string[] }) {
  const particles = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2;
    const dist = 140 + (i % 4) * 40;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: colors[i % colors.length]!, size: 6 + (i % 3) * 3 };
  });
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center" aria-hidden="true">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
        />
      ))}
    </div>
  );
}
