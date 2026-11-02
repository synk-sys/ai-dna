import { release } from "node:os";
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

// Playwright only ships a frozen, protocol-incompatible WebKit for macOS 14
// and older (Darwin <= 23). Run Safari tests on macOS 15+ or Linux/CI.
const webkitUnsupported = process.platform === "darwin" && Number(release().split(".")[0]) <= 23;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    ...(webkitUnsupported ? [] : [{ name: "mobile-safari", use: { ...devices["iPhone 13"] } }]),
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
