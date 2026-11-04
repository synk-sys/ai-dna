/**
 * Event branding. Organizers can override any of these with NEXT_PUBLIC_*
 * env vars at build time without touching code. No official Google or GDG
 * assets are bundled; drop licensed logos into /public/brand and point
 * NEXT_PUBLIC_EVENT_LOGO at them if you have permission to use them.
 */
export const EVENT = {
  name: process.env.NEXT_PUBLIC_EVENT_NAME ?? "DevFest Toronto 2026",
  shortName: process.env.NEXT_PUBLIC_EVENT_SHORT_NAME ?? "DevFest Toronto",
  city: process.env.NEXT_PUBLIC_EVENT_CITY ?? "Toronto",
  logoUrl: process.env.NEXT_PUBLIC_EVENT_LOGO ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  hashtag: process.env.NEXT_PUBLIC_EVENT_HASHTAG ?? "#DevFestToronto",
} as const;

/** Bump when the privacy notice changes; stored with each participant. */
export const CONSENT_VERSION = "2026-11-v2";

/** Google-inspired accent colors, used sparingly for event chrome. */
export const EVENT_ACCENTS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"] as const;
