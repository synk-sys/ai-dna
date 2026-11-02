import { expect, test } from "@playwright/test";
import { completeQuiz } from "./helpers";

async function expectNoHorizontalScroll(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

test("completes the quiz and shows the right personality", async ({ page }) => {
  await completeQuiz(page, "visionary", "Ada");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/The Visionary/);
  await expect(page.getByText("Ada's AI DNA").first()).toBeVisible();
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
  await page.getByRole("tab", { name: "Square" }).click();
  await expectNoHorizontalScroll(page);
  await page.goto("/privacy");
  await expectNoHorizontalScroll(page);
});
