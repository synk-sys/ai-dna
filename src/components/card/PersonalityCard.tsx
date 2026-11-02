import { forwardRef, type CSSProperties } from "react";
import { ArchetypeArt } from "@/components/art/ArchetypeArt";
import { DnaMark } from "@/components/brand/Logo";
import { EVENT, EVENT_ACCENTS } from "@/lib/config/event";
import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";
import { cn } from "@/lib/utils";

export type CardLayout = "portrait" | "square";

/** Intrinsic design size in CSS pixels. Exports scale these up to 1080px wide. */
export const CARD_SIZE: Record<CardLayout, { width: number; height: number }> = {
  portrait: { width: 360, height: 640 },
  square: { width: 400, height: 400 },
};

export interface PersonalityCardProps {
  archetypeId: ArchetypeId;
  nickname?: string;
  description: string;
  layout?: CardLayout;
  /** Disable SVG animation (exports, reduced motion). */
  still?: boolean;
  /** Square corners and no outer glow, for full-bleed image exports. */
  bleed?: boolean;
  className?: string;
}

function ownerLine(nickname?: string) {
  return nickname ? `${nickname}'s AI DNA` : "My AI DNA";
}

/**
 * The collectible card. Rendered at a fixed design size so it looks
 * identical on screen and in exported PNGs; wrap in <ScaledCard> to fit it to
 * the viewport.
 */
export const PersonalityCard = forwardRef<HTMLDivElement, PersonalityCardProps>(function PersonalityCard(
  { archetypeId, nickname, description, layout = "portrait", still = false, bleed = false, className },
  ref,
) {
  const a = ARCHETYPES[archetypeId];
  const { primary, secondary, deep } = a.colors;
  const size = CARD_SIZE[layout];
  const style: CSSProperties = {
    width: size.width,
    height: size.height,
    background: `radial-gradient(120% 80% at 50% 0%, ${primary}40, transparent 60%), linear-gradient(165deg, ${deep} 0%, #070b1d 70%)`,
    boxShadow: bleed ? undefined : `0 0 0 1px ${primary}66, 0 30px 80px -20px ${primary}88`,
  };
  const shell = cn(
    "relative flex flex-col gap-3 overflow-hidden p-5 font-sans text-white",
    bleed ? "rounded-none" : "rounded-[28px]",
    className,
  );

  const header = (
    <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.14em] uppercase text-white/80">
      <span className="flex items-center gap-1.5">
        <span className="flex gap-[3px]" aria-hidden="true">
          {EVENT_ACCENTS.map((c) => (
            <span key={c} className="size-[5px] rounded-full" style={{ backgroundColor: c }} />
          ))}
        </span>
        {EVENT.name}
      </span>
      <span className="flex items-center gap-1 font-display text-[11px] tracking-normal normal-case text-white">
        <DnaMark className="h-4 w-auto" />
        AI DNA
      </span>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-end text-[10px] text-white/70">
      <span>{EVENT.siteUrl ? EVENT.siteUrl.replace(/^https?:\/\//, "") : EVENT.hashtag}</span>
    </div>
  );

  const strengths = (
    <ul className={cn("flex flex-wrap gap-1.5", layout === "portrait" && "justify-center")}>
      {a.strengths.map((s) => (
        <li
          key={s}
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{ background: `${primary}22`, color: primary, border: `1px solid ${primary}55` }}
        >
          {s}
        </li>
      ))}
    </ul>
  );

  const traits = (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl p-2.5" style={{ background: `${primary}1f`, border: `1px solid ${primary}40` }}>
        <div className="text-[9px] font-bold tracking-[0.14em] uppercase" style={{ color: primary }}>
          ⚡ Superpower
        </div>
        <p className="mt-1 text-[11px] leading-snug text-white/90">{a.superpower}</p>
      </div>
      <div className="rounded-xl p-2.5" style={{ background: "rgb(255 255 255 / 0.06)", border: "1px solid rgb(255 255 255 / 0.12)" }}>
        <div className="text-[9px] font-bold tracking-[0.14em] uppercase text-white/70">😅 Funny weakness</div>
        <p className="mt-1 text-[11px] leading-snug text-white/90">{a.weakness}</p>
      </div>
    </div>
  );

  if (layout === "square") {
    return (
      <div
        ref={ref}
        data-card-layout="square"
        className={shell}
        style={style}
      >
        {header}
        <div className="flex items-center gap-4">
          <div className="relative size-[132px] shrink-0 overflow-hidden rounded-2xl" style={{ boxShadow: `0 0 0 2px ${primary}88` }}>
            <ArchetypeArt id={archetypeId} still={still} className="size-full" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium text-white/70">{ownerLine(nickname)}</div>
            <div className="font-display text-[26px] leading-[1.05] font-bold">
              <span aria-hidden="true">{a.emoji} </span>
              {a.name}
            </div>
            <div className="mt-1 text-[12px] font-medium" style={{ color: secondary }}>
              {a.identity}
            </div>
          </div>
        </div>
        <p className="text-[12px] leading-snug text-white/85">{description}</p>
        {strengths}
        {traits}
        <div className="mt-auto">{footer}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-card-layout="portrait"
      className={shell}
      style={style}
    >
      {header}
      <div className="relative aspect-[4/3.3] w-full overflow-hidden rounded-2xl" style={{ boxShadow: `0 0 0 2px ${primary}88, 0 0 40px -6px ${primary}` }}>
        <ArchetypeArt id={archetypeId} still={still} fit="cover" className="size-full" />
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: `linear-gradient(to top, ${deep}, transparent)` }}
          aria-hidden="true"
        />
        <span
          className="absolute top-2.5 right-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase"
          style={{ background: primary, color: a.colors.onPrimary }}
        >
          AI Personality
        </span>
      </div>
      <div className="text-center">
        <div className="truncate text-[11px] font-medium text-white/70">{ownerLine(nickname)}</div>
        <div className="font-display text-[30px] leading-tight font-bold">
          <span aria-hidden="true">{a.emoji} </span>
          {a.name}
        </div>
        <div className="text-[12px] font-medium" style={{ color: secondary }}>
          {a.identity}
        </div>
      </div>
      <p className="text-center text-[12px] leading-snug text-white/85">{description}</p>
      {strengths}
      {traits}
      <div className="mt-auto">{footer}</div>
    </div>
  );
});
