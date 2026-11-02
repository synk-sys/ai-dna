import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom lacks these browser APIs. Tests run as if the user prefers reduced
// motion, which also keeps animated sequences short.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
