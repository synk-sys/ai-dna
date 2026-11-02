"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Loader2, Share2, X } from "lucide-react";
import { CARD_SIZE, PersonalityCard, type CardLayout } from "@/components/card/PersonalityCard";
import { Button } from "@/components/ui/button";
import { cardFileName, renderCardPng } from "@/lib/card/export";
import { downloadBlob, isInAppBrowser, shareCardImage, shareLink, shareText, shareUrl } from "@/lib/card/share";
import type { StoredResult } from "@/lib/client/results";

const LAYOUTS: CardLayout[] = ["portrait", "square"];
const PREWARM_DELAY_MS = 1500;

type Busy = "download" | "share" | null;

/**
 * Download and share buttons for the attendee's card. Renders full-bleed
 * export copies of the card off screen and turns them into PNGs.
 *
 * The PNG for the visible layout is generated in the background shortly after
 * the page loads, so tapping Share can call the native share sheet right
 * away. iOS Safari rejects share calls made too long after the tap.
 */
export function ShareActions({ result, layout }: { result: StoredResult; layout: CardLayout }) {
  const nodes = useRef<Partial<Record<CardLayout, HTMLDivElement | null>>>({});
  const cache = useRef(new Map<CardLayout, Promise<Blob>>());
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const getBlob = useCallback((l: CardLayout) => {
    const cached = cache.current.get(l);
    if (cached) return cached;
    const node = nodes.current[l];
    if (!node) return Promise.reject(new Error("Card not mounted"));
    const pending = renderCardPng(node, l);
    cache.current.set(l, pending);
    pending.catch(() => cache.current.delete(l));
    return pending;
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      getBlob(layout).catch(() => {
        // Retried on demand when the attendee taps a button.
      });
    }, PREWARM_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [layout, getBlob]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fileName = cardFileName(result.primary, layout);

  async function onDownload() {
    setBusy("download");
    setMessage(null);
    try {
      const blob = await getBlob(layout);
      if (isInAppBrowser(navigator.userAgent)) {
        setPreview(URL.createObjectURL(blob));
      } else {
        downloadBlob(blob, fileName);
        setMessage({ text: "Card saved! Check your downloads or photos." });
      }
    } catch (err) {
      console.error("Card export failed", err);
      setMessage({ text: "We couldn't create your image. Please try again.", error: true });
    } finally {
      setBusy(null);
    }
  }

  async function onShare() {
    setBusy("share");
    setMessage(null);
    try {
      let outcome = "unsupported";
      try {
        const blob = await getBlob(layout);
        outcome = await shareCardImage(blob, fileName, result.primary);
      } catch (err) {
        console.warn("Image share failed, falling back to link", err);
      }
      if (outcome === "unsupported") outcome = await shareLink(result.primary);
      if (outcome === "unsupported") {
        await navigator.clipboard.writeText(`${shareText(result.primary)} ${shareUrl()}`.trim());
        setMessage({ text: "Copied! Paste it anywhere, then download your card to attach it." });
      } else if (outcome === "shared") {
        setMessage({ text: "Thanks for sharing your AI DNA!" });
      }
    } catch (err) {
      console.error("Share failed", err);
      setMessage({ text: "Sharing isn't available here. Try downloading your card instead.", error: true });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="w-full max-w-[360px] space-y-2">
      <div className="grid grid-cols-2 gap-2.5">
        <Button size="lg" onClick={onDownload} disabled={busy !== null} className="px-4">
          {busy === "download" ? <Loader2 className="animate-spin" /> : <Download />}
          Download
        </Button>
        <Button size="lg" variant="secondary" onClick={onShare} disabled={busy !== null} className="px-4">
          {busy === "share" ? <Loader2 className="animate-spin" /> : <Share2 />}
          Share
        </Button>
      </div>
      <p
        aria-live="polite"
        className={message?.error ? "text-center text-sm text-destructive" : "text-center text-xs text-muted-foreground"}
      >
        {message?.text}
      </p>

      {/* Off-screen, full-bleed copies used only for image export. */}
      <div aria-hidden="true" className="pointer-events-none fixed top-0 -left-[10000px]" inert>
        {LAYOUTS.map((l) => (
          <PersonalityCard
            key={l}
            ref={(el) => {
              nodes.current[l] = el;
            }}
            archetypeId={result.primary}
            nickname={result.nickname}
            description={result.personalizedDescription}
            layout={l}
            still
            bleed
          />
        ))}
      </div>

      {preview ? <SavePreview src={preview} layout={layout} onClose={() => setPreview(null)} /> : null}
    </div>
  );
}

/** Full-screen image so people in in-app browsers can press and hold to save. */
function SavePreview({ src, layout, onClose }: { src: string; layout: CardLayout; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const { width, height } = CARD_SIZE[layout];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save your card"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 p-4"
    >
      <button
        ref={close}
        onClick={onClose}
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 rounded-full p-2 text-muted-foreground hover:text-foreground"
        aria-label="Close"
      >
        <X className="size-6" />
      </button>
      <p className="text-center font-medium">Press and hold the image to save it</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL, not optimizable */}
      <img
        src={src}
        alt="Your AI DNA card"
        width={width}
        height={height}
        className="h-auto max-h-[75dvh] w-auto max-w-full rounded-xl"
      />
    </div>
  );
}
