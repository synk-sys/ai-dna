import { expect, test } from "@playwright/test";
import { ARCHETYPE_IDS } from "../src/lib/quiz/archetypes";
import { fallbackDescription } from "../src/lib/quiz/scoring";
import { completeQuiz } from "./helpers";

async function expectNoHorizontalScroll(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test("completes the quiz and shows the right personality", async ({ page }) => {
  await completeQuiz(page, "visionary", "Ada");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/The Visionary/);
  await expect(page.getByText("Ada AI DNA").first()).toBeVisible();
});

test("resumes an in-progress quiz after a refresh", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Start the quiz/ }).click();
  await page.waitForURL("**/quiz");
  await page.locator('[data-option-id="q1-creator"]').click();
  await expect(page.getByText("Question 2", { exact: true })).toBeVisible();
  await page.locator('[data-option-id="q2-creator"]').click();
  await expect(page.getByText("Question 3", { exact: true })).toBeVisible();
  const order = await page.locator("[data-option-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-option-id")));

  await page.reload();
  await expect(page.getByText("Question 3", { exact: true })).toBeVisible();
  const after = await page.locator("[data-option-id]").evaluateAll((els) => els.map((e) => e.getAttribute("data-option-id")));
  expect(after).toEqual(order);
});

test("mobile layout has no horizontal scroll on attendee pages", async ({ page }) => {
  await page.goto("/");
  await expectNoHorizontalScroll(page);
  await completeQuiz(page, "connector");
  await expectNoHorizontalScroll(page);
  await page.getByRole("tab", { name: "Post" }).click();
  await expectNoHorizontalScroll(page);
  await page.goto("/privacy");
  await expectNoHorizontalScroll(page);
});

for (const primary of ARCHETYPE_IDS) {
  test(`${primary} card text fits inside the frame in both formats`, async ({ page }) => {
    // Worst case: the longest description this persona can get and a maximum-length name.
    const personalizedDescription = ARCHETYPE_IDS.filter((id) => id !== primary)
      .map((id) => fallbackDescription(primary, id))
      .sort((a, b) => b.length - a.length)[0]!;
    const scores = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, { total: 1, direct: 0, related: 0, lastDirectPick: -1 }]));
    await page.goto("/privacy");
    await page.evaluate(
      (result) => localStorage.setItem("aidna:result", JSON.stringify(result)),
      { v: 1, submissionId: "x".repeat(20), nickname: "W".repeat(24), primary, secondary: "builder", scores, personalizedDescription, scoringVersion: "2026.1", completedAt: 1, synced: false },
    );
    await page.goto("/result");
    await page.getByRole("button", { name: "Download" }).waitFor();

    // Measures the unscaled off-screen export copies. The frame's inner line sits 3.5% in from each side.
    const problems = await page.locator("[inert] [data-card-layout]").evaluateAll((cards) =>
      cards.flatMap((card) => {
        const layout = card.getAttribute("data-card-layout");
        const box = card.getBoundingClientRect();
        const inset = (box.width * 36) / 1080;
        const issues: string[] = [];
        const rect = (sel: string) => card.querySelector(sel)!.getBoundingClientRect();
        if (rect(".dna-card__insights").bottom > box.bottom - inset) issues.push(`${layout}: insights cross the frame`);
        if (rect(".dna-card__event").top < box.top + inset) issues.push(`${layout}: header crosses the frame`);
        for (const sel of [".dna-card__event", ".dna-card__owner", ".dna-card__title > span:last-child", ".dna-card__description"]) {
          const r = rect(sel);
          if (r.left < box.left + inset || r.right > box.right - inset) issues.push(`${layout}: ${sel} crosses the frame`);
        }
        return issues;
      }),
    );
    expect(problems).toEqual([]);
  });
}
