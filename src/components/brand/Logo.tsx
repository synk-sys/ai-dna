import { cn } from "@/lib/utils";
import { EVENT, EVENT_ACCENTS } from "@/lib/config/event";

/** Small static DNA strand mark in Google-inspired colors. */
export function DnaMark({ className }: { className?: string }) {
  const rungs = [0, 1, 2, 3, 4, 5, 6];
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden="true">
      {rungs.map((i) => {
        const y = 4 + i * 5.3;
        const phase = (i / rungs.length) * Math.PI * 2;
        const x1 = 12 + Math.sin(phase) * 8;
        const x2 = 12 - Math.sin(phase) * 8;
        const color = EVENT_ACCENTS[i % EVENT_ACCENTS.length];
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
            <circle cx={x1} cy={y} r="2.2" fill={color} />
            <circle cx={x2} cy={y} r="2.2" fill="white" fillOpacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      <DnaMark className="h-7 w-auto" />
      <span>
        AI <span className="text-gradient-google">DNA</span>
      </span>
    </span>
  );
}

export function EventBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/90",
        className,
      )}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {EVENT_ACCENTS.map((c) => (
          <span key={c} className="size-1.5 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </span>
      {EVENT.name}
    </span>
  );
}
