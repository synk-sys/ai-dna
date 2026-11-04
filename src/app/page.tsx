import Link from "next/link";
import { ArchetypeArt } from "@/components/art/ArchetypeArt";
import { DnaHelix } from "@/components/brand/DnaHelix";
import { EventBadge } from "@/components/brand/Logo";
import { PageShell } from "@/components/PageShell";
import { StartPanel } from "@/components/landing/StartPanel";
import { ARCHETYPE_IDS, ARCHETYPES } from "@/lib/quiz/archetypes";

export default function LandingPage() {
  return (
    <PageShell className="gap-8 pb-10">
      <section className="relative pt-4 text-center">
        <div className="pointer-events-none absolute -top-6 left-1/2 -z-10 -translate-x-1/2 opacity-40 blur-[1px]">
          <DnaHelix width={140} height={260} rungs={12} />
        </div>
        <EventBadge />
        <h1 className="mt-6 font-display text-[44px] leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl">
          Discover your <span className="text-gradient-google">AI DNA</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-base text-muted-foreground text-balance">
          Six questions. About sixty seconds. One collectible card that shows how you think about AI.
        </p>
      </section>

      <StartPanel />

      <section aria-labelledby="six-heading">
        <h2 id="six-heading" className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Six personalities. Which one are you?
        </h2>
        <ul className="mt-4 grid grid-cols-3 gap-2.5">
          {ARCHETYPE_IDS.map((id) => {
            const a = ARCHETYPES[id];
            return (
              <li
                key={id}
                className="overflow-hidden rounded-2xl"
                style={{ boxShadow: `0 0 0 1px ${a.colors.primary}55`, background: a.colors.deep }}
              >
                <ArchetypeArt id={id} className="aspect-square w-full" />
                <div className="px-2 py-2 text-center">
                  <div className="text-[11px] leading-tight font-semibold">
                    <span aria-hidden="true">{a.emoji} </span>
                    {a.name.replace("The ", "")}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="space-y-2 text-center text-xs text-muted-foreground">
        <p>
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy notice
          </Link>
        </p>
      </footer>
    </PageShell>
  );
}
