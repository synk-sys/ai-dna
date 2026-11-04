import { expect, type Page } from "@playwright/test";

/** Starts the quiz from the landing page and picks `primary` for every question. */
export async function completeQuiz(page: Page, primary = "builder", nickname = "Pixel Pioneer") {
  await page.goto("/");
  await page.getByLabel(/Nickname/).fill(nickname);
  await page.getByRole("button", { name: /Start the quiz/ }).click();
  await page.waitForURL("**/quiz");
  for (let i = 1; i <= 6; i++) {
    await expect(page.getByText(`Question ${i}`, { exact: true })).toBeVisible();
    await page.locator(`[data-option-id="q${i}-${primary}"]`).click();
  }
  await page.waitForURL("**/result", { timeout: 10_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The");
}

/** Reads width and height from a PNG's IHDR chunk. */
export function pngSize(buf: Buffer): { width: number; height: number } {
  expect(buf.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Where the artwork sits in each export, as fractions of the image. */
const ART_REGION = {
  story: { x: 0.15, y: 0.14, w: 0.7, h: 0.39 },
  post: { x: 0.28, y: 0.2, w: 0.44, h: 0.33 },
};

/**
 * Decodes a PNG in the page and counts distinct colors on a sample grid inside
 * the artwork area. An export that lost its image is nearly one flat color there.
 */
export async function artColors(page: Page, buf: Buffer, format: keyof typeof ART_REGION): Promise<number> {
  return page.evaluate(
    async ({ b64, region }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const colors = new Set<string>();
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          const px = (region.x + ((x + 0.5) / 20) * region.w) * img.naturalWidth;
          const py = (region.y + ((y + 0.5) / 20) * region.h) * img.naturalHeight;
          const d = ctx.getImageData(Math.floor(px), Math.floor(py), 1, 1).data;
          colors.add(`${d[0]! >> 4},${d[1]! >> 4},${d[2]! >> 4}`);
        }
      }
      return colors.size;
    },
    { b64: buf.toString("base64"), region: ART_REGION[format] },
  );
}
