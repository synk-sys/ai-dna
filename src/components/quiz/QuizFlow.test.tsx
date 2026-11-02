import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuizFlow } from "./QuizFlow";
import { loadProgress, startProgress } from "@/lib/client/progress";
import { loadResult } from "@/lib/client/results";
import { QUESTIONS } from "@/lib/quiz/questions";

const router = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

function optionIds() {
  return within(screen.getByRole("radiogroup"))
    .getAllByRole("radio")
    .map((el) => el.getAttribute("data-option-id"));
}

async function answerCurrent(user: ReturnType<typeof userEvent.setup>, primary: string) {
  const heading = await screen.findByRole("heading", { level: 1 });
  const question = QUESTIONS.find((q) => q.prompt === heading.textContent)!;
  await user.click(screen.getByRole("radio", { name: question.options.find((o) => o.primary === primary)!.text }));
  // Wait for auto-advance (or submission on the last question).
  await waitFor(() => expect(screen.queryByRole("heading", { name: question.prompt })).not.toBeInTheDocument());
}

beforeEach(() => {
  router.push.mockReset();
  router.replace.mockReset();
});

describe("QuizFlow", () => {
  it("shows the first question with six options", async () => {
    render(<QuizFlow />);
    expect(await screen.findByRole("heading", { name: QUESTIONS[0]!.prompt })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(6);
  });

  it("randomizes answer order per attendee but keeps scoring ids", async () => {
    const orders = new Set<string>();
    for (let i = 0; i < 6; i++) {
      window.localStorage.clear();
      const { unmount } = render(<QuizFlow />);
      await screen.findByRole("radiogroup");
      const ids = optionIds();
      expect([...ids].sort()).toEqual(QUESTIONS[0]!.options.map((o) => o.id).sort());
      orders.add(ids.join());
      unmount();
    }
    expect(orders.size).toBeGreaterThan(1);
  });

  it("resumes at the same question and order after a refresh", async () => {
    const user = userEvent.setup();
    startProgress("Ada");
    const first = render(<QuizFlow />);
    await answerCurrent(user, "builder");
    await answerCurrent(user, "builder");
    await screen.findByRole("heading", { name: QUESTIONS[2]!.prompt });
    const orderBefore = optionIds();
    first.unmount();

    render(<QuizFlow />);
    expect(await screen.findByRole("heading", { name: QUESTIONS[2]!.prompt })).toBeInTheDocument();
    expect(optionIds()).toEqual(orderBefore);
    expect(loadProgress()?.answers).toEqual({ q1: "q1-builder", q2: "q2-builder" });
  });

  it("lets attendees go back and see their earlier choice", async () => {
    const user = userEvent.setup();
    render(<QuizFlow />);
    await answerCurrent(user, "explorer");
    await user.click(screen.getByRole("button", { name: "Previous question" }));
    await screen.findByRole("heading", { name: QUESTIONS[0]!.prompt });
    expect(screen.getByRole("radio", { checked: true })).toHaveAttribute("data-option-id", "q1-explorer");
  });

  it("completes the quiz, stores the result and goes to /result", async () => {
    const user = userEvent.setup();
    startProgress("Grace");
    render(<QuizFlow />);
    for (const primary of ["connector", "connector", "creator", "connector", "strategist", "connector"]) {
      await answerCurrent(user, primary);
    }
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/result"), { timeout: 3000 });
    const result = loadResult();
    expect(result?.primary).toBe("connector");
    expect(result?.nickname).toBe("Grace");
    expect(loadProgress()).toBeNull();
  });

  it("shows a retry state when submission fails and recovers", async () => {
    const user = userEvent.setup();
    const submit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ primary: "builder" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<QuizFlow submitter={{ submit }} />);
    for (let i = 0; i < 6; i++) await answerCurrent(user, "builder");
    await user.click(await screen.findByRole("button", { name: /try again/i }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/result"), { timeout: 3000 });
    expect(submit).toHaveBeenCalledTimes(2);
    // Both attempts reuse the same idempotency key.
    expect(submit.mock.calls[0]![0].submissionId).toBe(submit.mock.calls[1]![0].submissionId);
  });

  it("submits immediately if every answer was already saved", async () => {
    const p = startProgress("");
    window.localStorage.setItem(
      "aidna:progress",
      JSON.stringify({ ...p, answers: Object.fromEntries(QUESTIONS.map((q) => [q.id, `${q.id}-visionary`])) }),
    );
    await act(async () => {
      render(<QuizFlow />);
    });
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/result"), { timeout: 3000 });
    expect(loadResult()?.primary).toBe("visionary");
  });
});
