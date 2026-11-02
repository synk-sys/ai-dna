"use client";

import { motion, useReducedMotion } from "motion/react";
import { EVENT_ACCENTS } from "@/lib/config/event";

interface DnaHelixProps {
  rungs?: number;
  width?: number;
  height?: number;
  colors?: readonly string[];
  className?: string;
  /** Seconds for one full twist. */
  speed?: number;
}

/** Animated double helix. Freezes into a static strand for reduced motion. */
export function DnaHelix({
  rungs = 14,
  width = 120,
  height = 320,
  colors = EVENT_ACCENTS,
  className,
  speed = 2.4,
}: DnaHelixProps) {
  const reduce = useReducedMotion();
  const amp = width / 2 - 8;
  const cx = width / 2;
  const gap = (height - 16) / (rungs - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden="true">
      {Array.from({ length: rungs }, (_, i) => {
        const y = 8 + i * gap;
        const phase = (i / rungs) * Math.PI * 2;
        const color = colors[i % colors.length]!;
        const left = cx + Math.sin(phase) * amp;
        const right = cx - Math.sin(phase) * amp;
        if (reduce) {
          return (
            <g key={i}>
              <line x1={left} y1={y} x2={right} y2={y} stroke="white" strokeOpacity="0.2" strokeWidth="2" />
              <circle cx={left} cy={y} r="5" fill={color} />
              <circle cx={right} cy={y} r="5" fill="white" fillOpacity="0.85" />
            </g>
          );
        }
        const delay = -(i / rungs) * speed;
        const transition = { duration: speed, repeat: Infinity, ease: "easeInOut" as const, delay };
        return (
          <g key={i}>
            <motion.line
              y1={y}
              y2={y}
              stroke="white"
              strokeOpacity={0.2}
              strokeWidth={2}
              initial={{ x1: cx - amp, x2: cx + amp }}
              animate={{ x1: [cx - amp, cx + amp, cx - amp], x2: [cx + amp, cx - amp, cx + amp] }}
              transition={transition}
            />
            <motion.circle
              cy={y}
              r={5}
              fill={color}
              initial={{ cx: cx - amp }}
              animate={{ cx: [cx - amp, cx + amp, cx - amp], r: [5, 3.5, 5] }}
              transition={transition}
            />
            <motion.circle
              cy={y}
              r={5}
              fill="white"
              fillOpacity={0.85}
              initial={{ cx: cx + amp }}
              animate={{ cx: [cx + amp, cx - amp, cx + amp], r: [3.5, 5, 3.5] }}
              transition={transition}
            />
          </g>
        );
      })}
    </svg>
  );
}
