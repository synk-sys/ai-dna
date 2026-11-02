import type { Metadata } from "next";
import { Backdrop } from "@/components/brand/Backdrop";
import { QuizFlow } from "@/components/quiz/QuizFlow";

export const metadata: Metadata = { title: "Quiz", robots: { index: false } };

export default function QuizPage() {
  return (
    <>
      <Backdrop />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 sm:max-w-lg">
        <QuizFlow />
      </div>
    </>
  );
}
