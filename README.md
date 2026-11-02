# AI DNA: Discover Your AI Personality

A mobile-first personality quiz and collectible card experience for **DevFest Toronto 2026**. Attendees scan a QR code, answer six questions, and get one of six AI personalities on a shareable card.

> Just for fun: results reflect quiz preferences, not a scientific psychological assessment.

## Quick start

```sh
npm install
cp .env.example .env.local   # optional: branding overrides
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Vitest unit and component tests |
| `npm run test:e2e` | Playwright tests on mobile Chrome and mobile Safari (builds and starts the app) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | oxlint |

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui conventions · Motion · Zod · Vitest + Testing Library. Firebase (Auth, Firestore, App Hosting, Admin SDK) and optional Gemini arrive in later phases.

## Project layout

```
src/
  app/                    Routes: / (landing), /quiz, /result, /privacy
  components/
    art/ArchetypeArt.tsx  Six original SVG illustrations
    brand/                Logo, animated DNA helix, backdrop
    card/                 PersonalityCard (portrait 360×640, square 400×400), ScaledCard
    quiz/                 QuizFlow, AnalyzingSequence
    result/               ResultView, CardReveal, ShareActions (download and share)
    ui/                   shadcn-style primitives
  lib/
    quiz/                 Archetypes, questions, scoring, shuffle, Zod schemas (pure, framework-free)
    client/               Device storage: in-progress answers and the attendee's result
    card/                 PNG export (modern-screenshot) and Web Share helpers
    config/event.ts       Replaceable event branding
e2e/                      Playwright tests: full flow, refresh recovery, PNG export, sharing, mobile layout
```

## Scoring

All scoring is deterministic and lives in [src/lib/quiz/scoring.ts](src/lib/quiz/scoring.ts). No LLM is involved in choosing a personality.

- Each answer gives **3 points** to its primary archetype and **1 point** to a related archetype.
- In every question, each archetype is the primary of exactly one option and the related target of exactly one option, never its own. Every archetype therefore has identical scoring opportunities (18 primary, 6 related). Tests enforce this.
- Answer order is shuffled per attendee with a seeded PRNG. The seed is saved, so a refresh keeps the same order. Scoring only uses option IDs.
- **Tie-breaking**, applied in order:
  1. Highest total.
  2. More points from direct picks. With equal totals, this is the same as fewer related (secondary) points.
  3. The archetype picked directly in the most recent question.
  4. Fallback: canonical order (`visionary, builder, explorer, creator, strategist, connector`). This is only reachable with partial answers, which validation rejects.
- `SCORING_VERSION` (currently `2026.1`) is stored with every result. Bump it whenever questions, weights or tie-breaking change.

An exhaustive test scores all 46,656 possible answer sets. Each archetype wins between 7,715 and 7,806 of them, within 2% of the even split.

## Reliability notes (attendee side)

- Answers are saved to `localStorage` after every tap, so a refresh or dropped connection resumes at the same question.
- Submissions carry a client-generated idempotency key (the session seed), so retries never create duplicates.
- The reveal animation is cosmetic. The result is computed first, a "Skip" button appears as soon as it is ready, and reduced-motion users get a near-instant reveal.

## Card download and sharing

- **Download** renders a hidden, full-bleed copy of the card to PNG in the browser: 1080×1920 for Stories, 1080×1080 for Square. No server round trip is needed, so it works on flaky event Wi-Fi.
- **Share** opens the native share sheet with the PNG attached. The image is pre-rendered about 1.5s after the result appears, because iOS Safari rejects share calls that happen too long after the tap. If file sharing isn't supported, it shares a text link instead, and if that fails too, it copies the text to the clipboard.
- **In-app browsers** (Instagram, Facebook, LinkedIn and others) often ignore downloads. In those, Download opens the image full screen with a "press and hold to save" prompt.
- Share text names the personality and event only, never the nickname.

E2E tests download real PNGs and check their dimensions and that they aren't blank. Playwright's WebKit can't run on macOS 14 or older, so the Safari project is skipped there automatically. It runs on macOS 15+ and Linux CI.

## Roadmap

- [x] **Phase 1**: attendee experience with local data and deterministic scoring
- [ ] **Phase 2**: Firebase anonymous auth, Firestore persistence, security rules, server-side validation and rate limits
- [x] **Phase 3a**: PNG export (Story and Square), native share with fallbacks
- [ ] **Phase 3b**: public card links (`/card/[publicId]`) with opt-in and revocation, which needs Phase 2
- [ ] **Phase 4**: organizer dashboard, event controls, QR code, "What Is Toronto's AI DNA?" projector mode
- [ ] **Phase 5**: optional Gemini personalization with fallback and caching
- [ ] **Phase 6**: load testing, Playwright mobile tests, App Hosting config, deployment and event-day runbooks

## Branding

No official Google or GDG assets are bundled. Event name, hashtag, site URL and logo are configurable through `NEXT_PUBLIC_*` variables (see `.env.example`). Google-inspired accent colors are defined once in `src/lib/config/event.ts`.
