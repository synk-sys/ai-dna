import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { artColors, completeQuiz, pngSize } from "./helpers";

// A real export scores well above this in the artwork area; one that lost its image scores near 1.
const MIN_ART_COLORS = 8;

test.describe("card PNG export", () => {
  test("downloads a 1080×1920 story PNG", async ({ page }, testInfo) => {
    await completeQuiz(page, "builder");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("ai-dna-builder-story.png");

    const path = testInfo.outputPath("story.png");
    await download.saveAs(path);
    const buf = await readFile(path);
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1920 });
    expect(await artColors(page, buf, "story")).toBeGreaterThan(MIN_ART_COLORS);
    await expect(page.getByText(/Card saved/)).toBeVisible();
  });

  test("downloads a 1080×1080 square PNG", async ({ page }, testInfo) => {
    await completeQuiz(page, "connector");
    await page.getByRole("tab", { name: "Square" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("ai-dna-connector-square.png");

    const path = testInfo.outputPath("square.png");
    await download.saveAs(path);
    const buf = await readFile(path);
    expect(pngSize(buf)).toEqual({ width: 1080, height: 1080 });
    expect(await artColors(page, buf, "square")).toBeGreaterThan(MIN_ART_COLORS);
  });

  test("shows an error instead of exporting a card with no art, then recovers", async ({ page }, testInfo) => {
    await page.route("**/art/**", (route) => route.abort());
    await completeQuiz(page, "creator");
    await page.getByRole("button", { name: "Download" }).click();
    await expect(page.getByText(/couldn't create your image/)).toBeVisible();

    await page.unroute("**/art/**");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download" }).click();
    const path = testInfo.outputPath("retry.png");
    await (await downloadPromise).saveAs(path);
    expect(await artColors(page, await readFile(path), "story")).toBeGreaterThan(MIN_ART_COLORS);
  });

  test("shares the PNG through the native share sheet", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __shared?: { name: string; type: string; size: number; text?: string } };
      Object.defineProperty(navigator, "canShare", { value: () => true, configurable: true });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data: ShareData) => {
          const f = data.files![0]!;
          w.__shared = { name: f.name, type: f.type, size: f.size, text: data.text };
        },
      });
    });
    await completeQuiz(page, "explorer");
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText(/Thanks for sharing/)).toBeVisible();
    const shared = await page.evaluate(() => (window as unknown as { __shared: unknown }).__shared);
    expect(shared).toMatchObject({ name: "ai-dna-explorer-story.png", type: "image/png" });
    expect((shared as { size: number }).size).toBeGreaterThan(50_000);
    expect((shared as { text: string }).text).toContain("The Explorer");
  });

  test("falls back to copying text when sharing is unavailable", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Clipboard permissions can't be granted in WebKit");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
      Object.defineProperty(navigator, "canShare", { value: undefined, configurable: true });
    });
    await completeQuiz(page, "creator");
    await page.getByRole("button", { name: "Share" }).click();
    await expect(page.getByText(/Copied!/)).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("The Creator");
  });
});

test.describe("in-app browsers", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0",
  });

  test("shows the image to press-and-hold instead of downloading", async ({ page }) => {
    await completeQuiz(page, "strategist");
    await page.getByRole("button", { name: "Download" }).click();
    const dialog = page.getByRole("dialog", { name: "Save your card" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img", { name: "Your AI DNA card" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
