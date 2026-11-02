"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearProgress, firstUnanswered, loadProgress, startProgress, type QuizProgress } from "@/lib/client/progress";
import { clearResult, loadResult, type StoredResult } from "@/lib/client/results";
import { ARCHETYPES } from "@/lib/quiz/archetypes";
import { QUESTIONS } from "@/lib/quiz/questions";
import { NICKNAME_MAX, nicknameSchema } from "@/lib/quiz/schema";

export function StartPanel() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ progress: QuizProgress | null; result: StoredResult | null } | null>(null);

  useEffect(() => {
    // Read device storage after mount so server and client markup match.
    setSaved({ progress: loadProgress(), result: loadResult() });
    router.prefetch("/quiz");
  }, [router]);

  function start(event: React.FormEvent) {
    event.preventDefault();
    const parsed = nicknameSchema.safeParse(nickname);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please choose a different nickname");
      return;
    }
    clearResult();
    startProgress(parsed.data);
    router.push("/quiz");
  }

  const answered = saved?.progress ? firstUnanswered(saved.progress.answers) : 0;
  const canResume = !!saved?.progress && answered > 0 && answered < QUESTIONS.length && !saved.result;

  if (saved?.result) {
    const a = ARCHETYPES[saved.result.primary];
    return (
      <section className="glass space-y-4 rounded-3xl p-5 text-center">
        <p className="text-sm text-muted-foreground">Welcome back! Your AI DNA is</p>
        <p className="font-display text-2xl font-bold" style={{ color: a.colors.primary }}>
          <span aria-hidden="true">{a.emoji} </span>
          {a.name}
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/result">
            View my card <ArrowRight />
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            clearResult();
            clearProgress();
            setSaved({ progress: null, result: null });
          }}
        >
          <RotateCcw /> Take it again
        </Button>
      </section>
    );
  }

  return (
    <section className="glass rounded-3xl p-5">
      {canResume ? (
        <div className="mb-4 space-y-3">
          <Button size="lg" className="w-full" onClick={() => router.push("/quiz")}>
            Resume quiz ({answered}/{QUESTIONS.length}) <ArrowRight />
          </Button>
          <div className="text-center text-xs text-muted-foreground">or start over below</div>
        </div>
      ) : null}
      <form onSubmit={start} className="space-y-3" noValidate>
        <label htmlFor="nickname" className="block text-sm font-medium">
          Nickname <span className="text-muted-foreground">(optional, shown on your card)</span>
        </label>
        <Input
          id="nickname"
          name="nickname"
          autoComplete="nickname"
          enterKeyHint="go"
          maxLength={NICKNAME_MAX * 2}
          placeholder="e.g. Pixel Pioneer"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "nickname-error" : "nickname-hint"}
        />
        {error ? (
          <p id="nickname-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p id="nickname-hint" className="text-xs text-muted-foreground">
            Up to {NICKNAME_MAX} characters. Skip it to stay anonymous.
          </p>
        )}
        <Button type="submit" size="lg" variant={canResume ? "secondary" : "default"} className="w-full">
          <Sparkles /> {canResume ? "Start fresh" : "Start the quiz"}
        </Button>
      </form>
    </section>
  );
}
