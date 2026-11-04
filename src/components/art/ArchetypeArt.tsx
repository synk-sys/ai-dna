import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";

/**
 * Persona artwork. `full` is the 1080px image used on cards and exports;
 * `thumb` is the 480px image for galleries and small tiles.
 */
export function ArchetypeArt({
  id,
  className,
  size = "thumb",
}: {
  id: ArchetypeId;
  className?: string;
  size?: "thumb" | "full";
}) {
  const { artworkPath, artworkAlt } = ARCHETYPES[id];
  const px = size === "full" ? 1080 : 480;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- already sized webp; exports need the plain same-origin file
    <img
      src={size === "full" ? artworkPath : artworkPath.replace("-1080.", "-480.")}
      alt={artworkAlt}
      width={px}
      height={px}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
