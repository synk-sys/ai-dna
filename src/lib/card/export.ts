import { CARD_SIZE, type CardLayout } from "@/components/card/PersonalityCard";
import type { ArchetypeId } from "@/lib/quiz/archetypes";

/** Exported images are 1080px wide: 1080×1920 for stories, 1080×1080 square. */
export const EXPORT_WIDTH = 1080;

const ARTWORK_TIMEOUT_MS = 15_000;

export function exportSize(layout: CardLayout) {
  const { width, height } = CARD_SIZE[layout];
  const scale = EXPORT_WIDTH / width;
  return { width: Math.round(width * scale), height: Math.round(height * scale), scale };
}

export function cardFileName(archetypeId: ArchetypeId, layout: CardLayout): string {
  return `ai-dna-${archetypeId}-${layout === "portrait" ? "story" : "square"}.png`;
}

/**
 * Waits for the card's artwork, rejecting if it can't load. Without this a
 * dropped connection would silently export a card with no art. An image that
 * already failed is re-requested under a fresh URL, because Safari won't retry
 * the same one, so tapping again can recover.
 */
async function artworkReady(node: HTMLElement): Promise<void> {
  const loaded = Promise.all(
    Array.from(node.querySelectorAll("img"), (img) => {
      if (img.complete && img.naturalWidth === 0) {
        const url = new URL(img.src);
        url.searchParams.set("retry", String(Date.now()));
        img.src = url.href;
      }
      return img.decode();
    }),
  );
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error("Card artwork timed out")), ARTWORK_TIMEOUT_MS);
  });
  try {
    await Promise.race([loaded, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Renders a card element to a PNG blob at export resolution. The DOM-to-image
 * library is loaded on demand so it doesn't weigh down the first paint.
 */
export async function renderCardPng(node: HTMLElement, layout: CardLayout): Promise<Blob> {
  const { domToBlob } = await import("modern-screenshot");
  if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
  await artworkReady(node);
  const { scale } = exportSize(layout);
  const blob = await domToBlob(node, {
    scale,
    type: "image/png",
    backgroundColor: "#070b1d",
    timeout: 15000,
  });
  if (!blob || blob.size === 0) throw new Error("Card export produced an empty image");
  return blob;
}
