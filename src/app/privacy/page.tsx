import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { CONSENT_VERSION, EVENT } from "@/lib/config/event";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PageShell className="gap-5 pb-10">
      <h1 className="pt-4 font-display text-3xl font-bold">Privacy notice</h1>
      <div className="glass space-y-4 rounded-3xl p-5 text-sm leading-relaxed text-foreground/90">
        <p>
          AI DNA is a just-for-fun quiz for {EVENT.name}. It reflects your quiz answers. It is not a scientific or
          psychological assessment.
        </p>
        <h2 className="font-display text-base font-bold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>An optional nickname you choose.</li>
          <li>Your six quiz answers and the resulting personality.</li>
          <li>An anonymous, randomly generated session ID. No name, email or phone number.</li>
        </ul>
        <h2 className="font-display text-base font-bold">How it&apos;s used</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>To show you your result and card.</li>
          <li>To show anonymous totals (for example, how many Builders took part) on event screens.</li>
          <li>
            Your card is only public if you turn on sharing, and you can turn it off at any time. Your individual
            answers are never public.
          </li>
          <li>
            If AI personalization is on, your answers (never your nickname) may be sent to Google&apos;s Gemini API to
            write a short description.
          </li>
        </ul>
        <h2 className="font-display text-base font-bold">How long we keep it</h2>
        <p>
          Event data is deleted after the event according to the organizers&apos; retention policy. Anonymous
          aggregate totals may be kept. You can clear your result from this device at any time by retaking the
          quiz.
        </p>
        <p className="text-xs text-muted-foreground">Notice version {CONSENT_VERSION}</p>
      </div>
      <Link href="/" className="text-center text-sm underline underline-offset-2">
        Back to AI DNA
      </Link>
    </PageShell>
  );
}
