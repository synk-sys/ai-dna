import { describe, expect, it, vi } from "vitest";
import { cardFileName, exportSize } from "./export";
import { isInAppBrowser, shareCardImage, shareLink, shareText } from "./share";
import { ARCHETYPES } from "@/lib/quiz/archetypes";

const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });

function fakeNavigator(overrides: Partial<Navigator>): Navigator {
  return overrides as Navigator;
}

describe("export sizing", () => {
  it("exports stories at 1080×1920 and squares at 1080×1080", () => {
    expect(exportSize("portrait")).toMatchObject({ width: 1080, height: 1920 });
    expect(exportSize("square")).toMatchObject({ width: 1080, height: 1080 });
  });

  it("names files by archetype and layout", () => {
    expect(cardFileName("builder", "portrait")).toBe("ai-dna-builder-story.png");
    expect(cardFileName("connector", "square")).toBe("ai-dna-connector-square.png");
  });
});

describe("shareCardImage", () => {
  it("shares the PNG as a file when supported", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const nav = fakeNavigator({ share, canShare: () => true });
    await expect(shareCardImage(png, "card.png", "explorer", nav)).resolves.toBe("shared");
    const data = share.mock.calls[0]![0] as ShareData;
    expect(data.files?.[0]?.name).toBe("card.png");
    expect(data.files?.[0]?.type).toBe("image/png");
    expect(data.text).toContain("The Explorer");
  });

  it("reports unsupported when files can't be shared", async () => {
    const share = vi.fn();
    const nav = fakeNavigator({ share, canShare: () => false });
    await expect(shareCardImage(png, "card.png", "explorer", nav)).resolves.toBe("unsupported");
    expect(share).not.toHaveBeenCalled();
  });

  it("reports unsupported without the Web Share API", async () => {
    await expect(shareCardImage(png, "card.png", "explorer", fakeNavigator({}))).resolves.toBe("unsupported");
  });

  it("treats a dismissed share sheet as cancelled, not an error", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("dismissed", "AbortError"));
    const nav = fakeNavigator({ share, canShare: () => true });
    await expect(shareCardImage(png, "card.png", "explorer", nav)).resolves.toBe("cancelled");
  });

  it("rethrows other share errors", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("nope", "NotAllowedError"));
    const nav = fakeNavigator({ share, canShare: () => true });
    await expect(shareCardImage(png, "card.png", "explorer", nav)).rejects.toThrow();
  });
});

describe("shareLink", () => {
  it("shares text and a URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(shareLink("creator", fakeNavigator({ share }))).resolves.toBe("shared");
    expect((share.mock.calls[0]![0] as ShareData).url).toBeTruthy();
  });
});

describe("shareText", () => {
  it("mentions the personality and never the nickname", () => {
    for (const a of Object.values(ARCHETYPES)) {
      const text = shareText(a.id);
      expect(text).toContain(a.name);
      expect(text).toContain(a.superpower);
    }
  });
});

describe("isInAppBrowser", () => {
  it("detects common in-app browsers", () => {
    expect(isInAppBrowser("Mozilla/5.0 (iPhone) Instagram 300.0")).toBe(true);
    expect(isInAppBrowser("Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/400]")).toBe(true);
    expect(isInAppBrowser("Mozilla/5.0 (Linux; Android 14; wv) LinkedInApp")).toBe(true);
  });

  it("does not flag regular mobile browsers", () => {
    expect(
      isInAppBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
    ).toBe(false);
    expect(
      isInAppBrowser("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"),
    ).toBe(false);
  });
});
