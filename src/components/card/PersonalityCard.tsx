import { forwardRef, type CSSProperties } from "react";
import { ArchetypeArt } from "@/components/art/ArchetypeArt";
import { EVENT } from "@/lib/config/event";
import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";
import { cn } from "@/lib/utils";
import "./card.css";

export type CardLayout = "portrait" | "square";

/** Intrinsic design size in CSS pixels. Exports scale these up to 1080px wide. */
export const CARD_SIZE: Record<CardLayout, { width: number; height: number }> = {
  portrait: { width: 360, height: 640 },
  square: { width: 400, height: 400 },
};

/** Frame outlines, drawn in export pixels. */
const FRAMES: Record<CardLayout, { viewBox: string; paths: [string, string] }> = {
  portrait: {
    viewBox: "0 0 1080 1920",
    paths: [
      "M64 22H1016Q1016 64 1058 64V1856Q1016 1856 1016 1898H64Q64 1856 22 1856V64Q64 64 64 22Z",
      "M76 36H1004Q1004 76 1044 76V1844Q1004 1844 1004 1884H76Q76 1844 36 1844V76Q76 76 76 36Z",
    ],
  },
  square: {
    viewBox: "0 0 1080 1080",
    paths: [
      "M64 22H1016Q1016 64 1058 64V1016Q1016 1016 1016 1058H64Q64 1016 22 1016V64Q64 64 64 22Z",
      "M76 36H1004Q1004 76 1044 76V1004Q1004 1004 1004 1044H76Q76 1004 36 1004V76Q76 76 76 36Z",
    ],
  },
};

export interface PersonalityCardProps {
  archetypeId: ArchetypeId;
  nickname?: string;
  description: string;
  layout?: CardLayout;
  className?: string;
}

/**
 * The collectible card. Rendered at a fixed design size so it looks
 * identical on screen and in exported PNGs; wrap in <ScaledCard> to fit it to
 * the viewport.
 */
export const PersonalityCard = forwardRef<HTMLDivElement, PersonalityCardProps>(function PersonalityCard(
  { archetypeId, nickname, description, layout = "portrait", className },
  ref,
) {
  const a = ARCHETYPES[archetypeId];
  const size = CARD_SIZE[layout];
  const frame = FRAMES[layout];
  const style = {
    width: size.width,
    height: size.height,
    "--dna-accent": a.colors.accent,
    "--dna-surface": a.colors.surface,
  } as CSSProperties;

  return (
    <div ref={ref} data-card-layout={layout} className={cn("dna-card", className)} style={style}>
      <svg className="dna-card__frame" viewBox={frame.viewBox} preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d={frame.paths[0]} />
        <path d={frame.paths[1]} />
      </svg>
      <div className="dna-card__content">
        <header className="dna-card__header">
          <p className="dna-card__event">{EVENT.name}</p>
          <p className="dna-card__owner">{nickname ? `${nickname} AI DNA` : "Your AI DNA"}</p>
        </header>
        <div className="dna-card__hero">
          <div className="dna-card__artwork">
            <ArchetypeArt id={archetypeId} size="full" />
          </div>
          <div className="dna-card__identity">
            <h2 className="dna-card__title" aria-label={a.name}>
              <span className="dna-card__prefix">The </span>
              <span>{a.name.replace(/^The /, "")}</span>
            </h2>
            <p className="dna-card__subtitle">{a.identity}</p>
            <p className="dna-card__description">{description}</p>
          </div>
        </div>
        <ul className="dna-card__traits" aria-label="Strengths">
          {a.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="dna-card__insights">
          <section className="dna-card__insight" aria-label="Superpower">
            <h3>
              <span aria-hidden="true">⚡</span> Superpower
            </h3>
            <p>{a.superpower}</p>
          </section>
          <section className="dna-card__insight" aria-label="Plot twist">
            <h3>
              <span aria-hidden="true">😅</span> Plot twist
            </h3>
            <p>{a.weakness}</p>
          </section>
        </div>
      </div>
    </div>
  );
});
