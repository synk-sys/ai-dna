import { EVENT } from "@/lib/config/event";
import { ARCHETYPES, type ArchetypeId } from "@/lib/quiz/archetypes";

export type ShareOutcome = "shared" | "cancelled" | "unsupported";

export function shareText(archetypeId: ArchetypeId): string {
  const a = ARCHETYPES[archetypeId];
  return `My AI DNA is ${a.name} ${a.emoji}. ${a.superpower} Discover yours at ${EVENT.name} ${EVENT.hashtag}`;
}

export function shareUrl(): string {
  if (EVENT.siteUrl) return EVENT.siteUrl;
  return typeof window === "undefined" ? "" : window.location.origin;
}

/**
 * Shares the card image through the native share sheet when the browser can
 * share files. Returns "unsupported" so callers can fall back to download.
 */
export async function shareCardImage(
  blob: Blob,
  fileName: string,
  archetypeId: ArchetypeId,
  nav: Navigator = navigator,
): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: "image/png" });
  const data: ShareData = { files: [file], title: "My AI DNA", text: shareText(archetypeId) };
  if (typeof nav.share !== "function" || typeof nav.canShare !== "function" || !nav.canShare({ files: [file] })) {
    return "unsupported";
  }
  try {
    await nav.share(data);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    throw err;
  }
}

/** Shares just text and a link, for browsers that can't share files. */
export async function shareLink(archetypeId: ArchetypeId, nav: Navigator = navigator): Promise<ShareOutcome> {
  const data: ShareData = { title: "Discover your AI DNA", text: shareText(archetypeId), url: shareUrl() };
  if (typeof nav.share !== "function") return "unsupported";
  try {
    await nav.share(data);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    throw err;
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser time to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/**
 * In-app browsers (Instagram, Facebook, LinkedIn, etc.) often silently ignore
 * downloads. For those we show the image so people can press-and-hold to save.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|Instagram|LinkedInApp|Line\/|Twitter|Snapchat|TikTok|MicroMessenger|; wv\)/i.test(userAgent);
}
